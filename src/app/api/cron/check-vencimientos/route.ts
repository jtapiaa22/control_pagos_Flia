import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushNotification } from "@/lib/push/web-push";
import { formatMonto, formatFecha, hoyISO } from "@/lib/format";

// Días antes del vencimiento en los que se manda un recordatorio. 0 = el
// mismo día. -1 es un marcador especial (no un umbral real): se usa para el
// aviso único de "recién se venció", disparado en el mismo paso que marca
// el pago como vencido.
const UMBRALES_AVISO = [5, 2, 1, 0] as const;
const AVISO_VENCIDO = -1;

function tituloAviso(nombre: string, diasAntes: number): string {
  if (diasAntes === AVISO_VENCIDO) return `${nombre} está vencido`;
  if (diasAntes === 0) return `${nombre} vence hoy`;
  if (diasAntes === 1) return `${nombre} vence mañana`;
  return `${nombre} vence en ${diasAntes} días`;
}

function sumarDias(fechaISO: string, dias: number): string {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + dias)).toISOString().slice(0, 10);
}

interface PagoParaAvisar {
  id: string;
  user_id: string;
  nombre: string;
  monto: number;
  fecha_vencimiento: string;
}

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

  let pushEnviados = 0;
  let suscripcionesExpiradas = 0;
  let avisosOmitidosPorDuplicado = 0;

  // Envía el push a todos los dispositivos del usuario y registra en
  // pago_notificaciones que este umbral ya se avisó, para no repetirlo si
  // el cron corre más de una vez el mismo día. Devuelve false si ya estaba
  // registrado (nada que hacer).
  async function avisar(pago: PagoParaAvisar, diasAntes: number) {
    const { error: insertError } = await supabase
      .from("pago_notificaciones")
      .insert({ pago_id: pago.id, dias_antes: diasAntes });

    if (insertError) {
      // 23505 = unique_violation: este umbral ya se avisó antes.
      if (insertError.code === "23505") avisosOmitidosPorDuplicado++;
      return;
    }

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", pago.user_id);

    if (!subs || subs.length === 0) return;

    const titulo = tituloAviso(pago.nombre, diasAntes);
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

  // 1. Lo que pasó de fecha sin pagarse pasa a "vencido"; si era recurrente,
  //    se genera la siguiente ocurrencia (si todavía no existía). Se manda
  //    un único aviso de "recién vencido" por pago.
  const { data: vencidos } = await supabase
    .from("pagos")
    .update({ estado: "vencido" })
    .lt("fecha_vencimiento", hoy)
    .eq("estado", "pendiente")
    .select("id, user_id, nombre, monto, fecha_vencimiento, recurrencia, recurrencia_activa");

  for (const pago of vencidos ?? []) {
    if (pago.recurrencia !== "ninguna" && pago.recurrencia_activa) {
      await supabase.rpc("generar_siguiente_ocurrencia", {
        p_pago_id: pago.id,
      });
    }
    await avisar(pago, AVISO_VENCIDO);
  }

  // 2. Recordatorios en cada umbral (5, 2, 1 y 0 días antes). Se busca por
  //    fecha_vencimiento EXACTA (no <=) para que cada pago reciba un aviso
  //    por umbral, no uno solo la primera vez que entra en rango.
  let pagosRevisados = 0;
  for (const diasAntes of UMBRALES_AVISO) {
    const fechaObjetivo = sumarDias(hoy, diasAntes);

    const { data: pagos } = await supabase
      .from("pagos")
      .select("id, user_id, nombre, monto, fecha_vencimiento")
      .eq("estado", "pendiente")
      .eq("fecha_vencimiento", fechaObjetivo);

    for (const pago of pagos ?? []) {
      pagosRevisados++;
      await avisar(pago, diasAntes);
    }
  }

  return NextResponse.json({
    vencidos: vencidos?.length ?? 0,
    pagos_revisados: pagosRevisados,
    push_enviados: pushEnviados,
    avisos_omitidos_por_duplicado: avisosOmitidosPorDuplicado,
    suscripciones_expiradas: suscripcionesExpiradas,
  });
}
