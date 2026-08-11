-- Control de Pagos: todo pago pertenece a una "serie" (para poder armar el
-- historial de un servicio), aunque no sea recurrente. Por defecto la serie
-- de un pago nuevo es él mismo; cuando se genera la siguiente ocurrencia de
-- un recurrente (0003_recurrence_function.sql), esa ocurrencia hereda el
-- serie_id del original en vez de generar uno propio.

create function public.set_serie_id_default()
returns trigger
language plpgsql
as $$
begin
  if new.serie_id is null then
    new.serie_id := new.id;
  end if;
  return new;
end;
$$;

create trigger pagos_set_serie_id_default
  before insert on public.pagos
  for each row execute procedure public.set_serie_id_default();

-- Backfill de filas creadas antes de que existiera este trigger.
update public.pagos set serie_id = id where serie_id is null;
