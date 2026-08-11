-- Control de Pagos: generación de la siguiente ocurrencia de un pago recurrente.
-- security invoker (default): al insertar, sigue aplicando la policy
-- pagos_insert_own tal cual, así que solo genera filas dentro de lo que el
-- caller tiene permitido. El cron (service-role) bypassea RLS igual que en
-- cualquier otra tabla, así que puede operar sobre pagos de cualquier usuario.

create function public.calcular_proxima_fecha(
  fecha_actual date,
  tipo public.recurrencia_tipo
)
returns date
language sql
immutable
as $$
  select case tipo
    when 'mensual'    then fecha_actual + interval '1 month'
    when 'bimestral'  then fecha_actual + interval '2 months'
    when 'trimestral' then fecha_actual + interval '3 months'
    when 'semestral'  then fecha_actual + interval '6 months'
    when 'anual'      then fecha_actual + interval '1 year'
    else null
  end::date;
$$;

create function public.generar_siguiente_ocurrencia(p_pago_id uuid)
returns public.pagos
language plpgsql
as $$
declare
  original public.pagos;
  nueva public.pagos;
begin
  select * into original from public.pagos where id = p_pago_id;

  if original is null then
    raise exception 'Pago % no encontrado (o no visible para el usuario actual)', p_pago_id;
  end if;

  if original.recurrencia = 'ninguna' or not original.recurrencia_activa then
    return null;
  end if;

  -- Evita duplicados si la función se llama más de una vez para el mismo pago.
  if exists (select 1 from public.pagos where origen_pago_id = p_pago_id) then
    return null;
  end if;

  insert into public.pagos (
    user_id, nombre, monto, categoria_id, fecha_vencimiento, estado,
    notas, recurrencia, recurrencia_activa, serie_id, origen_pago_id
  ) values (
    original.user_id,
    original.nombre,
    original.monto,
    original.categoria_id,
    public.calcular_proxima_fecha(original.fecha_vencimiento, original.recurrencia),
    'pendiente',
    original.notas,
    original.recurrencia,
    original.recurrencia_activa,
    coalesce(original.serie_id, original.id),
    original.id
  )
  returning * into nueva;

  return nueva;
end;
$$;
