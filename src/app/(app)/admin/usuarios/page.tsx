import Link from "next/link";
import { UserPlus, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { primaryButtonClass } from "@/lib/ui";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data: usuarios } = await supabase
    .from("profiles")
    .select("id, nombre_completo, email, role, created_at")
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h2 font-semibold tracking-heading text-text-primary">
            Familia
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Cuentas con acceso a Control de Pagos.
          </p>
        </div>
        <Link href="/admin/usuarios/nuevo" className={primaryButtonClass}>
          <UserPlus className="h-4 w-4" />
          Nuevo miembro
        </Link>
      </div>

      <ul className="mt-6 divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
        {usuarios?.map((u) => (
          <li key={u.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {u.nombre_completo}
              </p>
              <p className="text-xs text-text-secondary">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/pagos?miembro=${u.id}`}
                className="flex items-center gap-1 text-xs text-text-link hover:text-text-link-hover hover:underline"
              >
                <Receipt className="h-3.5 w-3.5" /> Ver pagos
              </Link>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  u.role === "admin"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-surface-sunken text-text-secondary"
                }`}
              >
                {u.role === "admin" ? "Admin" : "Miembro"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
