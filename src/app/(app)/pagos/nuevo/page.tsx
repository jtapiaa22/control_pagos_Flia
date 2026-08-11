import { listarCategorias } from "@/lib/pagos/queries";
import { PagoForm } from "@/components/pagos/PagoForm";

export default async function NuevoPagoPage() {
  const categorias = await listarCategorias();

  return (
    <div>
      <h1 className="font-display text-h2 font-semibold tracking-heading text-text-primary">
        Nuevo pago
      </h1>
      <div className="mt-6">
        <PagoForm categorias={categorias} />
      </div>
    </div>
  );
}
