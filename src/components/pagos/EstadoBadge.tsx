import type { PagoEstado } from "@/types/database.types";

const estilos: Record<PagoEstado, { fg: string; bg: string; dot: string }> = {
  pendiente: {
    fg: "text-status-due-fg",
    bg: "bg-status-due-bg",
    dot: "bg-status-due-dot",
  },
  pagado: {
    fg: "text-status-paid-fg",
    bg: "bg-status-paid-bg",
    dot: "bg-status-paid-dot",
  },
  vencido: {
    fg: "text-status-overdue-fg",
    bg: "bg-status-overdue-bg",
    dot: "bg-status-overdue-dot",
  },
};

const labels: Record<PagoEstado, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  vencido: "Vencido",
};

export function EstadoBadge({ estado }: { estado: PagoEstado }) {
  const s = estilos[estado];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.fg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {labels[estado]}
    </span>
  );
}
