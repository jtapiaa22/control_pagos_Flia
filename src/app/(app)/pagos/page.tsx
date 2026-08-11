import Link from "next/link";
import { Plus } from "lucide-react";
import { listarPagos, listarCategorias, obtenerPerfil } from "@/lib/pagos/queries";
import { PagoList } from "@/components/pagos/PagoList";
import { FiltrosPagos } from "@/components/pagos/FiltrosPagos";
import { primaryButtonClass } from "@/lib/ui";
import type { PagoEstado } from "@/types/database.types";

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; categoria?: string; miembro?: string }>;
}) {
  const params = await searchParams;
  const estado = params.estado as PagoEstado | undefined;
  const categoriaId = params.categoria;
  const miembroId = params.miembro;

  const [pagos, categorias, miembro] = await Promise.all([
    listarPagos({ estado, categoriaId, userId: miembroId }),
    listarCategorias(),
    miembroId ? obtenerPerfil(miembroId) : Promise.resolve(null),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-semibold tracking-heading text-text-primary">
          Pagos
        </h1>
        <Link href="/pagos/nuevo" className={primaryButtonClass}>
          <Plus className="h-4 w-4" />
          Nuevo pago
        </Link>
      </div>

      {miembro && (
        <div className="mt-3 flex items-center justify-between rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          <span>
            Viendo los pagos de <strong>{miembro.nombre_completo}</strong>{" "}
            (solo lectura)
          </span>
          <Link href="/pagos" className="underline">
            Volver a los míos
          </Link>
        </div>
      )}

      <div className="mt-4">
        <FiltrosPagos
          categorias={categorias}
          estadoActual={estado}
          categoriaActual={categoriaId}
          miembroActual={miembroId}
        />
      </div>

      <div className="mt-4">
        <PagoList pagos={pagos} />
      </div>
    </div>
  );
}
