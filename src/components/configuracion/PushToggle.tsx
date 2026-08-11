"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { registerServiceWorker, urlBase64ToUint8Array } from "@/lib/push/register-sw";
import { isIOS, isStandalone } from "@/lib/device";

type Estado =
  | "cargando"
  | "no-soportado"
  | "suscrito"
  | "no-suscrito"
  | "denegado";

export function PushToggle() {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avisoIOS, setAvisoIOS] = useState(false);

  useEffect(() => {
    (async () => {
      if (isIOS() && !isStandalone()) {
        setAvisoIOS(true);
      }

      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        setEstado("no-soportado");
        return;
      }

      if (Notification.permission === "denied") {
        setEstado("denegado");
        return;
      }

      const reg = await registerServiceWorker();
      const sub = await reg?.pushManager.getSubscription();
      setEstado(sub ? "suscrito" : "no-suscrito");
    })();
  }, []);

  async function activar() {
    setError(null);
    setLoading(true);
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setEstado("denegado");
        return;
      }

      const reg = await registerServiceWorker();
      if (!reg) throw new Error("sin-service-worker");

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setEstado("suscrito");
    } catch {
      setError("No se pudieron activar las notificaciones.");
    } finally {
      setLoading(false);
    }
  }

  async function desactivar() {
    setError(null);
    setLoading(true);
    try {
      const reg = await registerServiceWorker();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setEstado("no-suscrito");
    } catch {
      setError("No se pudieron desactivar las notificaciones.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {avisoIOS && (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">
          En iPhone, las notificaciones solo funcionan si agregaste la app a
          la pantalla de inicio (Compartir → Agregar a inicio) y la abrís
          desde ahí.
        </p>
      )}

      {estado === "cargando" && (
        <p className="text-sm text-gray-400 dark:text-neutral-500">
          Verificando…
        </p>
      )}

      {estado === "no-soportado" && (
        <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400">
          <BellOff className="h-4 w-4" /> Tu navegador no soporta
          notificaciones push.
        </p>
      )}

      {estado === "denegado" && (
        <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400">
          <BellOff className="h-4 w-4" /> Bloqueaste las notificaciones.
          Activalas desde la configuración del sitio en tu navegador.
        </p>
      )}

      {estado === "suscrito" && (
        <button
          onClick={desactivar}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <BellRing className="h-4 w-4 text-emerald-600" /> Notificaciones
          activadas
        </button>
      )}

      {estado === "no-suscrito" && (
        <button
          onClick={activar}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          <Bell className="h-4 w-4" /> Activar notificaciones
        </button>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
