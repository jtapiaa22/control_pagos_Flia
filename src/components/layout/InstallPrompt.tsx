"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { isIOS, isStandalone } from "@/lib/device";

const DISMISS_KEY = "control-pagos:install-dismissed-at";
const DISMISS_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isDismissedRecently() {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const elapsedDays = (Date.now() - Number(raw)) / (1000 * 60 * 60 * 24);
  return elapsedDays < DISMISS_DAYS;
}

type Visibilidad = "oculto" | "ios" | "instalable";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visibilidad, setVisibilidad] = useState<Visibilidad>("oculto");

  useEffect(() => {
    if (isStandalone() || isDismissedRecently()) return;

    if (isIOS()) {
      // UA sniffing solo puede correr en el cliente; se hace acá (post-mount)
      // a propósito para no desincronizar el HTML de SSR con el del cliente.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibilidad("ios");
      return;
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisibilidad("instalable");
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDeferredPrompt(null);
    setVisibilidad("oculto");
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (visibilidad === "oculto") return null;

  return (
    <div className="fixed inset-x-4 bottom-20 z-30 mx-auto max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-lg md:bottom-4 dark:border-neutral-800 dark:bg-neutral-900">
      <button
        onClick={dismiss}
        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>

      {visibilidad === "ios" ? (
        <div className="pr-4 text-sm text-gray-700 dark:text-neutral-300">
          <p className="font-medium text-gray-900 dark:text-white">
            Instalá la app en tu iPhone
          </p>
          <p className="mt-1">
            Tocá <Share className="inline h-4 w-4 align-text-bottom" /> Compartir
            y luego &quot;Agregar a inicio&quot;. Así vas a poder recibir
            notificaciones de vencimientos.
          </p>
        </div>
      ) : (
        <div className="pr-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Instalá Control de Pagos
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            Accedé más rápido, como una app.
          </p>
          <button
            onClick={install}
            className="mt-3 flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Download className="h-4 w-4" /> Instalar
          </button>
        </div>
      )}
    </div>
  );
}
