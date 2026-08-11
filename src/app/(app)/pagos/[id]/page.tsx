import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { obtenerPago } from "@/lib/pagos/queries";
import { requireUser } from "@/lib/auth/session";
import { EstadoBadge } from "@/components/pagos/EstadoBadge";
import { PagoAcciones } from "@/components/pagos/PagoAcciones";
import { AdjuntoUploader } from "@/components/pagos/AdjuntoUploader";
import { formatMonto, formatFecha } from "@/lib/format";
import { recurrenciaLabels } from "@/lib/pagos/recurrence";

export default async function DetallePagoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pago, viewer] = await Promise.all([obtenerPago(id), requireUser()]);

  if (!pago) notFound();

  // El admin puede LEER pagos de cualquier miembro (RLS pagos_select_admin),
  // pero editar/adjuntar sigue restringido al dueño (pagos_update_own /
  // storage por carpeta de user_id) — se oculta la UI que fallaría igual.
  const esPropio = pago.user_id === viewer.id;

  return (
    <div>
      {!esPropio && (
        <p className="mb-4 rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
          Estás viendo el pago de otro miembro, en modo solo lectura.
        </p>
      )}

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {pago.nombre}
            </h1>
            <EstadoBadge estado={pago.estado} />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            {pago.categoria?.nombre ?? "Sin categoría"}
          </p>
        </div>
        {esPropio && (
          <Link
            href={`/pagos/${pago.id}/editar`}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Pencil className="h-4 w-4" /> Editar
          </Link>
        )}
      </div>

      <dl className="mt-6 space-y-3 rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex justify-between">
          <dt className="text-sm text-gray-500 dark:text-neutral-400">Monto</dt>
          <dd className="text-sm font-medium text-gray-900 dark:text-white">
            {formatMonto(pago.monto)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm text-gray-500 dark:text-neutral-400">
            Vencimiento
          </dt>
          <dd className="text-sm font-medium text-gray-900 dark:text-white">
            {formatFecha(pago.fecha_vencimiento)}
          </dd>
        </div>
        {pago.fecha_pago && (
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500 dark:text-neutral-400">
              Pagado el
            </dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-white">
              {formatFecha(pago.fecha_pago)}
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-sm text-gray-500 dark:text-neutral-400">
            Repetición
          </dt>
          <dd className="text-sm font-medium text-gray-900 dark:text-white">
            {recurrenciaLabels[pago.recurrencia]}
          </dd>
        </div>
        {pago.notas && (
          <div>
            <dt className="text-sm text-gray-500 dark:text-neutral-400">
              Notas
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {pago.notas}
            </dd>
          </div>
        )}
      </dl>

      {esPropio && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
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
