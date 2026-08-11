"use client";

import { useState, type ChangeEvent } from "react";
import { Paperclip, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AdjuntoUploader({
  pagoId,
  userId,
  adjuntoPathInicial,
}: {
  pagoId: string;
  userId: string;
  adjuntoPathInicial: string | null;
}) {
  const [adjuntoPath, setAdjuntoPath] = useState(adjuntoPathInicial);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSubiendo(true);

    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${userId}/${pagoId}/comprobante.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("adjuntos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("No se pudo subir el archivo.");
      setSubiendo(false);
      return;
    }

    const res = await fetch(`/api/pagos/${pagoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adjunto_path: path }),
    });

    setSubiendo(false);

    if (!res.ok) {
      setError("Se subió el archivo pero no se pudo guardar la referencia.");
      return;
    }

    setAdjuntoPath(path);
  }

  async function handleVer() {
    if (!adjuntoPath) return;
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("adjuntos")
      .createSignedUrl(adjuntoPath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function handleQuitar() {
    if (!adjuntoPath) return;
    setSubiendo(true);
    const supabase = createClient();
    await supabase.storage.from("adjuntos").remove([adjuntoPath]);
    await fetch(`/api/pagos/${pagoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adjunto_path: null }),
    });
    setSubiendo(false);
    setAdjuntoPath(null);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
        Comprobante
      </label>
      {adjuntoPath ? (
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={handleVer}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Paperclip className="h-4 w-4" /> Ver comprobante
          </button>
          <button
            type="button"
            onClick={handleQuitar}
            disabled={subiendo}
            className="text-gray-400 hover:text-red-600"
            title="Quitar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="mt-1 flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800">
          {subiendo ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
          {subiendo ? "Subiendo…" : "Adjuntar foto o PDF"}
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFile}
            disabled={subiendo}
          />
        </label>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
