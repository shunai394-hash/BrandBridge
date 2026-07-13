import { createClient } from "@/lib/supabase/server";
import type {
  Profile,
  ProfileUpdateInput,
  PublicProfile,
} from "@/lib/types";

export function toPublicProfile(profile: Profile): PublicProfile {
  return {
    id: profile.id,
    role: profile.role,
    companyName: profile.display_name?.trim() || profile.company_name,
    contactName: profile.contact_name,
    industry: profile.industry,
    productOverview: profile.product_overview,
    salesChannel: profile.sales_channel,
    area: profile.area,
    strength: profile.strength,
    description: profile.description,
    websiteUrl: profile.website_url,
    headquarters: profile.headquarters,
    foundedYear: profile.founded_year,
    employeeRange: profile.employee_range,
    corporateNumber: profile.corporate_number,
    achievements: profile.achievements,
    displayName: profile.display_name,
    entityType: profile.entity_type,
    salesGenres: profile.sales_genres,
    preferredCategories: profile.preferred_categories,
    preferredDealTypes: profile.preferred_deal_types,
    createdAt: profile.created_at,
  };
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getProfileById]", error.message);
    return null;
  }

  return data as Profile;
}

export async function updateProfile(
  userId: string,
  input: ProfileUpdateInput,
  role: "maker" | "partner",
): Promise<{ error?: string }> {
  const foundedYearRaw = input.foundedYear.trim();
  let foundedYear: number | null = null;
  if (foundedYearRaw) {
    const parsed = Number.parseInt(foundedYearRaw, 10);
    if (Number.isNaN(parsed)) {
      return { error: "設立年は数値で入力してください" };
    }
    foundedYear = parsed;
  }

  const payload: Record<string, unknown> = {
    company_name: input.companyName.trim(),
    contact_name: input.contactName.trim(),
    description: input.description.trim() || null,
    website_url: input.websiteUrl.trim() || null,
    headquarters: input.headquarters.trim() || null,
    founded_year: foundedYear,
    employee_range: input.employeeRange.trim() || null,
    corporate_number: input.corporateNumber.trim() || null,
    achievements: input.achievements.trim() || null,
  };

  if (role === "maker") {
    payload.industry = input.industry?.trim() || null;
    payload.product_overview = input.productOverview?.trim() || null;
  } else {
    payload.sales_channel = input.salesChannel?.trim() || null;
    payload.area = input.area?.trim() || null;
    payload.strength = input.strength?.trim() || null;
    payload.display_name = input.displayName?.trim() || null;
    payload.entity_type = input.entityType || null;
    payload.sales_genres = input.salesGenres?.trim() || null;
    payload.preferred_categories = input.preferredCategories?.trim() || null;
    payload.preferred_deal_types = input.preferredDealTypes?.trim() || null;
    payload.onboarding_completed = true;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  return {};
}
