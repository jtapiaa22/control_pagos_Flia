import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/roles";
import { crearUsuarioSchema } from "@/lib/admin/validation";

// Sole account-creation entry point. There is no public sign-up anywhere in
// the app, so this route is the only way a new profile row can ever appear
// outside of the trigger on auth.users. It re-verifies admin status itself
// (never trusts the client) before touching the service-role client.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isAdmin(profile.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = crearUsuarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const { email, nombre_completo, password } = parsed.data;

  const admin = createAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre_completo, role: "member" },
  });

  if (error) {
    const message = error.message.includes("already been registered")
      ? "Ya existe una cuenta con ese email."
      : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ id: created.user?.id }, { status: 201 });
}
