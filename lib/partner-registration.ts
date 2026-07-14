import type {
  PartnerProfileDraftMeta,
  PartnerRegistrationInput,
} from "@/lib/types";

export function toPartnerDraftMeta(
  input: PartnerRegistrationInput,
): PartnerProfileDraftMeta {
  return {
    displayName: input.displayName,
    entityType: input.entityType,
    companyName: input.companyName,
    contactName: input.contactName,
    salesGenres: input.salesGenres,
    salesChannels: input.salesChannels,
    area: input.area,
    preferredCategories: input.preferredCategories,
    preferredDealTypes: input.preferredDealTypes,
    achievements: input.achievements,
    selfPr: input.selfPr,
  };
}

export function partnerProfilePayloadFromDraft(draft: PartnerProfileDraftMeta) {
  const displayName = draft.displayName.trim();
  const companyName =
    draft.entityType === "corporate"
      ? draft.companyName.trim() || displayName
      : displayName || draft.companyName.trim();

  return {
    company_name: companyName,
    contact_name: draft.contactName.trim(),
    display_name: displayName || null,
    entity_type: draft.entityType,
    sales_genres: draft.salesGenres.join(" / ") || null,
    sales_channel: draft.salesChannels.join(" / ") || null,
    area: draft.area.trim() || null,
    preferred_categories: draft.preferredCategories.join(" / ") || null,
    preferred_deal_types: draft.preferredDealTypes.join(" / ") || null,
    achievements: draft.achievements.trim() || null,
    description: draft.selfPr.trim() || null,
    strength:
      draft.salesGenres.length > 0
        ? `得意ジャンル: ${draft.salesGenres.join(" / ")}`
        : null,
    onboarding_completed: true,
  };
}
