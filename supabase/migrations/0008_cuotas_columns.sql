-- Control de Pagos: columnas de progreso de cuotas + lógica de generación
-- de la siguiente cuota (con auto-cierre al llegar a la última).
-- Correr DESPUÉS de 0007_cuotas_enum.sql (ver nota ahí).

alter table public.pagos
  add column cuota_actual smallint,
  add column cuotas_totales smallint;

alter table public.pagos
  add constraint pagos_cuotas_check check (
    (recurrencia <> 'cuotas' and cuota_actual is null and cuotas_totales is null)
    or (
      recurrencia = 'cuotas'
      and cuota_actual is not null
      and cuotas_totales is not null
      and cuota_actual >= 1
      and cuotas_totales >= 1
      and cuota_actual <= cuotas_totales
    )
  );

-- Agrega el caso 'cuotas' (cuotas son siempre mensuales).
create or replace function public.calcular_proxima_fecha(
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
    when 'cuotas'     then fecha_actual + interval '1 month'
    else null
  end::date;
$$;

-- Igual que antes, pero: (a) propaga cuota_actual/cuotas_totales a la fila
-- nueva, y (b) si es un plan de cuotas y la que se acaba de pagar era la
-- última (cuota_actual = cuotas_totales), no genera nada más — el plan
-- queda cerrado solo, sin necesidad de tocar código de la aplicación.
create or replace function public.generar_siguiente_ocurrencia(p_pago_id uuid)
returns public.pagos
language plpgsql
as $$
declare
  original public.pagos;
  nueva public.pagos;
  siguiente_cuota smallint;
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

  if original.recurrencia = 'cuotas' then
    siguiente_cuota := original.cuota_actual + 1;
    if siguiente_cuota > original.cuotas_totales then
      return null; -- última cuota pagada: plan cerrado.
    end if;
  end if;

  insert into public.pagos (
    user_id, nombre, monto, categoria_id, fecha_vencimiento, estado,
    notas, recurrencia, recurrencia_activa, serie_id, origen_pago_id,
    cuota_actual, cuotas_totales
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
    original.id,
    siguiente_cuota,
    original.cuotas_totales
  )
  returning * into nueva;

  return nueva;
end;
$$;
