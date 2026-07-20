import type { Case, CaseCreateInput } from "@/lib/types";
import {
  normalizeAvailability,
  normalizePriceCondition,
} from "@/lib/price-display";

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
    wholesalePrice: caseItem.wholesalePrice ?? "",
    priceConditions: normalizePriceCondition(caseItem.priceConditions),
    lotPricing: caseItem.lotPricing ?? "",
    salesFormat: caseItem.salesFormat,
    salesTerms: caseItem.salesTerms ?? "",
    minOrder: caseItem.minOrder ?? "",
    minOrderAmount: caseItem.minOrderAmount ?? "",
    suggestedRetailPrice: caseItem.suggestedRetailPrice ?? "",
    sampleAvailable: normalizeAvailability(caseItem.sampleAvailable),
    testSaleAvailable: normalizeAvailability(caseItem.testSaleAvailable),
    isExclusive: Boolean(caseItem.isExclusive),
    targetCountry: caseItem.targetCountry,
    partnerChannels: caseItem.partnerChannels ?? "",
    partnerRequirements: caseItem.partnerRequirements ?? "",
    productImageUrl: caseItem.productImageUrl?.trim() || null,
  };
}

/** @deprecated use caseToFormInput — kept for any leftover imports */
export const caseToEditInput = caseToFormInput;
