import { z } from "zod";

export const pagoEstados = ["pendiente", "pagado", "vencido"] as const;
export const recurrenciaTipos = [
  "ninguna",
  "mensual",
  "bimestral",
  "trimestral",
  "semestral",
  "anual",
  "cuotas",
] as const;

const fechaISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const cuotaNumero = z.coerce.number().int().min(1).max(999).nullable().optional();

// Solo exige cuota_actual/cuotas_totales cuando el payload trae
// recurrencia: "cuotas" — así el mismo refine sirve tanto para altas
// completas como para actualizaciones parciales (ej: PagoAcciones que solo
// manda { estado, fecha_pago }, sin tocar recurrencia).
function validarCuotas(data: {
  recurrencia?: string;
  cuota_actual?: number | null;
  cuotas_totales?: number | null;
}) {
  if (data.recurrencia !== "cuotas") return true;
  return (
    data.cuota_actual != null &&
    data.cuotas_totales != null &&
    data.cuota_actual >= 1 &&
    data.cuota_actual <= data.cuotas_totales
  );
}

const cuotasRefineOptions = {
  message: "Revisá la cuota actual y el total de cuotas (la actual no puede ser mayor al total)",
  path: ["cuota_actual"],
};

// OJO: recurrencia NO lleva .default() acá. Zod aplica los .default() de un
// campo incluso después de .partial() cuando la clave viene ausente del
// payload — así que si este default estuviera acá, cada actualización
// parcial que no toca "recurrencia" (ej: PagoAcciones al marcar como
// pagado o reabrir, que solo mandan { estado, fecha_pago }) la
// sobrescribiría en silencio a "ninguna", rompiendo la recurrencia (y, para
// cuotas, violando el CHECK de la base). El default para altas nuevas se
// aplica aparte, solo en pagoInputSchema.
const pagoObjectSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  monto: z.coerce.number().min(0, "El monto no puede ser negativo"),
  categoria_id: z.string().uuid().nullable().optional(),
  fecha_vencimiento: fechaISO,
  notas: z.string().max(2000).nullable().optional(),
  recurrencia: z.enum(recurrenciaTipos),
  cuota_actual: cuotaNumero,
  cuotas_totales: cuotaNumero,
});

export const pagoInputSchema = pagoObjectSchema
  .extend({ recurrencia: z.enum(recurrenciaTipos).default("ninguna") })
  .refine(validarCuotas, cuotasRefineOptions);

export type PagoInput = z.infer<typeof pagoInputSchema>;

export const pagoUpdateSchema = pagoObjectSchema
  .partial()
  .extend({
    estado: z.enum(pagoEstados).optional(),
    fecha_pago: fechaISO.nullable().optional(),
    recurrencia_activa: z.boolean().optional(),
    adjunto_path: z.string().nullable().optional(),
  })
  .refine(validarCuotas, cuotasRefineOptions);

export type PagoUpdateInput = z.infer<typeof pagoUpdateSchema>;
