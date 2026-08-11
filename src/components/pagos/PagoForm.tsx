"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { calcularProximaFecha, recurrenciaLabels } from "@/lib/pagos/recurrence";
import { formatFecha, hoyISO } from "@/lib/format";
import { recurrenciaTipos } from "@/lib/pagos/validation";
import type { Categoria, Pago } from "@/types/domain";
import type { RecurrenciaTipo } from "@/types/database.types";

interface PagoFormValues {
  nombre: string;
  monto: string;
  categoria_id: string;
  fecha_vencimiento: string;
  notas: string;
  recurrencia: RecurrenciaTipo;
}

function valoresIniciales(pago?: Pago): PagoFormValues {
  return {
    nombre: pago?.nombre ?? "",
    monto: pago ? String(pago.monto) : "",
    categoria_id: pago?.categoria_id ?? "",
    fecha_vencimiento: pago?.fecha_vencimiento ?? hoyISO(),
    notas: pago?.notas ?? "",
    recurrencia: pago?.recurrencia ?? "ninguna",
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

  function set<K extends keyof PagoFormValues>(key: K, value: PagoFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      nombre: values.nombre,
      monto: Number(values.monto),
      categoria_id: values.categoria_id || null,
      fecha_vencimiento: values.fecha_vencimiento,
      notas: values.notas || null,
      recurrencia: values.recurrencia,
    };

    const res = await fetch(
      editando ? `/api/pagos/${pago!.id}` : "/api/pagos",
      {
        method: editando ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
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
    values.recurrencia !== "ninguna"
      ? calcularProximaFecha(values.fecha_vencimiento, values.recurrencia)
      : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
          Nombre
        </label>
        <input
          type="text"
          required
          placeholder="Ej: Claro, Wifi, Netflix…"
          value={values.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
            Monto (ARS)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={values.monto}
            onChange={(e) => set("monto", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
            Categoría
          </label>
          <select
            value={values.categoria_id}
            onChange={(e) => set("categoria_id", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
            Vencimiento
          </label>
          <input
            type="date"
            required
            value={values.fecha_vencimiento}
            onChange={(e) => set("fecha_vencimiento", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
            Repetición
          </label>
          <select
            value={values.recurrencia}
            onChange={(e) => set("recurrencia", e.target.value as RecurrenciaTipo)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            {recurrenciaTipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {recurrenciaLabels[tipo]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {proximaFecha && (
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          Cuando lo marques como pagado, se va a generar automáticamente el
          próximo vencimiento: {formatFecha(proximaFecha)}.
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
          Notas
        </label>
        <textarea
          rows={3}
          value={values.notas}
          onChange={(e) => set("notas", e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? "Guardando…" : editando ? "Guardar cambios" : "Crear pago"}
      </button>
    </form>
  );
}
