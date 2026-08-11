import Link from "next/link";
import { EstadoBadge } from "@/components/pagos/EstadoBadge";
import { formatMonto, formatFecha } from "@/lib/format";
import { cardClass } from "@/lib/ui";
import type { Pago } from "@/types/domain";

export function HistorialPagos({ historial }: { historial: Pago[] }) {
  if (historial.length === 0) return null;

  const esSerieDeCuotas = historial.some((p) => p.recurrencia === "cuotas");

  return (
    <div className={`mt-4 ${cardClass}`}>
      <h2 className="text-sm font-medium text-text-primary">
        Historial de este servicio
      </h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-text-tertiary">
              <th className="pb-2 pr-3 font-medium">Vencimiento</th>
              {esSerieDeCuotas && (
                <th className="pb-2 pr-3 font-medium">Cuota</th>
              )}
              <th className="pb-2 pr-3 font-medium">Estado</th>
              <th className="pb-2 pr-3 font-medium">Pagado el</th>
              <th className="pb-2 font-medium">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {historial.map((p) => (
              <tr key={p.id}>
                <td className="py-2 pr-3">
                  <Link
                    href={`/pagos/${p.id}`}
                    className="text-text-link hover:text-text-link-hover hover:underline"
                  >
                    {formatFecha(p.fecha_vencimiento)}
                  </Link>
                </td>
                {esSerieDeCuotas && (
                  <td className="py-2 pr-3 text-text-secondary">
                    {p.recurrencia === "cuotas"
                      ? `${p.cuota_actual}/${p.cuotas_totales}`
                      : "—"}
                  </td>
                )}
                <td className="py-2 pr-3">
                  <EstadoBadge estado={p.estado} />
                </td>
                <td className="py-2 pr-3 text-text-secondary">
                  {p.fecha_pago ? formatFecha(p.fecha_pago) : "—"}
                </td>
                <td className="tabular-amount py-2 text-text-primary">
                  {formatMonto(p.monto)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
