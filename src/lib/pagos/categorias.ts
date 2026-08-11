import {
  Phone,
  Wifi,
  MonitorPlay,
  CreditCard,
  Zap,
  House,
  Shield,
  BookOpen,
  Receipt,
  type LucideIcon,
} from "lucide-react";

interface CategoriaEstilo {
  icon: LucideIcon;
  iconClass: string;
  bgClass: string;
}

const categoriaEstiloDefault: CategoriaEstilo = {
  icon: Receipt,
  iconClass: "text-ink-400",
  bgClass: "bg-paper-200",
};

// Mapea las categorías fijas sembradas en la base (ver
// supabase/migrations/0001_init_schema.sql) a un ícono y color propios,
// siguiendo la misma paleta que el resto del sistema de diseño.
const categoriaEstilos: Record<string, CategoriaEstilo> = {
  Telefonía: { icon: Phone, iconClass: "text-indigo-500", bgClass: "bg-indigo-50" },
  Internet: { icon: Wifi, iconClass: "text-pino-500", bgClass: "bg-pino-50" },
  Streaming: { icon: MonitorPlay, iconClass: "text-pino-300", bgClass: "bg-pino-50" },
  Tarjetas: { icon: CreditCard, iconClass: "text-indigo-700", bgClass: "bg-indigo-50" },
  "Servicios (luz/gas/agua)": {
    icon: Zap,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-50",
  },
  Alquiler: { icon: House, iconClass: "text-ink-700", bgClass: "bg-paper-200" },
  Seguros: { icon: Shield, iconClass: "text-indigo-600", bgClass: "bg-indigo-50" },
  Educación: { icon: BookOpen, iconClass: "text-amber-700", bgClass: "bg-amber-50" },
  Otros: categoriaEstiloDefault,
};

export function obtenerEstiloCategoria(nombre?: string | null): CategoriaEstilo {
  if (!nombre) return categoriaEstiloDefault;
  return categoriaEstilos[nombre] ?? categoriaEstiloDefault;
}
