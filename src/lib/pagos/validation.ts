import { z } from "zod";

export const pagoEstados = ["pendiente", "pagado", "vencido"] as const;
export const recurrenciaTipos = [
  "ninguna",
  "mensual",
  "bimestral",
  "trimestral",
  "semestral",
  "anual",
] as const;

const fechaISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

export const pagoInputSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  monto: z.coerce.number().min(0, "El monto no puede ser negativo"),
  categoria_id: z.string().uuid().nullable().optional(),
  fecha_vencimiento: fechaISO,
  notas: z.string().max(2000).nullable().optional(),
  recurrencia: z.enum(recurrenciaTipos).default("ninguna"),
});

export type PagoInput = z.infer<typeof pagoInputSchema>;

export const pagoUpdateSchema = pagoInputSchema.partial().extend({
  estado: z.enum(pagoEstados).optional(),
  fecha_pago: fechaISO.nullable().optional(),
  recurrencia_activa: z.boolean().optional(),
  adjunto_path: z.string().nullable().optional(),
});

export type PagoUpdateInput = z.infer<typeof pagoUpdateSchema>;
