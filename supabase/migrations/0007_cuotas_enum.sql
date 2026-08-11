-- Control de Pagos: agrega 'cuotas' como tipo de recurrencia (plan con
-- cantidad fija de pagos, a diferencia de mensual/anual/etc que se repiten
-- indefinidamente).
--
-- IMPORTANTE: correr este archivo solo, esperar "Success", y recién después
-- correr 0008_cuotas_columns.sql. Postgres no permite usar un valor de enum
-- nuevo en el mismo lote/transacción en que se lo agrega.

alter type public.recurrencia_tipo add value 'cuotas';
