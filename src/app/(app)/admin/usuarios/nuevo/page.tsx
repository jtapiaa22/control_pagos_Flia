import { UsuarioForm } from "@/components/admin/UsuarioForm";

export default function NuevoUsuarioPage() {
  return (
    <div>
      <h1 className="font-display text-h2 font-semibold tracking-heading text-text-primary">
        Nuevo miembro
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Vas a crear la cuenta vos; el miembro solo va a poder ver sus propios
        pagos.
      </p>
      <div className="mt-6">
        <UsuarioForm />
      </div>
    </div>
  );
}
