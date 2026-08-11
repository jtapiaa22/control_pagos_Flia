import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pagoInputSchema } from "@/lib/pagos/validation";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = pagoInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  // user_id siempre se fuerza al usuario autenticado, nunca al del body:
  // RLS igual lo rechazaría si no coincidiera, pero así el error es claro.
  const { data, error } = await supabase
    .from("pagos")
    .insert({ ...parsed.data, user_id: user.id })
    .select("*, categoria:categorias(id, nombre, icono)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
