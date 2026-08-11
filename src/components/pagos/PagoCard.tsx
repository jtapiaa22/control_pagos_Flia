import Link from "next/link";
import { formatMonto, formatFecha } from "@/lib/format";
import { EstadoBadge } from "@/components/pagos/EstadoBadge";
import { obtenerEstiloCategoria } from "@/lib/pagos/categorias";
import type { Pago } from "@/types/domain";


function esMEsSiguiente(fechaIso: string) {
  const hoy = new Date();
  const fecha = new Date(`${fechaIso}T00:00:00`);

  const mesSiguiente = new Date(
    hoy.getFullYear(),
    hoy.getMonth() + 1,
    1
  );

  return (
    fecha.getFullYear() === mesSiguiente.getFullYear() && fecha.getMonth() === mesSiguiente.getMonth()
  );
}


export function PagoCard({ pago }: { pago: Pago }) {
  const { icon: Icon, iconClass, bgClass } = obtenerEstiloCategoria(
    pago.categoria?.nombre
  );

  return (
    <Link
      href={`/pagos/${pago.id}`}
      className="flex items-start gap-3 px-4 py-2 transition hover:bg-surface-hover"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bgClass}`}
      >
        <Icon className={`h-[18px] w-[18px] ${iconClass}`} strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {pago.nombre}
        </p>

        <div className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-text-secondary">
          <span className="truncate">
            {pago.categoria?.nombre ?? "Sin categoría"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 text-xs text-text-secondary">
          <span className="shrink-0">
            Vence {formatFecha(pago.fecha_vencimiento)}
          </span>

          {esMEsSiguiente(pago.fecha_vencimiento) && (
            <span className="shrink-0 rounded-md bg-surface-sunken px-1.5 py-0.5 text-[10px] font-medium text-status-due-fg">
              Siguiente mes
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="tabular-amount text-sm font-medium text-text-primary">
          {formatMonto(pago.monto)}
        </span>
        <EstadoBadge estado={pago.estado} />
      </div>
    </Link>
  );
}
