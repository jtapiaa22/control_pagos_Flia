import { PushToggle } from "@/components/configuracion/PushToggle";
import { CambiarPassword } from "@/components/configuracion/CambiarPassword";

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Ajustes
      </h1>

      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-medium text-gray-900 dark:text-white">
          Notificaciones
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
          Avisos cuando se acerca un vencimiento.
        </p>
        <div className="mt-4">
          <PushToggle />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-medium text-gray-900 dark:text-white">
          Contraseña
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
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
