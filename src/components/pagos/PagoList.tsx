import { PagoCard } from "@/components/pagos/PagoCard";
import type { Pago } from "@/types/domain";

export function PagoList({ pagos }: { pagos: Pago[] }) {
  if (pagos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
        No hay pagos para mostrar.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
      {pagos.map((pago) => (
        <li key={pago.id}>
          <PagoCard pago={pago} />
        </li>
      ))}
    </ul>
  );
}
