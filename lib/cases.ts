import { createClient } from "@/lib/supabase/server";
import type {
  Case,
  CaseCreateInput,
  CaseRow,
  SalesFormat,
  TargetCountry,
} from "@/lib/types";

type MakerProfileJoin = {
  company_name: string;
  industry: string | null;
  headquarters: string | null;
  founded_year: number | null;
};

type CaseWithMaker = CaseRow & {
  profiles: MakerProfileJoin | MakerProfileJoin[] | null;
};

function mapCase(row: CaseWithMaker): Case {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return {
    id: row.id,
    makerId: row.maker_id,
    title: row.title,
    makerName: profile?.company_name ?? "メーカー",
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
    productFeatures: row.product_features,
    priceBand: row.price_band,
    salesFormat: row.sales_format as SalesFormat,
    salesTerms: row.sales_terms,
    minOrder: row.min_order,
    isExclusive: row.is_exclusive,
    targetCountry: row.target_country as TargetCountry,
    partnerChannels: row.partner_channels,
    partnerRequirements: row.partner_requirements,
    reviewStatus: row.review_status,
    reviewNote: row.review_note,
    createdAt: row.created_at,
  };
}

const caseSelect = `
  *,
  profiles!maker_id (
    company_name,
    industry,
    headquarters,
    founded_year
  )
`;

export async function listOpenCases(): Promise<Case[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select(caseSelect)
    .eq("status", "open")
    .eq("review_status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listOpenCases]", error.message);
    return [];
  }

  return ((data ?? []) as CaseWithMaker[]).map(mapCase);
}

export async function listOpenCasesByMaker(
  makerId: string,
  limit = 5,
): Promise<Case[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select(caseSelect)
    .eq("status", "open")
    .eq("review_status", "approved")
    .eq("maker_id", makerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[listOpenCasesByMaker]", error.message);
    return [];
  }

  return ((data ?? []) as CaseWithMaker[]).map(mapCase);
}

export async function getCaseById(id: string): Promise<Case | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select(caseSelect)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getCaseById]", error.message);
    return null;
  }

  return mapCase(data as CaseWithMaker);
}

export async function getLatestCases(limit = 6): Promise<Case[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select(caseSelect)
    .eq("status", "open")
    .eq("review_status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getLatestCases]", error.message);
    return [];
  }

  return ((data ?? []) as CaseWithMaker[]).map(mapCase);
}

/** @deprecated use getLatestCases / getPopularCases */
export async function getFeaturedCases(limit = 3): Promise<Case[]> {
  return getLatestCases(limit);
}

export async function getPopularCases(limit = 6): Promise<Case[]> {
  const supabase = await createClient();
  const { data: ids, error: rpcError } = await supabase.rpc(
    "get_popular_open_case_ids",
    { lim: limit },
  );

  if (rpcError || !ids?.length) {
    if (rpcError) {
      console.error("[getPopularCases]", rpcError.message);
    }
    return getLatestCases(limit);
  }

  const idList = ids as string[];
  const { data, error } = await supabase
    .from("cases")
    .select(caseSelect)
    .in("id", idList);

  if (error) {
    console.error("[getPopularCases]", error.message);
    return getLatestCases(limit);
  }

  const mapped = ((data ?? []) as CaseWithMaker[]).map(mapCase);
  const order = new Map(idList.map((id, i) => [id, i]));
  return mapped.sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  );
}

export async function countOpenCases(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("cases")
    .select("id", { count: "exact", head: true })
    .eq("status", "open")
    .eq("review_status", "approved");

  if (error) {
    console.error("[countOpenCases]", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function createCase(
  makerId: string,
  input: CaseCreateInput,
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .insert({
      maker_id: makerId,
      title: input.title,
      category: input.category,
      region: input.region,
      summary: input.summary,
      description: input.description,
      ideal_partner: input.idealPartner,
      offer: input.offer,
      product_name: input.productName,
      product_features: input.productFeatures.trim() || null,
      price_band: input.priceBand.trim() || null,
      sales_format: input.salesFormat,
      sales_terms: input.salesTerms.trim() || null,
      min_order: input.minOrder.trim() || null,
      is_exclusive: input.isExclusive,
      target_country: input.targetCountry,
      partner_channels: input.partnerChannels.trim() || null,
      partner_requirements: input.partnerRequirements.trim() || null,
      status: "open",
      review_status: "pending_review",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "案件の登録に失敗しました" };
  }

  return { id: data.id as string };
}
