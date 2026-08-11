"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { hoyISO } from "@/lib/format";
import { cardClass, dangerButtonClass, inputClass, primaryButtonClass, secondaryButtonClass } from "@/lib/ui";
import type { PagoEstado, RecurrenciaTipo } from "@/types/database.types";

export function PagoAcciones({
  pagoId,
  estado,
  recurrencia,
  cuotaActual,
  cuotasTotales,
}: {
  pagoId: string;
  estado: PagoEstado;
  recurrencia?: RecurrenciaTipo;
  cuotaActual?: number | null;
  cuotasTotales?: number | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [eligiendoFecha, setEligiendoFecha] = useState(false);
  const [fechaPago, setFechaPago] = useState(hoyISO());
  const [cantidadCuotas, setCantidadCuotas] = useState("1");

  const esCuotas = recurrencia === "cuotas";
  const cuotasRestantes =
    esCuotas && cuotaActual != null && cuotasTotales != null
      ? cuotasTotales - cuotaActual + 1
      : 1;

  async function confirmarPago() {
    setLoading(true);

    const cantidad = Math.min(Math.max(Number(cantidadCuotas) || 1, 1), cuotasRestantes);

    if (esCuotas && cantidad > 1) {
      await fetch(`/api/pagos/${pagoId}/adelantar-cuotas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad, fecha_pago: fechaPago }),
      });
    } else {
      await fetch(`/api/pagos/${pagoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "pagado", fecha_pago: fechaPago }),
      });
    }

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

        {esCuotas && cuotasRestantes > 1 && (
          <div className="mt-3 border-t border-border-subtle pt-3">
            <label className="block text-xs font-medium text-text-secondary">
              ¿Cuántas cuotas estás pagando? (quedan {cuotasRestantes})
            </label>
            <input
              type="number"
              min={1}
              max={cuotasRestantes}
              value={cantidadCuotas}
              onChange={(e) => setCantidadCuotas(e.target.value)}
              className={`mt-1.5 w-24 ${inputClass}`}
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Si tu tarjeta te dejó adelantar varias cuotas de una, poné
              cuántas — todas quedan con la misma fecha de pago.
            </p>
          </div>
        )}
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
            setCantidadCuotas("1");
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
