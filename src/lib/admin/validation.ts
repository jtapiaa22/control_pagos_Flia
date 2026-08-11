import { z } from "zod";

export const crearUsuarioSchema = z.object({
  email: z.string().email("Email inválido"),
  nombre_completo: z
    .string()
    .min(2, "El nombre es muy corto")
    .max(80, "El nombre es muy largo"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
