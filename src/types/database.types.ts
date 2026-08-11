// Hand-written to match supabase/migrations/*.sql.
// If you later run the Supabase CLI (`supabase gen types typescript --project-id dzcczrjfpbbavbvdhwzm`),
// you can replace this file with the generated one — keep the same exported names.

export type UserRole = "admin" | "member";
export type PagoEstado = "pendiente" | "pagado" | "vencido";
export type RecurrenciaTipo =
  | "ninguna"
  | "mensual"
  | "bimestral"
  | "trimestral"
  | "semestral"
  | "anual"
  | "cuotas";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nombre_completo: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nombre_completo: string;
          role?: UserRole;
        };
        Update: {
          nombre_completo?: string;
          role?: UserRole;
        };
        Relationships: [];
      };
      categorias: {
        Row: {
          id: string;
          nombre: string;
          icono: string | null;
          orden: number;
        };
        Insert: {
          nombre: string;
          icono?: string | null;
          orden?: number;
        };
        Update: {
          nombre?: string;
          icono?: string | null;
          orden?: number;
        };
        Relationships: [];
      };
      pagos: {
        Row: {
          id: string;
          user_id: string;
          nombre: string;
          monto: number;
          categoria_id: string | null;
          fecha_vencimiento: string;
          fecha_pago: string | null;
          estado: PagoEstado;
          notas: string | null;
          adjunto_path: string | null;
          recurrencia: RecurrenciaTipo;
          recurrencia_activa: boolean;
          cuota_actual: number | null;
          cuotas_totales: number | null;
          serie_id: string | null;
          origen_pago_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          nombre: string;
          monto: number;
          categoria_id?: string | null;
          fecha_vencimiento: string;
          fecha_pago?: string | null;
          estado?: PagoEstado;
          notas?: string | null;
          adjunto_path?: string | null;
          recurrencia?: RecurrenciaTipo;
          recurrencia_activa?: boolean;
          cuota_actual?: number | null;
          cuotas_totales?: number | null;
          serie_id?: string | null;
          origen_pago_id?: string | null;
        };
        Update: {
          nombre?: string;
          monto?: number;
          categoria_id?: string | null;
          fecha_vencimiento?: string;
          fecha_pago?: string | null;
          estado?: PagoEstado;
          notas?: string | null;
          adjunto_path?: string | null;
          recurrencia?: RecurrenciaTipo;
          recurrencia_activa?: boolean;
          cuota_actual?: number | null;
          cuotas_totales?: number | null;
          serie_id?: string | null;
          origen_pago_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pagos_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pagos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
        };
        Update: {
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      pago_notificaciones: {
        Row: {
          id: string;
          pago_id: string;
          dias_antes: number;
          enviado_at: string;
        };
        Insert: {
          pago_id: string;
          dias_antes: number;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "pago_notificaciones_pago_id_fkey";
            columns: ["pago_id"];
            isOneToOne: false;
            referencedRelation: "pagos";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generar_siguiente_ocurrencia: {
        Args: { p_pago_id: string };
        Returns: Database["public"]["Tables"]["pagos"]["Row"];
      };
    };
    Enums: {
      user_role: UserRole;
      pago_estado: PagoEstado;
      recurrencia_tipo: RecurrenciaTipo;
    };
    CompositeTypes: Record<string, never>;
  };
}
