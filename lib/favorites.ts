import { createClient } from "@/lib/supabase/server";
import type { Case } from "@/lib/types";
import type { CaseRow, SalesFormat, TargetCountry } from "@/lib/types";

type MakerProfileJoin = {
  company_name: string;
  industry: string | null;
  headquarters: string | null;
  founded_year: number | null;
};

type FavoriteRow = {
  case_id: string;
  cases: (CaseRow & {
    profiles: MakerProfileJoin | MakerProfileJoin[] | null;
  }) | null;
};

function mapFavoriteCase(
  row: CaseRow & { profiles: MakerProfileJoin | MakerProfileJoin[] | null },
): Case {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    caseNumber: row.case_number || "—",
    makerId: row.maker_id,
    title: row.title,
    makerName: profile?.company_name ?? "商品提供企業",
    makerIndustry: profile?.industry ?? null,
    makerHeadquarters: profile?.headquarters ?? null,
    makerFoundedYear: profile?.founded_year ?? null,
    category: row.category,
    region: row.region,
    summary: row.summary,
    description: row.description,
    idealPartner: row.ideal_partner,
    offer: row.offer,
    status: row.status,
    productName: row.product_name,
    sku: row.sku?.trim() || null,
    productFeatures: row.product_features,
    priceBand: row.price_band,
    wholesalePrice: row.wholesale_price ?? null,
    priceConditions: row.price_conditions ?? null,
    lotPricing: row.lot_pricing ?? null,
    salesFormat: row.sales_format as SalesFormat,
    salesTerms: row.sales_terms,
    minOrder: row.min_order,
    minOrderAmount: row.min_order_amount ?? null,
    suggestedRetailPrice: row.suggested_retail_price ?? null,
    sampleAvailable: row.sample_available ?? null,
    testSaleAvailable: row.test_sale_available ?? null,
    isExclusive: row.is_exclusive,
    targetCountry: row.target_country as TargetCountry,
    partnerChannels: row.partner_channels,
    partnerRequirements: row.partner_requirements,
    productImageUrl: row.product_image_url ?? null,
    reviewStatus: row.review_status,
    reviewNote: row.review_note,
    createdAt: row.created_at,
  };
}

export async function isFavorite(
  userId: string,
  caseId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("case_id", caseId)
    .maybeSingle();
  return Boolean(data);
}

export async function toggleFavorite(
  userId: string,
  caseId: string,
): Promise<{ favorited: boolean } | { error: string }> {
  const supabase = await createClient();
  const existing = await isFavorite(userId, caseId);

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("case_id", caseId);
    if (error) return { error: error.message };
    return { favorited: false };
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: userId,
    case_id: caseId,
  });
  if (error) return { error: error.message };
  return { favorited: true };
}

export async function listFavoriteCases(userId: string): Promise<Case[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select(
      `
      case_id,
      cases!case_id (
        *,
        profiles!maker_id (
          company_name,
          industry,
          headquarters,
          founded_year
        )
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listFavoriteCases]", error.message);
    return [];
  }

  return ((data ?? []) as unknown as FavoriteRow[])
    .map((row) => {
      const caseRow = Array.isArray(row.cases) ? row.cases[0] : row.cases;
      return caseRow;
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .filter((c) => c.status === "open" && c.review_status === "approved")
    .map(mapFavoriteCase);
}
