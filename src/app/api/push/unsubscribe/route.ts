import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const endpoint: string | undefined = body?.endpoint;
  if (!endpoint) {
    return NextResponse.json({ error: "Falta el endpoint" }, { status: 400 });
  }

  // RLS (push_subscriptions_delete_own) ya limita esto a las suscripciones
  // del propio usuario, sin importar de quién sea el endpoint.
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
