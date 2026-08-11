import type { Database } from "@/types/database.types";

export type Categoria = Database["public"]["Tables"]["categorias"]["Row"];

export type Pago = Database["public"]["Tables"]["pagos"]["Row"] & {
  categoria: Pick<Categoria, "id" | "nombre" | "icono"> | null;
};
