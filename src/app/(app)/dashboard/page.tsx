import Link from "next/link";
import { listarPagos, listarPagosPagadosEnRango } from "@/lib/pagos/queries";
import { PagoList } from "@/components/pagos/PagoList";
import { formatMonto } from "@/lib/format";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Primer y último día del mes calendario a `offsetMeses` de `base` (0 = este
// mes, 1 = el que viene). El constructor Date normaliza el desborde de mes
// solo (ej: mes 12 pasa a enero del año siguiente), así que sirve también
// para diciembre → enero sin lógica extra.
function rangoMes(base: Date, offsetMeses: number) {
  const anio = base.getFullYear();
  const mes = base.getMonth() + offsetMeses;
  const inicio = new Date(anio, mes, 1);
  const fin = new Date(anio, mes + 1, 0);
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { inicio: iso(inicio), fin: iso(fin) };
}

export default async function DashboardPage() {
  const hoy = new Date();
  const esteMes = rangoMes(hoy, 0);
  const proximoMes = rangoMes(hoy, 1);

  const [pendientes, vencidos, pagadosEsteMes] = await Promise.all([
    listarPagos({ estado: "pendiente" }),
    listarPagos({ estado: "vencido" }),
    listarPagosPagadosEnRango(esteMes.inicio, esteMes.fin),
  ]);

  const enSieteDias = new Date();
  enSieteDias.setDate(enSieteDias.getDate() + 7);
  const enSieteDiasISO = enSieteDias.toISOString().slice(0, 10);

  const vencenPronto = pendientes.filter(
    (p) => p.fecha_vencimiento <= enSieteDiasISO
  );
  const montoVencePronto = vencenPronto.reduce((acc, p) => acc + p.monto, 0);
  const montoVencido = vencidos.reduce((acc, p) => acc + p.monto, 0);

  const enEsteMes = (fecha: string) =>
    fecha >= esteMes.inicio && fecha <= esteMes.fin;

  const pendientesEsteMes = pendientes.filter((p) => enEsteMes(p.fecha_vencimiento));
  const pagosDelMes = [
    ...pendientesEsteMes,
    ...vencidos.filter((p) => enEsteMes(p.fecha_vencimiento)),
  ];
  const pendienteDelMes = pagosDelMes.reduce((acc, p) => acc + p.monto, 0);

  const montoPagadoEsteMes = pagadosEsteMes.reduce((acc, p) => acc + p.monto, 0);

  const proximoMesPendientes = pendientes.filter(
    (p) => p.fecha_vencimiento >= proximoMes.inicio && p.fecha_vencimiento <= proximoMes.fin
  );
  const montoProximoMes = proximoMesPendientes.reduce((acc, p) => acc + p.monto, 0);

  return (
    <div>
      <h1 className="font-display text-h2 font-semibold tracking-heading text-text-primary">
        Inicio
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Resumen de tus vencimientos.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-pino-900 p-5">
          <span className="text-xs font-medium uppercase tracking-caps text-pino-300">
            Pendiente este mes
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
            Pagado este mes
          </span>
          <p className="tabular-amount mt-2 text-amount-lg font-semibold text-status-paid-fg">
            {formatMonto(montoPagadoEsteMes)}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {pagadosEsteMes.length} pago{pagadosEsteMes.length === 1 ? "" : "s"}{" "}
            pagado{pagadosEsteMes.length === 1 ? "" : "s"}
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

        <div className="rounded-lg border border-border-subtle bg-surface-card p-5">
          <span className="text-xs font-medium uppercase tracking-caps text-text-tertiary">
            Próximo mes
          </span>
          <p className="tabular-amount mt-2 text-amount-lg font-semibold text-status-scheduled-fg">
            {formatMonto(montoProximoMes)}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {proximoMesPendientes.length} pago
            {proximoMesPendientes.length === 1 ? "" : "s"} programado
            {proximoMesPendientes.length === 1 ? "" : "s"}
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
          <PagoList pagos={pendientesEsteMes.slice(0, 5)} />
        </div>
      </div>

      {proximoMesPendientes.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-text-primary">
            El próximo mes
          </h2>
          <div className="mt-2">
            <PagoList pagos={proximoMesPendientes} />
          </div>
        </div>
      )}
    </div>
  );
}
