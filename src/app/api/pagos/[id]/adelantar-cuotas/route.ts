import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  cantidad: z.coerce.number().int().min(1).max(999),
  fecha_pago: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
});

// Marca varias cuotas seguidas como pagadas de una sola vez (algunas
// tarjetas permiten adelantar cuotas). Reutiliza la misma función SQL que
// ya genera la siguiente ocurrencia al pagar una cuota individual
// (generar_siguiente_ocurrencia) — la llama una vez por cada cuota que se
// va adelantando, hasta agotar la cantidad pedida o llegar a la última
// cuota del plan (ahí la función devuelve null y el plan queda cerrado).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  // RLS (pagos_select_own / pagos_select_admin) ya limita esto a lo que el
  // usuario puede ver; si no es dueño, .single() no encuentra la fila.
  const { data: pago, error: fetchError } = await supabase
    .from("pagos")
    .select("id, recurrencia, cuota_actual, cuotas_totales, estado")
    .eq("id", id)
    .single();

  if (fetchError || !pago) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  if (pago.recurrencia !== "cuotas") {
    return NextResponse.json(
      { error: "Este pago no es un plan de cuotas" },
      { status: 400 }
    );
  }

  if (pago.estado === "pagado") {
    return NextResponse.json(
      { error: "Este pago ya está pagado" },
      { status: 400 }
    );
  }

  // cuota_actual/cuotas_totales nunca son null cuando recurrencia='cuotas'
  // (constraint pagos_cuotas_check en la base).
  const restantes = pago.cuotas_totales! - pago.cuota_actual! + 1;
  const cantidad = Math.min(parsed.data.cantidad, restantes);

  let currentId = id;
  let cuotasPagadas = 0;

  for (let i = 0; i < cantidad; i++) {
    const { error: updateError } = await supabase
      .from("pagos")
      .update({ estado: "pagado", fecha_pago: parsed.data.fecha_pago })
      .eq("id", currentId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }
    cuotasPagadas++;

    const { data: nueva, error: rpcError } = await supabase.rpc(
      "generar_siguiente_ocurrencia",
      { p_pago_id: currentId }
    );

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 400 });
    }
    // Cuando la función SQL "no genera nada" (plan cerrado), PostgREST no
    // devuelve `null` sino un objeto con todas las columnas en null —
    // `!nueva` no lo detecta porque el objeto en sí es truthy.
    if (!nueva?.id) break;

    currentId = nueva.id;
  }

  return NextResponse.json({ ok: true, cuotas_pagadas: cuotasPagadas });
}
