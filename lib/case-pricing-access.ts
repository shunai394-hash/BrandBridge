import type { Case, SessionUser } from "@/lib/types";

/** Fields visible only to partners (and owners/admins for management). */
export const PARTNER_ONLY_PRICING_KEYS = [
  "wholesalePrice",
  "lotPricing",
  "minOrderAmount",
  "priceConditions",
  "testSaleAvailable",
] as const;

export type PartnerOnlyPricingKey = (typeof PARTNER_ONLY_PRICING_KEYS)[number];

export function canViewPartnerPricing(
  caseItem: Pick<Case, "makerId">,
  user: SessionUser | null | undefined,
): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role === "partner") return true;
  if (user.role === "maker" && user.id === caseItem.makerId) return true;
  return false;
}

/** Null out partner-only pricing for unauthorized viewers (server-side). */
export function redactPartnerPricing(caseItem: Case): Case {
  return {
    ...caseItem,
    wholesalePrice: null,
    lotPricing: null,
    minOrderAmount: null,
    priceConditions: null,
    testSaleAvailable: null,
  };
}

export function applyPricingVisibility(
  caseItem: Case,
  user: SessionUser | null | undefined,
): Case {
  if (canViewPartnerPricing(caseItem, user)) return caseItem;
  return redactPartnerPricing(caseItem);
}
