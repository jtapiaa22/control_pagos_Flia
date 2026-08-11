import Link from "next/link";
import { AlertTriangle, Calendar, Wallet } from "lucide-react";
import { listarPagos } from "@/lib/pagos/queries";
import { PagoList } from "@/components/pagos/PagoList";
import { formatMonto } from "@/lib/format";

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
  const totalPendiente = [...pendientes, ...vencidos].reduce(
    (acc, p) => acc + p.monto,
    0
  );

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Inicio
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
        Resumen de tus vencimientos.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium">Vencen en 7 días</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {vencenPronto.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">Atrasados</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {vencidos.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Wallet className="h-4 w-4" />
            <span className="text-xs font-medium">Total pendiente</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {formatMonto(totalPendiente)}
          </p>
        </div>
      </div>

      {vencidos.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">
            Atrasados
          </h2>
          <div className="mt-2">
            <PagoList pagos={vencidos} />
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">
            Próximos vencimientos
          </h2>
          <Link
            href="/pagos"
            className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
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
