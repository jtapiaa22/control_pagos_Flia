import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Borra TODAS las cuotas de un mismo plan (misma serie_id) de una sola vez
// — pagadas y pendientes — a diferencia de DELETE /api/pagos/[id], que solo
// borra esa fila puntual. Pensado para cuando un plan de cuotas se cargó
// mal y hay que empezar de nuevo, en vez de borrar cuota por cuota.
export async function DELETE(
  _request: Request,
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

  // RLS (pagos_select_own / pagos_select_admin) limita esto a lo que el
  // usuario puede ver; si no es dueño, .single() no encuentra la fila.
  const { data: pago, error: fetchError } = await supabase
    .from("pagos")
    .select("id, recurrencia, serie_id")
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

  const serieId = pago.serie_id ?? pago.id;

  const { data: filas, error: listError } = await supabase
    .from("pagos")
    .select("id, adjunto_path")
    .eq("serie_id", serieId);

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 400 });
  }

  const ids = (filas ?? []).map((f) => f.id);

  // RLS (pagos_delete_own) solo deja borrar filas propias; como toda una
  // serie pertenece siempre al mismo usuario, esto no puede afectar
  // cuotas de otra persona.
  const { error: deleteError } = await supabase.from("pagos").delete().in("id", ids);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  const adjuntos = (filas ?? [])
    .map((f) => f.adjunto_path)
    .filter((path): path is string => Boolean(path));

  if (adjuntos.length > 0) {
    await supabase.storage.from("adjuntos").remove(adjuntos);
  }

  return NextResponse.json({ ok: true, eliminadas: ids.length });
}
