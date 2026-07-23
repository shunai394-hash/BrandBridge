import type { SessionUser } from "@/lib/types";

/**
 * Company name on product detail is hidden by default.
 * Visible only after a sales partner logs in, or after a negotiation has started.
 */
export function canViewMakerCompanyName(
  user: SessionUser | null | undefined,
  alreadyApplied: boolean,
): boolean {
  if (alreadyApplied) return true;
  if (user?.role === "partner") return true;
  return false;
}
