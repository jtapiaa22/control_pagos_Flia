import { listarCategorias } from "@/lib/pagos/queries";
import { PagoForm } from "@/components/pagos/PagoForm";

export default async function NuevoPagoPage() {
  const categorias = await listarCategorias();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Nuevo pago
      </h1>
      <div className="mt-6">
        <PagoForm categorias={categorias} />
      </div>
    </div>
  );
}
