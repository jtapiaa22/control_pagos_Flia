"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  calcularProximaFecha,
  recurrenciaLabels,
} from "@/lib/pagos/recurrence";
import {
  formatFecha,
  formatMonto,
  hoyISO,
  sanitizeMontoInput,
} from "@/lib/format";
import { recurrenciaTipos } from "@/lib/pagos/validation";
import {
  cardClass,
  errorTextClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/lib/ui";
import type { Categoria, Pago } from "@/types/domain";
import type { RecurrenciaTipo } from "@/types/database.types";

interface PagoFormValues {
  nombre: string;
  monto: string;
  categoria_id: string;
  fecha_vencimiento: string;
  notas: string;
  recurrencia: RecurrenciaTipo;
  cuota_actual: string;
  cuotas_totales: string;
}

function valoresIniciales(pago?: Pago): PagoFormValues {
  return {
    nombre: pago?.nombre ?? "",
    monto: pago ? String(pago.monto) : "",
    categoria_id: pago?.categoria_id ?? "",
    fecha_vencimiento: pago?.fecha_vencimiento ?? hoyISO(),
    notas: pago?.notas ?? "",
    recurrencia: pago?.recurrencia ?? "ninguna",
    cuota_actual: pago?.cuota_actual ? String(pago.cuota_actual) : "1",
    cuotas_totales: pago?.cuotas_totales ? String(pago.cuotas_totales) : "",
  };
}

export function PagoForm({
  categorias,
  pago,
}: {
  categorias: Categoria[];
  pago?: Pago;
}) {
  const router = useRouter();
  const editando = Boolean(pago);
  const [values, setValues] = useState<PagoFormValues>(valoresIniciales(pago));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof PagoFormValues>(
    key: K,
    value: PagoFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const esCuotas = values.recurrencia === "cuotas";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (esCuotas) {
      const actual = Number(values.cuota_actual);
      const total = Number(values.cuotas_totales);
      if (!actual || !total || actual < 1 || actual > total) {
        setError(
          "Revisá la cuota actual y el total de cuotas (la actual no puede ser mayor al total)."
        );
        return;
      }
    }

    setLoading(true);

    const payload = {
      nombre: values.nombre,
      monto: Number(values.monto),
      categoria_id: values.categoria_id || null,
      fecha_vencimiento: values.fecha_vencimiento,
      notas: values.notas || null,
      recurrencia: values.recurrencia,
      cuota_actual: esCuotas ? Number(values.cuota_actual) : null,
      cuotas_totales: esCuotas ? Number(values.cuotas_totales) : null,
    };

    const res = await fetch(
      editando ? `/api/pagos/${pago!.id}` : "/api/pagos",
      {
        method: editando ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar el pago.");
      setLoading(false);
      return;
    }

    router.push(`/pagos/${data.id}`);
    router.refresh();
  }

  const proximaFecha =
    values.recurrencia !== "ninguna" && values.recurrencia !== "cuotas"
      ? calcularProximaFecha(values.fecha_vencimiento, values.recurrencia)
      : null;

  const proximaFechaCuota =
    esCuotas && Number(values.cuota_actual) < Number(values.cuotas_totales)
      ? calcularProximaFecha(values.fecha_vencimiento, "cuotas")
      : null;
  const esUltimaCuota =
    esCuotas &&
    Number(values.cuota_actual) > 0 &&
    Number(values.cuota_actual) === Number(values.cuotas_totales);

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${cardClass}`}>
      <div>
        <label className={labelClass}>Nombre</label>
        <input
          type="text"
          required
          placeholder="Ej: Claro, Wifi, Netflix…"
          value={values.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Monto (ARS)</label>
          <input
            type="text"
            inputMode="decimal"
            required
            placeholder="0.00"
            value={values.monto}
            onChange={(e) => set("monto", sanitizeMontoInput(e.target.value))}
            className={`mt-1 ${inputClass}`}
          />
          {values.monto !== "" &&
            !Number.isNaN(Number(values.monto)) && (
              <p className="mt-1 text-xs text-text-tertiary">
                {formatMonto(Number(values.monto))}
              </p>
            )}
        </div>

        <div>
          <label className={labelClass}>Categoría</label>
          <select
            value={values.categoria_id}
            onChange={(e) => set("categoria_id", e.target.value)}
            className={`mt-1 ${inputClass}`}
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Vencimiento</label>
          <input
            type="date"
            required
            value={values.fecha_vencimiento}
            onChange={(e) => set("fecha_vencimiento", e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </div>

        <div>
          <label className={labelClass}>Repetición</label>
          <select
            value={values.recurrencia}
            onChange={(e) =>
              set("recurrencia", e.target.value as RecurrenciaTipo)
            }
            className={`mt-1 ${inputClass}`}
          >
            {recurrenciaTipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {recurrenciaLabels[tipo]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {esCuotas && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Cuota actual</label>
            <input
              type="number"
              min={1}
              required
              value={values.cuota_actual}
              onChange={(e) => set("cuota_actual", e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass}>Cuotas totales</label>
            <input
              type="number"
              min={1}
              required
              value={values.cuotas_totales}
              onChange={(e) => set("cuotas_totales", e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </div>
          <p className="col-span-2 text-xs text-text-tertiary">
            Si ya la venías pagando de antes, poné en qué cuota vas (ej: cuota
            4 de 12) — no hace falta cargar las anteriores.
          </p>
        </div>
      )}

      {proximaFecha && (
        <p className="text-xs text-text-secondary">
          Cuando lo marques como pagado, se va a generar automáticamente el
          próximo vencimiento: {formatFecha(proximaFecha)}.
        </p>
      )}

      {esCuotas && esUltimaCuota && (
        <p className="text-xs text-text-secondary">
          Es la última cuota — cuando la marques como pagada, el plan se
          cierra solo.
        </p>
      )}

      {esCuotas && proximaFechaCuota && !esUltimaCuota && (
        <p className="text-xs text-text-secondary">
          Cuando la marques como pagada, se genera la cuota{" "}
          {Number(values.cuota_actual) + 1} de {values.cuotas_totales}, con
          vencimiento {formatFecha(proximaFechaCuota)}.
        </p>
      )}

      <div>
        <label className={labelClass}>Notas</label>
        <textarea
          rows={3}
          value={values.notas}
          onChange={(e) => set("notas", e.target.value)}
          className={`mt-1 w-full rounded-md border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary outline-none focus:border-border-focus focus:ring-2 focus:ring-pino-600/20`}
        />
      </div>

      {error && <p className={errorTextClass}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`w-full ${primaryButtonClass}`}
      >
        {loading ? "Guardando…" : editando ? "Guardar cambios" : "Crear pago"}
      </button>
    </form>
  );
}
