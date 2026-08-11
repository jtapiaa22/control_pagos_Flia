import type { RecurrenciaTipo } from "@/types/database.types";

export const recurrenciaLabels: Record<RecurrenciaTipo, string> = {
  ninguna: "No se repite",
  mensual: "Mensual",
  bimestral: "Bimestral",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
  cuotas: "Cuotas",
};

const mesesPorTipo: Record<RecurrenciaTipo, number | null> = {
  ninguna: null,
  mensual: 1,
  bimestral: 2,
  trimestral: 3,
  semestral: 6,
  anual: 12,
  cuotas: 1,
};

// Mirrors public.calcular_proxima_fecha (supabase/migrations/0003) — used
// client-side only to preview the next due date; the DB function is the
// actual source of truth when the row gets generated.
export function calcularProximaFecha(
  fechaISO: string,
  tipo: RecurrenciaTipo
): string | null {
  const meses = mesesPorTipo[tipo];
  if (meses === null) return null;

  const [y, m, d] = fechaISO.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + meses, d));
  return date.toISOString().slice(0, 10);
}
