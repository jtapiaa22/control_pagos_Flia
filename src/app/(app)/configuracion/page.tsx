import { PushToggle } from "@/components/configuracion/PushToggle";
import { CambiarPassword } from "@/components/configuracion/CambiarPassword";
import { cardClass } from "@/lib/ui";

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-h2 font-semibold tracking-heading text-text-primary">
        Ajustes
      </h1>

      <section className={cardClass}>
        <h2 className="text-sm font-medium text-text-primary">
          Notificaciones
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Avisos cuando se acerca un vencimiento.
        </p>
        <div className="mt-4">
          <PushToggle />
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="text-sm font-medium text-text-primary">Contraseña</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Cambiala cuando quieras, sobre todo si todavía usás la temporal que
          te compartieron.
        </p>
        <div className="mt-4">
          <CambiarPassword />
        </div>
      </section>
    </div>
  );
}
