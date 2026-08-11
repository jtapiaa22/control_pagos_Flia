"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { hoyISO } from "@/lib/format";
import type { PagoEstado } from "@/types/database.types";

export function PagoAcciones({
  pagoId,
  estado,
}: {
  pagoId: string;
  estado: PagoEstado;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function marcarPagado() {
    setLoading(true);
    await fetch(`/api/pagos/${pagoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "pagado", fecha_pago: hoyISO() }),
    });
    setLoading(false);
    router.refresh();
  }

  async function reabrir() {
    setLoading(true);
    await fetch(`/api/pagos/${pagoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "pendiente", fecha_pago: null }),
    });
    setLoading(false);
    router.refresh();
  }

  async function eliminar() {
    if (!confirm("¿Eliminar este pago? Esta acción no se puede deshacer.")) {
      return;
    }
    setLoading(true);
    await fetch(`/api/pagos/${pagoId}`, { method: "DELETE" });
    router.push("/pagos");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {estado === "pagado" ? (
        <button
          onClick={reabrir}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <RotateCcw className="h-4 w-4" /> Reabrir
        </button>
      ) : (
        <button
          onClick={marcarPagado}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" /> Marcar como pagado
        </button>
      )}
      <button
        onClick={eliminar}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:hover:bg-red-950"
      >
        <Trash2 className="h-4 w-4" /> Eliminar
      </button>
    </div>
  );
}
