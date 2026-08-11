"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

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
        <label className={labelClass}>Nueva contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`mt-1 ${inputClass}`}
        />
      </div>
      <div>
        <label className={labelClass}>Confirmar contraseña</label>
        <input
          type="password"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      {mensaje && (
        <p
          className={`text-sm ${
            mensaje.tipo === "ok" ? "text-pino-700" : "text-action-danger"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <button type="submit" disabled={loading} className={primaryButtonClass}>
        {loading ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
