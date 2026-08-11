import Link from "next/link";
import { listarPagos } from "@/lib/pagos/queries";
import { PagoList } from "@/components/pagos/PagoList";
import { formatMonto } from "@/lib/format";

function pad(n: number) {
  return String(n).padStart(2, "0");
}



export default async function DashboardPage() {
  const [pendientes, vencidos] = await Promise.all([
    listarPagos({ estado: "pendiente" }),
    listarPagos({ estado: "vencido" }),
  ]);

  const enSieteDias = new Date();
  enSieteDias.setDate(enSieteDias.getDate() + 7);
  const enSieteDiasISO = enSieteDias.toISOString().slice(0, 10);

  const vencenPronto = pendientes.filter(
    (p) => p.fecha_vencimiento <= enSieteDiasISO
  );
  const montoVencePronto = vencenPronto.reduce((acc, p) => acc + p.monto, 0);
  const montoVencido = vencidos.reduce((acc, p) => acc + p.monto, 0);

  // "Del mes" = solo lo que vence dentro del mes calendario actual, para no
  // mezclar en la misma suma las próximas ocurrencias de meses futuros
  // (por ejemplo, un recurrente ya generado para el mes que viene).
  const hoy = new Date();
  const inicioMesISO = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-01`;
  const ultimoDiaMes = new Date(
    hoy.getFullYear(),
    hoy.getMonth() + 1,
    0
  ).getDate();
  const finMesISO = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(ultimoDiaMes)}`;

  const pagosDelMes = [...pendientes, ...vencidos].filter(
    (p) => p.fecha_vencimiento >= inicioMesISO && p.fecha_vencimiento <= finMesISO
  );
  const pendienteDelMes = pagosDelMes.reduce((acc, p) => acc + p.monto, 0);

  return (
    <div>
      <h1 className="font-display text-h2 font-semibold tracking-heading text-text-primary">
        Inicio
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Resumen de tus vencimientos.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-pino-900 p-5">
          <span className="text-xs font-medium uppercase tracking-caps text-pino-300">
            Pendiente del mes
          </span>
          <p className="tabular-amount mt-2 text-amount-lg font-semibold text-paper-50">
            {formatMonto(pendienteDelMes)}
          </p>
          <p className="mt-1 text-xs text-pino-100/80">
            {pagosDelMes.length} pago{pagosDelMes.length === 1 ? "" : "s"} este
            mes
          </p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface-card p-5">
          <span className="text-xs font-medium uppercase tracking-caps text-text-tertiary">
            Atrasados
          </span>
          <p className="tabular-amount mt-2 text-amount-lg font-semibold text-status-overdue-fg">
            {formatMonto(montoVencido)}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {vencidos.length} pago{vencidos.length === 1 ? "" : "s"} vencido
            {vencidos.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface-card p-5">
          <span className="text-xs font-medium uppercase tracking-caps text-text-tertiary">
            Vencen en 7 días
          </span>
          <p className="tabular-amount mt-2 text-amount-lg font-semibold text-status-due-fg">
            {formatMonto(montoVencePronto)}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {vencenPronto.length} pago{vencenPronto.length === 1 ? "" : "s"}{" "}
            próximos
          </p>
        </div>
      </div>

      {vencidos.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-text-primary">Atrasados</h2>
          <div className="mt-2">
            <PagoList pagos={vencidos} />
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-primary">
            Próximos vencimientos
          </h2>
          <Link
            href="/pagos"
            className="text-xs text-text-link hover:text-text-link-hover hover:underline"
          >
            Ver todos
          </Link>
        </div>
        <div className="mt-2">
          <PagoList pagos={pendientes.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}
