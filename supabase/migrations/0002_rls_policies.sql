-- Control de Pagos: Row Level Security
-- Este es el mecanismo real de aislamiento de datos: aplica siempre,
-- incluso ante llamadas directas a la API REST de Supabase.

alter table public.profiles enable row level security;
alter table public.categorias enable row level security;
alter table public.pagos enable row level security;

-- security definer: puede leer profiles sin pasar por la propia policy de
-- profiles (evitaría recursión infinita), pero solo se usa para chequear rol.
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin())
  with check (public.is_admin());

-- Nadie puede autoasignarse el rol admin, ni siquiera editando su propia fila.
create function public.prevent_role_self_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    raise exception 'No autorizado para cambiar el rol';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_role_self_escalation();

-- No hay policy de insert: las filas de profiles solo se crean vía el
-- trigger handle_new_user (security definer) o el cliente service-role
-- (que de todos modos bypassea RLS), nunca directamente por un usuario.

-- ---------------------------------------------------------------------------
-- categorias: lectura para cualquier usuario autenticado, escritura solo admin.
-- ---------------------------------------------------------------------------
create policy "categorias_select_all" on public.categorias
  for select using (auth.role() = 'authenticated');

create policy "categorias_admin_write" on public.categorias
  for all using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- pagos: cada usuario solo ve/edita lo suyo. El admin además puede LEER
-- (no editar) los pagos de todos los miembros, por decisión explícita del
-- dueño de la app para supervisión familiar.
-- ---------------------------------------------------------------------------
create policy "pagos_select_own" on public.pagos
  for select using (user_id = auth.uid());

create policy "pagos_select_admin" on public.pagos
  for select using (public.is_admin());

create policy "pagos_insert_own" on public.pagos
  for insert with check (user_id = auth.uid());

create policy "pagos_update_own" on public.pagos
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "pagos_delete_own" on public.pagos
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: mismo criterio, primer segmento de la ruta = user_id.
-- ---------------------------------------------------------------------------
create policy "adjuntos_select_own" on storage.objects
  for select using (
    bucket_id = 'adjuntos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "adjuntos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'adjuntos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "adjuntos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'adjuntos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
