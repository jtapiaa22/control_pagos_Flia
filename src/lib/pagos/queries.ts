import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PagoEstado } from "@/types/database.types";

const PAGO_SELECT = "*, categoria:categorias(id, nombre, icono)";

export interface PagoFiltros {
  estado?: PagoEstado;
  categoriaId?: string;
  // Solo tiene efecto si el caller es admin (RLS pagos_select_admin);
  // para un usuario normal, cualquier consulta ya está limitada a lo suyo.
  userId?: string;
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
