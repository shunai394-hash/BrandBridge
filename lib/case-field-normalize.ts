import type { Case, CaseCreateInput } from "@/lib/types";

/**
 * Map DB case → edit form input AS-IS.
 * No auto-copy, no auto-complete, no field rewriting.
 */
export function caseToFormInput(caseItem: Case): CaseCreateInput {
  return {
    title: caseItem.title ?? "",
    category: caseItem.category ?? "",
    region: caseItem.region ?? "",
    summary: caseItem.summary ?? "",
    description: caseItem.description ?? "",
    idealPartner: caseItem.idealPartner ?? "",
    offer: caseItem.offer ?? "",
    sku: caseItem.sku ?? "",
    productName: caseItem.productName ?? "",
    productFeatures: caseItem.productFeatures ?? "",
    priceBand: caseItem.priceBand ?? "",
    salesFormat: caseItem.salesFormat,
    salesTerms: caseItem.salesTerms ?? "",
    minOrder: caseItem.minOrder ?? "",
    isExclusive: Boolean(caseItem.isExclusive),
    targetCountry: caseItem.targetCountry,
    partnerChannels: caseItem.partnerChannels ?? "",
    partnerRequirements: caseItem.partnerRequirements ?? "",
    productImageUrl: caseItem.productImageUrl?.trim() || null,
  };
}

/** @deprecated use caseToFormInput — kept for any leftover imports */
export const caseToEditInput = caseToFormInput;
