import Link from "next/link";
import { UserPlus, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

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
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Familia
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            Cuentas con acceso a Control de Pagos.
          </p>
        </div>
        <Link
          href="/admin/usuarios/nuevo"
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <UserPlus className="h-4 w-4" />
          Nuevo miembro
        </Link>
      </div>

      <ul className="mt-6 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {usuarios?.map((u) => (
          <li key={u.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {u.nombre_completo}
              </p>
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                {u.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/pagos?miembro=${u.id}`}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <Receipt className="h-3.5 w-3.5" /> Ver pagos
              </Link>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  u.role === "admin"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                    : "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400"
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
