import type { UserRole } from "@/types/database.types";

export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}
