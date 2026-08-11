-- Control de Pagos: rediseño del tracking de notificaciones push para
-- avisar en varios umbrales por pago (5, 2, 1 y 0 días antes del
-- vencimiento, más un aviso al detectarse vencido) en vez de un único
-- aviso por pago para siempre.

create table public.pago_notificaciones (
  id uuid primary key default gen_random_uuid(),
  pago_id uuid not null references public.pagos(id) on delete cascade,
  -- 5, 2, 1, 0 = días antes del vencimiento; -1 = aviso de "recién vencido".
  dias_antes smallint not null,
  enviado_at timestamptz not null default now(),
  unique (pago_id, dias_antes)
);

create index pago_notificaciones_pago_id_idx on public.pago_notificaciones(pago_id);

-- Tabla de uso interno del cron (service-role): RLS habilitado sin
-- policies, así que ningún usuario ni siquiera autenticado puede leerla o
-- escribirla vía la API pública — el service-role sigue bypaseando RLS
-- como en el resto del sistema.
alter table public.pago_notificaciones enable row level security;

alter table public.pagos drop column ultima_notificacion_enviada;
