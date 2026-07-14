import type { UserRole } from "@/lib/types";

/** Role-specific negotiation inbox path */
export function negotiationsListPath(role: UserRole | null | undefined): string {
  if (role === "maker") return "/maker/negotiations";
  if (role === "partner") return "/partner/negotiations";
  if (role === "admin") return "/admin/negotiations";
  return "/negotiations";
}
