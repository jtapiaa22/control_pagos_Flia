import { describe, expect, it } from "vitest";
import { unaFilaPorServicio } from "./queries";
import type { Pago } from "@/types/domain";

let contador = 0;
function pago(overrides: Partial<Pago>): Pago {
  contador++;
  return {
    id: overrides.id ?? `id-${contador}`,
    user_id: "user-1",
    nombre: "Servicio",
    monto: 100,
    categoria_id: null,
    categoria: null,
    fecha_vencimiento: "2026-08-01",
    fecha_pago: null,
    estado: "pendiente",
    notas: null,
    adjunto_path: null,
    recurrencia: "mensual",
    recurrencia_activa: true,
    cuota_actual: null,
    cuotas_totales: null,
    serie_id: null,
    origen_pago_id: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("unaFilaPorServicio", () => {
  it("pagos sin serie_id se tratan como serie propia (usa el id)", () => {
    const a = pago({ id: "a", serie_id: null });
    const b = pago({ id: "b", serie_id: null });
    expect(unaFilaPorServicio([a, b])).toHaveLength(2);
  });

  it("de una serie con pendientes, elige el no pagado con vencimiento más próximo", () => {
    const serie = "serie-1";
    const lejano = pago({ id: "lejano", serie_id: serie, estado: "pendiente", fecha_vencimiento: "2026-10-01" });
    const cercano = pago({ id: "cercano", serie_id: serie, estado: "pendiente", fecha_vencimiento: "2026-08-01" });
    const pagado = pago({ id: "pagado", serie_id: serie, estado: "pagado", fecha_vencimiento: "2026-07-01" });

    const resultado = unaFilaPorServicio([lejano, cercano, pagado]);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe("cercano");
  });

  it("de una serie totalmente pagada, elige la ocurrencia más reciente", () => {
    const serie = "serie-2";
    const vieja = pago({ id: "vieja", serie_id: serie, estado: "pagado", fecha_vencimiento: "2026-06-01" });
    const reciente = pago({ id: "reciente", serie_id: serie, estado: "pagado", fecha_vencimiento: "2026-08-01" });

    const resultado = unaFilaPorServicio([vieja, reciente]);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe("reciente");
  });

  it("ordena el resultado final por fecha_vencimiento ascendente", () => {
    const a = pago({ id: "a", serie_id: "s-a", fecha_vencimiento: "2026-09-01" });
    const b = pago({ id: "b", serie_id: "s-b", fecha_vencimiento: "2026-07-01" });
    const c = pago({ id: "c", serie_id: "s-c", fecha_vencimiento: "2026-08-01" });

    const resultado = unaFilaPorServicio([a, b, c]);

    expect(resultado.map((p) => p.id)).toEqual(["b", "c", "a"]);
  });

  it("no mezcla series distintas", () => {
    const s1 = pago({ id: "s1-a", serie_id: "s1", fecha_vencimiento: "2026-08-01" });
    const s2 = pago({ id: "s2-a", serie_id: "s2", fecha_vencimiento: "2026-08-02" });

    const resultado = unaFilaPorServicio([s1, s2]);

    expect(resultado.map((p) => p.id).sort()).toEqual(["s1-a", "s2-a"]);
  });
});
