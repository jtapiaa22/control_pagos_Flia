const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const dateLongFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function formatMonto(monto: number): string {
  return currencyFormatter.format(monto);
}

// Postgres `date` columns arrive as "YYYY-MM-DD" strings. Parsing with a
// fixed UTC time + timeZone: "UTC" avoids the date shifting a day back/forward
// depending on the viewer's local timezone.
export function formatFecha(fecha: string): string {
  return dateFormatter.format(new Date(`${fecha}T00:00:00Z`));
}

export function formatFechaLarga(fecha: string): string {
  return dateLongFormatter.format(new Date(`${fecha}T00:00:00Z`));
}

export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Limpia lo que se escribe en el campo de monto: solo dígitos y UN punto
// decimal (nunca coma — en iPhone el teclado numérico no tiene coma, así que
// si el usuario la escribe igual, la convertimos), con máximo 2 decimales.
export function sanitizeMontoInput(raw: string): string {
  let value = raw.replace(",", ".").replace(/[^0-9.]/g, "");

  const primerPunto = value.indexOf(".");
  if (primerPunto !== -1) {
    const entero = value.slice(0, primerPunto);
    const decimales = value.slice(primerPunto + 1).replace(/\./g, "").slice(0, 2);
    value = `${entero}.${decimales}`;
  }

  return value;
}
