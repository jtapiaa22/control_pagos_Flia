"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      title="Cerrar sesión"
      className="rounded-md p-1.5 text-text-tertiary transition hover:bg-surface-hover hover:text-text-primary"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
