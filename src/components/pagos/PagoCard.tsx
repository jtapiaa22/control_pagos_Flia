import Link from "next/link";
import { formatMonto, formatFecha } from "@/lib/format";
import { EstadoBadge } from "@/components/pagos/EstadoBadge";
import type { Pago } from "@/types/domain";

export function PagoCard({ pago }: { pago: Pago }) {
  return (
    <Link
      href={`/pagos/${pago.id}`}
      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
          {pago.nombre}
        </p>
        <p className="truncate text-xs text-gray-500 dark:text-neutral-400">
          {pago.categoria?.nombre ?? "Sin categoría"} · Vence{" "}
          {formatFecha(pago.fecha_vencimiento)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {formatMonto(pago.monto)}
        </span>
        <EstadoBadge estado={pago.estado} />
      </div>
    </Link>
  );
}
