import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { obtenerPago, listarHistorialSerie } from "@/lib/pagos/queries";
import { requireUser } from "@/lib/auth/session";
import { EstadoBadge } from "@/components/pagos/EstadoBadge";
import { PagoAcciones } from "@/components/pagos/PagoAcciones";
import { AdjuntoUploader } from "@/components/pagos/AdjuntoUploader";
import { HistorialPagos } from "@/components/pagos/HistorialPagos";
import { formatMonto, formatFecha } from "@/lib/format";
import { recurrenciaLabels } from "@/lib/pagos/recurrence";
import { cardClass, secondaryButtonClass } from "@/lib/ui";

export default async function DetallePagoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pago, viewer] = await Promise.all([obtenerPago(id), requireUser()]);

  if (!pago) notFound();

  const historial = await listarHistorialSerie(pago.serie_id ?? pago.id, pago.id);

  // El admin puede LEER pagos de cualquier miembro (RLS pagos_select_admin),
  // pero editar/adjuntar sigue restringido al dueño (pagos_update_own /
  // storage por carpeta de user_id) — se oculta la UI que fallaría igual.
  const esPropio = pago.user_id === viewer.id;

  return (
    <div>
      {!esPropio && (
        <p className="mb-4 rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          Estás viendo el pago de otro miembro, en modo solo lectura.
        </p>
      )}

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-h3 font-semibold text-text-primary">
              {pago.nombre}
            </h1>
            <EstadoBadge estado={pago.estado} />
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {pago.categoria?.nombre ?? "Sin categoría"}
          </p>
        </div>
        {esPropio && (
          <Link href={`/pagos/${pago.id}/editar`} className={secondaryButtonClass}>
            <Pencil className="h-4 w-4" /> Editar
          </Link>
        )}
      </div>

      <dl className={`mt-6 space-y-3 ${cardClass}`}>
        <div className="flex justify-between">
          <dt className="text-sm text-text-secondary">Monto</dt>
          <dd className="tabular-amount text-sm font-medium text-text-primary">
            {formatMonto(pago.monto)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm text-text-secondary">Vencimiento</dt>
          <dd className="text-sm font-medium text-text-primary">
            {formatFecha(pago.fecha_vencimiento)}
          </dd>
        </div>
        {pago.fecha_pago && (
          <div className="flex justify-between">
            <dt className="text-sm text-text-secondary">Pagado el</dt>
            <dd className="text-sm font-medium text-text-primary">
              {formatFecha(pago.fecha_pago)}
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-sm text-text-secondary">Repetición</dt>
          <dd className="text-sm font-medium text-text-primary">
            {recurrenciaLabels[pago.recurrencia]}
          </dd>
        </div>
        {pago.notas && (
          <div>
            <dt className="text-sm text-text-secondary">Notas</dt>
            <dd className="mt-1 text-sm text-text-primary">{pago.notas}</dd>
          </div>
        )}
      </dl>

      <HistorialPagos historial={historial} />

      {esPropio && (
        <div className={`mt-4 ${cardClass}`}>
          <AdjuntoUploader
            pagoId={pago.id}
            userId={pago.user_id}
            adjuntoPathInicial={pago.adjunto_path}
          />
        </div>
      )}

      {esPropio && (
        <div className="mt-4">
          <PagoAcciones pagoId={pago.id} estado={pago.estado} />
        </div>
      )}
    </div>
  );
}
