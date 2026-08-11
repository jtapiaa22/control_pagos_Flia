import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PagoEstado } from "@/types/database.types";
import type { Pago } from "@/types/domain";

const PAGO_SELECT = "*, categoria:categorias(id, nombre, icono)";

export interface PagoFiltros {
  estado?: PagoEstado;
  categoriaId?: string;
  // Solo tiene efecto si el caller es admin (RLS pagos_select_admin);
  // para un usuario normal, cualquier consulta ya está limitada a lo suyo.
  userId?: string;
}

// Colapsa todas las ocurrencias de un mismo servicio (misma serie) a una
// sola fila: la que no está pagada con vencimiento más próximo (lo más
// urgente), o si ya está todo pagado, la más reciente. El resto de la
// historia se ve en la tabla de historial del detalle de cada pago
// (listarHistorialSerie), no acá — así la lista principal no se llena de
// ocurrencias viejas de un mismo servicio.
function unaFilaPorServicio(pagos: Pago[]): Pago[] {
  const grupos = new Map<string, Pago[]>();
  for (const p of pagos) {
    const key = p.serie_id ?? p.id;
    const grupo = grupos.get(key);
    if (grupo) grupo.push(p);
    else grupos.set(key, [p]);
  }

  const resultado: Pago[] = [];
  for (const grupo of grupos.values()) {
    const noPagados = grupo.filter((p) => p.estado !== "pagado");
    const elegido =
      noPagados.length > 0
        ? noPagados.sort((a, b) =>
            a.fecha_vencimiento.localeCompare(b.fecha_vencimiento)
          )[0]
        : grupo.sort((a, b) =>
            b.fecha_vencimiento.localeCompare(a.fecha_vencimiento)
          )[0];
    resultado.push(elegido);
  }

  return resultado.sort((a, b) =>
    a.fecha_vencimiento.localeCompare(b.fecha_vencimiento)
  );
}

export async function listarPagos(filtros: PagoFiltros = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("pagos")
    .select(PAGO_SELECT)
    .order("fecha_vencimiento", { ascending: true });

  if (filtros.estado) query = query.eq("estado", filtros.estado);
  if (filtros.categoriaId) query = query.eq("categoria_id", filtros.categoriaId);
  if (filtros.userId) query = query.eq("user_id", filtros.userId);

  const { data, error } = await query;
  if (error) throw error;
  return unaFilaPorServicio(data);
}

// Todas las filas pagadas con fecha_pago en el rango dado, SIN colapsar por
// serie (a diferencia de listarPagos) — necesario para que "pagado este
// mes" sume bien incluso si se adelantaron varias cuotas de una misma
// serie dentro del mismo mes (listarPagos mostraría solo una).
export async function listarPagosPagadosEnRango(desde: string, hasta: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pagos")
    .select(PAGO_SELECT)
    .eq("estado", "pagado")
    .gte("fecha_pago", desde)
    .lte("fecha_pago", hasta)
    .order("fecha_pago", { ascending: false });

  if (error) throw error;
  return data;
}

export async function obtenerPago(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pagos")
    .select(PAGO_SELECT)
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function listarCategorias() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("orden");

  if (error) throw error;
  return data;
}

// Otras ocurrencias del mismo servicio (misma serie), sin incluir la que ya
// se está viendo. Todo pago pertenece a una serie desde su creación (ver
// supabase/migrations/0006_serie_id_default.sql), así que esto funciona
// tanto para recurrentes como para pagos únicos (ahí simplemente da vacío).
export async function listarHistorialSerie(serieId: string, excluirId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pagos")
    .select(PAGO_SELECT)
    .eq("serie_id", serieId)
    .neq("id", excluirId)
    .order("fecha_vencimiento", { ascending: false });

  if (error) throw error;
  return data;
}

// Solo resuelve si el caller tiene permiso de leerlo (uno mismo, o el admin
// leyendo cualquier perfil vía profiles_select_admin).
export async function obtenerPerfil(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, nombre_completo, email")
    .eq("id", id)
    .single();

  return data;
}
