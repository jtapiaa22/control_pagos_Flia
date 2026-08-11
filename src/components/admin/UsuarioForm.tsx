"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dices } from "lucide-react";
import { cardClass, errorTextClass, inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

function generarPassword() {
  const alfabeto =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
}

export function UsuarioForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [password, setPassword] = useState(generarPassword());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creado, setCreado] = useState<{ email: string; password: string } | null>(
    null
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        nombre_completo: nombreCompleto,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la cuenta.");
      setLoading(false);
      return;
    }

    setCreado({ email, password });
    setLoading(false);
  }

  if (creado) {
    return (
      <div className="space-y-4 rounded-lg border border-pino-300 bg-pino-50 p-5">
        <h2 className="font-medium text-pino-800">Cuenta creada</h2>
        <p className="text-sm text-pino-700">
          Compartile estos datos por fuera de la app (WhatsApp, en persona,
          etc.). Va a poder cambiar la contraseña una vez que ingrese.
        </p>
        <dl className="space-y-1 rounded-md bg-surface-card p-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">Email</dt>
            <dd className="font-mono text-text-primary">{creado.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">Contraseña temporal</dt>
            <dd className="font-mono text-text-primary">{creado.password}</dd>
          </div>
        </dl>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/usuarios")}
            className={primaryButtonClass}
          >
            Volver a la lista
          </button>
          <button
            onClick={() => {
              setCreado(null);
              setEmail("");
              setNombreCompleto("");
              setPassword(generarPassword());
            }}
            className="text-sm text-pino-700 hover:underline"
          >
            Crear otra cuenta
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${cardClass}`}>
      <div>
        <label className={labelClass}>Nombre completo</label>
        <input
          type="text"
          required
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label className={labelClass}>Contraseña temporal</label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} font-mono`}
          />
          <button
            type="button"
            title="Generar otra"
            onClick={() => setPassword(generarPassword())}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border-subtle text-text-secondary hover:bg-surface-hover"
          >
            <Dices className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-text-tertiary">
          El miembro podrá cambiarla al ingresar por primera vez.
        </p>
      </div>

      {error && <p className={errorTextClass}>{error}</p>}

      <button type="submit" disabled={loading} className={`w-full ${primaryButtonClass}`}>
        {loading ? "Creando…" : "Crear cuenta"}
      </button>
    </form>
  );
}
