"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Categoria } from "@/types/domain";

export function FiltrosPagos({
  categorias,
  estadoActual,
  categoriaActual,
  miembroActual,
}: {
  categorias: Categoria[];
  estadoActual?: string;
  categoriaActual?: string;
  miembroActual?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function update(next: { estado?: string; categoria?: string }) {
    const estado = next.estado ?? estadoActual ?? "";
    const categoria = next.categoria ?? categoriaActual ?? "";
    const params = new URLSearchParams();
    if (estado) params.set("estado", estado);
    if (categoria) params.set("categoria", categoria);
    if (miembroActual) params.set("miembro", miembroActual);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex gap-2">
      <select
        value={estadoActual ?? ""}
        onChange={(e) => update({ estado: e.target.value })}
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
      >
        <option value="">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="pagado">Pagado</option>
        <option value="vencido">Vencido</option>
      </select>
      <select
        value={categoriaActual ?? ""}
        onChange={(e) => update({ categoria: e.target.value })}
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
      >
        <option value="">Todas las categorías</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
