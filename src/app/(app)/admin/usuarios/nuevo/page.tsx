import { UsuarioForm } from "@/components/admin/UsuarioForm";

export default function NuevoUsuarioPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Nuevo miembro
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
        Vas a crear la cuenta vos; el miembro solo va a poder ver sus propios
        pagos.
      </p>
      <div className="mt-6">
        <UsuarioForm />
      </div>
    </div>
  );
}
