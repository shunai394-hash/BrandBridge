import type { Profile, PublicProfile } from "@/lib/types";
import type { BusinessPrBrief } from "@/lib/marketing-agent/business-pr-script";

/**
 * Company fields the auto PR-video path consumes.
 * Mapped from existing Profile / business brief — not a second company store.
 */
export type CompanyPrContext = {
  companyName: string;
  website?: string | null;
  description: string;
  businessType?: string | null;
  targetAudience: string;
  country?: string | null;
  services?: string | null;
  sellingPoints?: string | null;
  cta?: string | null;
};

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function companyPrContextFromBrief(brief: BusinessPrBrief): CompanyPrContext {
  return {
    companyName: brief.companyName,
    website: brief.website ?? null,
    description: brief.businessDescription,
    businessType: brief.businessType ?? null,
    targetAudience: brief.targetAudience,
    country: brief.country ?? brief.japanMarketRelation ?? null,
    services: brief.services ?? brief.businessDescription,
    sellingPoints: brief.sellingPoints ?? brief.mood ?? null,
    cta: brief.videoPurpose,
  };
}

export function companyPrContextFromProfile(
  profile: Profile | PublicProfile,
): Partial<CompanyPrContext> {
  const isPublic = "companyName" in profile;
  const companyName = isPublic
    ? text((profile as PublicProfile).companyName)
    : text((profile as Profile).company_name) ||
      text((profile as Profile).display_name);
  const website = isPublic
    ? text((profile as PublicProfile).websiteUrl)
    : text((profile as Profile).website_url);
  const description =
    (isPublic
      ? text((profile as PublicProfile).description) ||
        text((profile as PublicProfile).productOverview)
      : text((profile as Profile).description) ||
        text((profile as Profile).product_overview)) ?? undefined;
  const businessType = isPublic
    ? text((profile as PublicProfile).industry)
    : text((profile as Profile).industry);
  const country = isPublic
    ? text((profile as PublicProfile).headquarters) ||
      text((profile as PublicProfile).area)
    : text((profile as Profile).headquarters) || text((profile as Profile).area);
  const services = isPublic
    ? text((profile as PublicProfile).salesChannel) ||
      text((profile as PublicProfile).productOverview)
    : text((profile as Profile).sales_channel) ||
      text((profile as Profile).product_overview);
  const sellingPoints = isPublic
    ? text((profile as PublicProfile).strength) ||
      text((profile as PublicProfile).achievements)
    : text((profile as Profile).strength) || text((profile as Profile).achievements);

  return {
    companyName: companyName ?? undefined,
    website,
    description,
    businessType,
    country,
    services,
    sellingPoints,
  };
}

export function mergeCompanyPrContext(
  primary: CompanyPrContext,
  extra?: Partial<CompanyPrContext> | null,
): CompanyPrContext {
  if (!extra) return primary;
  return {
    companyName: extra.companyName?.trim() || primary.companyName,
    website: extra.website ?? primary.website,
    description: extra.description?.trim() || primary.description,
    businessType: extra.businessType ?? primary.businessType,
    targetAudience: extra.targetAudience?.trim() || primary.targetAudience,
    country: extra.country ?? primary.country,
    services: extra.services ?? primary.services,
    sellingPoints: extra.sellingPoints ?? primary.sellingPoints,
    cta: extra.cta ?? primary.cta,
  };
}
