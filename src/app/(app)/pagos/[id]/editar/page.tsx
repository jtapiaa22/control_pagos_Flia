import { notFound } from "next/navigation";
import { obtenerPago, listarCategorias } from "@/lib/pagos/queries";
import { PagoForm } from "@/components/pagos/PagoForm";

export default async function EditarPagoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pago, categorias] = await Promise.all([
    obtenerPago(id),
    listarCategorias(),
  ]);

  if (!pago) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Editar pago
      </h1>
      <div className="mt-6">
        <PagoForm categorias={categorias} pago={pago} />
      </div>
    </div>
  );
}
