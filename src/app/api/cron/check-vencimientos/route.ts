import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushNotification } from "@/lib/push/web-push";
import { formatMonto, formatFecha, hoyISO } from "@/lib/format";

const DIAS_AVISO = 3;

// Llamado por Vercel Cron (ver vercel.json) una vez al día. También se puede
// disparar a mano para pruebas:
//   curl -H "Authorization: Bearer $CRON_SECRET" https://<app>/api/cron/check-vencimientos
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const hoy = hoyISO();
  const limite = new Date();
  limite.setDate(limite.getDate() + DIAS_AVISO);
  const limiteISO = limite.toISOString().slice(0, 10);

  // 1. Lo que pasó de fecha sin pagarse pasa a "vencido"; si era recurrente,
  //    se genera la siguiente ocurrencia (si todavía no existía).
  const { data: vencidos } = await supabase
    .from("pagos")
    .update({ estado: "vencido" })
    .lt("fecha_vencimiento", hoy)
    .eq("estado", "pendiente")
    .select("id, recurrencia, recurrencia_activa");

  for (const pago of vencidos ?? []) {
    if (pago.recurrencia !== "ninguna" && pago.recurrencia_activa) {
      await supabase.rpc("generar_siguiente_ocurrencia", {
        p_pago_id: pago.id,
      });
    }
  }

  // 2. Notifica lo que vence pronto (o ya venció) y todavía no se avisó.
  const { data: porNotificar } = await supabase
    .from("pagos")
    .select("id, user_id, nombre, monto, fecha_vencimiento, estado")
    .in("estado", ["pendiente", "vencido"])
    .is("ultima_notificacion_enviada", null)
    .lte("fecha_vencimiento", limiteISO);

  let pushEnviados = 0;
  let suscripcionesExpiradas = 0;

  for (const pago of porNotificar ?? []) {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", pago.user_id);

    if (subs && subs.length > 0) {
      const titulo =
        pago.estado === "vencido"
          ? `${pago.nombre} está vencido`
          : `${pago.nombre} vence pronto`;
      const cuerpo = `${formatMonto(pago.monto)} · vence ${formatFecha(pago.fecha_vencimiento)}`;

      for (const sub of subs) {
        const resultado = await sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          { title: titulo, body: cuerpo, url: `/pagos/${pago.id}` }
        );

        if (resultado.ok) {
          pushEnviados++;
        } else if (resultado.expired) {
          suscripcionesExpiradas++;
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }

    // Se marca como notificado igual si no hay suscripciones, para no
    // reintentar en cada corrida del cron.
    await supabase
      .from("pagos")
      .update({ ultima_notificacion_enviada: new Date().toISOString() })
      .eq("id", pago.id);
  }

  return NextResponse.json({
    vencidos: vencidos?.length ?? 0,
    a_notificar: porNotificar?.length ?? 0,
    push_enviados: pushEnviados,
    suscripciones_expiradas: suscripcionesExpiradas,
  });
}
