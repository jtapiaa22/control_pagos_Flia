import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pagoUpdateSchema } from "@/lib/pagos/validation";

export async function PATCH(
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
  const parsed = pagoUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  // RLS (pagos_update_own) ya impide tocar pagos ajenos; si el id no es del
  // usuario, update simplemente no afecta filas y .single() falla con error.
  const { data: updated, error } = await supabase
    .from("pagos")
    .update(parsed.data)
    .eq("id", id)
    .select("*, categoria:categorias(id, nombre, icono)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const marcadoComoPagado = parsed.data.estado === "pagado";
  if (
    marcadoComoPagado &&
    updated.recurrencia !== "ninguna" &&
    updated.recurrencia_activa
  ) {
    await supabase.rpc("generar_siguiente_ocurrencia", { p_pago_id: id });
  }

  return NextResponse.json(updated);
}

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

  const { data: pago } = await supabase
    .from("pagos")
    .select("adjunto_path")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("pagos").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (pago?.adjunto_path) {
    await supabase.storage.from("adjuntos").remove([pago.adjunto_path]);
  }

  return NextResponse.json({ ok: true });
}
