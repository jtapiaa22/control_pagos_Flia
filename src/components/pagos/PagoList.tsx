import { PagoCard } from "@/components/pagos/PagoCard";
import type { Pago } from "@/types/domain";

export function PagoList({ pagos }: { pagos: Pago[] }) {
  if (pagos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-text-secondary">
        No hay pagos para mostrar.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
      {pagos.map((pago) => (
        <li key={pago.id}>
          <PagoCard pago={pago} />
        </li>
      ))}
    </ul>
  );
}
