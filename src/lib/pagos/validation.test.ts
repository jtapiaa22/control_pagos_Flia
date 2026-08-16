import { describe, expect, it } from "vitest";
import { pagoInputSchema, pagoUpdateSchema } from "./validation";

const base = {
  nombre: "Netflix",
  monto: 1000,
  fecha_vencimiento: "2026-08-20",
};

describe("pagoInputSchema", () => {
  it("acepta un pago simple sin recurrencia explícita (default 'ninguna')", () => {
    const parsed = pagoInputSchema.parse(base);
    expect(parsed.recurrencia).toBe("ninguna");
  });

  it("rechaza monto negativo", () => {
    expect(pagoInputSchema.safeParse({ ...base, monto: -1 }).success).toBe(false);
  });

  it("rechaza fecha con formato inválido", () => {
    expect(
      pagoInputSchema.safeParse({ ...base, fecha_vencimiento: "20-08-2026" }).success
    ).toBe(false);
  });

  it("recurrencia 'cuotas' exige cuota_actual y cuotas_totales", () => {
    const result = pagoInputSchema.safeParse({ ...base, recurrencia: "cuotas" });
    expect(result.success).toBe(false);
  });

  it("recurrencia 'cuotas' con cuota_actual mayor a cuotas_totales falla", () => {
    const result = pagoInputSchema.safeParse({
      ...base,
      recurrencia: "cuotas",
      cuota_actual: 5,
      cuotas_totales: 3,
    });
    expect(result.success).toBe(false);
  });

  it("recurrencia 'cuotas' válida pasa", () => {
    const result = pagoInputSchema.safeParse({
      ...base,
      recurrencia: "cuotas",
      cuota_actual: 1,
      cuotas_totales: 12,
    });
    expect(result.success).toBe(true);
  });
});

describe("pagoUpdateSchema", () => {
  // Regresión del bug corregido en 24ee6aa: marcar como pagado / reabrir
  // manda solo { estado, fecha_pago }, sin "recurrencia" en el payload. Si
  // el schema le aplicara un default acá, pisaría en silencio la
  // recurrencia existente del pago a "ninguna".
  it("actualización parcial sin 'recurrencia' no la fuerza a 'ninguna'", () => {
    const parsed = pagoUpdateSchema.parse({
      estado: "pagado",
      fecha_pago: "2026-08-16",
    });
    expect(parsed.recurrencia).toBeUndefined();
  });

  it("permite actualizar solo el estado", () => {
    const result = pagoUpdateSchema.safeParse({ estado: "vencido" });
    expect(result.success).toBe(true);
  });

  it("sigue validando cuotas si el payload trae recurrencia 'cuotas' sin los números", () => {
    const result = pagoUpdateSchema.safeParse({ recurrencia: "cuotas" });
    expect(result.success).toBe(false);
  });
});
