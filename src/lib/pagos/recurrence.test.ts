import { describe, expect, it } from "vitest";
import { calcularProximaFecha } from "./recurrence";

describe("calcularProximaFecha", () => {
  it("no repite -> null", () => {
    expect(calcularProximaFecha("2026-01-15", "ninguna")).toBeNull();
  });

  it.each([
    ["mensual", "2026-01-15", "2026-02-15"],
    ["bimestral", "2026-01-15", "2026-03-15"],
    ["trimestral", "2026-01-15", "2026-04-15"],
    ["semestral", "2026-01-15", "2026-07-15"],
    ["anual", "2026-01-15", "2027-01-15"],
    ["cuotas", "2026-01-15", "2026-02-15"],
  ] as const)("%s: %s -> %s", (tipo, desde, esperado) => {
    expect(calcularProximaFecha(desde, tipo)).toBe(esperado);
  });

  it("cruza fin de año", () => {
    expect(calcularProximaFecha("2026-12-01", "mensual")).toBe("2027-01-01");
  });

  // Enero tiene 31 días, febrero no: el mismo overflow que hace el motor de
  // fechas de JS lo debe hacer public.calcular_proxima_fecha en Postgres
  // para que el preview del cliente no se desincronice del valor real.
  it("día inexistente en el mes destino se desborda al mes siguiente", () => {
    expect(calcularProximaFecha("2026-01-31", "mensual")).toBe("2026-03-03");
  });

  it("29 de febrero en año bisiesto + anual desborda a marzo en año no bisiesto", () => {
    expect(calcularProximaFecha("2028-02-29", "anual")).toBe("2029-03-01");
  });
});
