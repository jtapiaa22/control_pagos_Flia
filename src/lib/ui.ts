// Clases Tailwind compartidas para no repetir los mismos estilos de
// inputs/botones/cards en cada formulario. Usan los tokens de
// src/app/globals.css (paleta "Saldo").

export const inputClass =
  "h-10 w-full rounded-md border border-border-subtle bg-surface-card px-3 text-sm text-text-primary outline-none focus:border-border-focus focus:ring-2 focus:ring-pino-600/20";

export const labelClass = "block text-sm font-medium text-text-secondary";

export const cardClass = "rounded-lg border border-border-subtle bg-surface-card p-5";

export const primaryButtonClass =
  "flex h-10 items-center justify-center gap-1.5 rounded-md bg-action-primary px-3 text-sm font-medium text-action-primary-text transition hover:bg-action-primary-hover active:bg-action-primary-pressed disabled:opacity-60";

export const secondaryButtonClass =
  "flex h-10 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-card px-3 text-sm font-medium text-text-secondary transition hover:bg-surface-hover disabled:opacity-60";

export const dangerButtonClass =
  "flex h-10 items-center justify-center gap-1.5 rounded-md border border-clay-300 bg-surface-card px-3 text-sm font-medium text-action-danger transition hover:bg-clay-50 disabled:opacity-60";

export const errorTextClass =
  "rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-700";
