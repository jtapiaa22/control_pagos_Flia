import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";
import type { UserRole } from "@/types/database.types";

export interface SessionProfile {
  id: string;
  email: string;
  nombre_completo: string;
  role: UserRole;
}

// UX-level guard only. The real enforcement is Postgres RLS — see
// supabase/migrations/0002_rls_policies.sql.
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, nombre_completo, role")
    .eq("id", user.id)
    .single();

  return profile ?? null;
}

export async function requireUser(): Promise<SessionProfile> {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireAdmin(): Promise<SessionProfile> {
  const profile = await requireUser();
  if (!isAdmin(profile.role)) redirect("/dashboard");
  return profile;
}
