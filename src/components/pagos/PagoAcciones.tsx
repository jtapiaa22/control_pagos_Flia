"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { hoyISO } from "@/lib/format";
import { cardClass, dangerButtonClass, inputClass, primaryButtonClass, secondaryButtonClass } from "@/lib/ui";
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
  const [eligiendoFecha, setEligiendoFecha] = useState(false);
  const [fechaPago, setFechaPago] = useState(hoyISO());

  async function confirmarPago() {
    setLoading(true);
    await fetch(`/api/pagos/${pagoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "pagado", fecha_pago: fechaPago }),
    });
    setLoading(false);
    setEligiendoFecha(false);
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

  if (eligiendoFecha) {
    return (
      <div className={cardClass}>
        <label className="block text-xs font-medium text-text-secondary">
          ¿Qué día lo pagaste?
        </label>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
            className={`w-auto ${inputClass}`}
          />
          <button
            type="button"
            onClick={() => setFechaPago(hoyISO())}
            className="text-xs text-text-link hover:text-text-link-hover hover:underline"
          >
            Hoy
          </button>
          <button onClick={confirmarPago} disabled={loading} className={primaryButtonClass}>
            <CheckCircle2 className="h-4 w-4" /> Confirmar pago
          </button>
          <button
            type="button"
            onClick={() => setEligiendoFecha(false)}
            disabled={loading}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {estado === "pagado" ? (
        <button onClick={reabrir} disabled={loading} className={secondaryButtonClass}>
          <RotateCcw className="h-4 w-4" /> Reabrir
        </button>
      ) : (
        <button
          onClick={() => {
            setFechaPago(hoyISO());
            setEligiendoFecha(true);
          }}
          disabled={loading}
          className={primaryButtonClass}
        >
          <CheckCircle2 className="h-4 w-4" /> Marcar como pagado
        </button>
      )}
      <button onClick={eliminar} disabled={loading} className={dangerButtonClass}>
        <Trash2 className="h-4 w-4" /> Eliminar
      </button>
    </div>
  );
}
