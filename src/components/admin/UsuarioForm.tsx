"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dices } from "lucide-react";

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
      <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950">
        <h2 className="font-medium text-emerald-800 dark:text-emerald-300">
          Cuenta creada
        </h2>
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Compartile estos datos por fuera de la app (WhatsApp, en persona,
          etc.). Va a poder cambiar la contraseña una vez que ingrese.
        </p>
        <dl className="space-y-1 rounded-md bg-white p-3 text-sm dark:bg-neutral-900">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500 dark:text-neutral-400">Email</dt>
            <dd className="font-mono text-gray-900 dark:text-white">
              {creado.email}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500 dark:text-neutral-400">
              Contraseña temporal
            </dt>
            <dd className="font-mono text-gray-900 dark:text-white">
              {creado.password}
            </dd>
          </div>
        </dl>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/usuarios")}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
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
            className="text-sm text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Crear otra cuenta
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
          Nombre completo
        </label>
        <input
          type="text"
          required
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
          Contraseña temporal
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
          <button
            type="button"
            title="Generar otra"
            onClick={() => setPassword(generarPassword())}
            className="shrink-0 rounded-md border border-gray-300 px-3 text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Dices className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
          El miembro podrá cambiarla al ingresar por primera vez.
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? "Creando…" : "Crear cuenta"}
      </button>
    </form>
  );
}
