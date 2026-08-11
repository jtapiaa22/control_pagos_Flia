"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function CambiarPassword() {
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMensaje(null);

    if (password.length < 8) {
      setMensaje({ tipo: "error", texto: "Mínimo 8 caracteres." });
      return;
    }
    if (password !== confirmacion) {
      setMensaje({ tipo: "error", texto: "Las contraseñas no coinciden." });
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMensaje({ tipo: "error", texto: "No se pudo cambiar la contraseña." });
      return;
    }

    setMensaje({ tipo: "ok", texto: "Contraseña actualizada." });
    setPassword("");
    setConfirmacion("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
          Nueva contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
          Confirmar contraseña
        </label>
        <input
          type="password"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
      </div>

      {mensaje && (
        <p
          className={`text-sm ${
            mensaje.tipo === "ok"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
