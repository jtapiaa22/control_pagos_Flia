import type { PagoEstado } from "@/types/database.types";

const estilos: Record<PagoEstado, string> = {
  pendiente:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  pagado:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  vencido: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

const labels: Record<PagoEstado, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  vencido: "Vencido",
};

export function EstadoBadge({ estado }: { estado: PagoEstado }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${estilos[estado]}`}
    >
      {labels[estado]}
    </span>
  );
}
