-- Control de Pagos: esquema inicial
-- profiles, categorias, pagos, bucket de adjuntos.

create extension if not exists "pgcrypto"; -- gen_random_uuid()

create type public.user_role as enum ('admin', 'member');
create type public.pago_estado as enum ('pendiente', 'pagado', 'vencido');
create type public.recurrencia_tipo as enum (
  'ninguna', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual'
);

-- ---------------------------------------------------------------------------
-- profiles: extiende auth.users con nombre y rol de la app.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nombre_completo text not null,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now()
);

-- Crea automáticamente la fila de profiles al crearse el usuario en Supabase Auth.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nombre_completo, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre_completo', new.email),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- categorias: lista fija, editable solo por el admin.
-- ---------------------------------------------------------------------------
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  icono text,
  orden int not null default 0
);

insert into public.categorias (nombre, orden) values
  ('Telefonía', 1),
  ('Internet', 2),
  ('Streaming', 3),
  ('Tarjetas', 4),
  ('Servicios (luz/gas/agua)', 5),
  ('Alquiler', 6),
  ('Seguros', 7),
  ('Educación', 8),
  ('Otros', 9);

-- ---------------------------------------------------------------------------
-- pagos: entidad central.
-- ---------------------------------------------------------------------------
create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nombre text not null,
  monto numeric(12, 2) not null check (monto >= 0),
  categoria_id uuid references public.categorias(id),
  fecha_vencimiento date not null,
  fecha_pago date,
  estado public.pago_estado not null default 'pendiente',
  notas text,
  adjunto_path text,
  recurrencia public.recurrencia_tipo not null default 'ninguna',
  recurrencia_activa boolean not null default true,
  serie_id uuid,
  origen_pago_id uuid references public.pagos(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pagos_user_id_idx on public.pagos(user_id);
create index pagos_fecha_vencimiento_idx on public.pagos(fecha_vencimiento);
create index pagos_estado_idx on public.pagos(estado);
create index pagos_serie_id_idx on public.pagos(serie_id);
create index pagos_origen_pago_id_idx on public.pagos(origen_pago_id);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pagos_set_updated_at
  before update on public.pagos
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Storage: bucket privado para comprobantes/adjuntos.
-- Convención de ruta: {user_id}/{pago_id}/{filename}
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('adjuntos', 'adjuntos', false)
on conflict (id) do nothing;
