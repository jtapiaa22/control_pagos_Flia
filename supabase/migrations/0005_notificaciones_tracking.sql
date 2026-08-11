-- Control de Pagos: evita reenviar la misma notificación push en cada
-- corrida diaria del cron para el mismo vencimiento.

alter table public.pagos
  add column ultima_notificacion_enviada timestamptz;
