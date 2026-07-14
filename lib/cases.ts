import {
  formatSupabaseError,
  normalizeCaseCreateInput,
  validateCaseCreateInput,
} from "@/lib/case-validation";
import { createClient } from "@/lib/supabase/server";
import type {
  Case,
  CaseCreateInput,
  CaseRow,
  ReviewStatus,
  SalesFormat,
  TargetCountry,
} from "@/lib/types";

/** Beta: newly created cases are immediately approved so they appear on /cases. */
export function isBetaAutoApproveCases(): boolean {
  return (
    process.env.BETA_AUTO_APPROVE_CASES === "true" ||
    process.env.NEXT_PUBLIC_BETA_MODE === "true"
  );
}

function betaAutoApproveCases(): boolean {
  return isBetaAutoApproveCases();
}

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
    caseNumber: row.case_number || "—",
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
    productImageUrl: row.product_image_url ?? null,
    reviewStatus: row.review_status,
    reviewNote: row.review_note,
    createdAt: row.created_at,
  };
}

/** applicationCount = all negotiations; negotiationCount = accepted / in pipeline */
export async function attachNegotiationCounts(
  cases: Case[],
): Promise<Case[]> {
  if (cases.length === 0) return cases;

  const supabase = await createClient();
  const ids = cases.map((c) => c.id);
  const { data, error } = await supabase
    .from("negotiations")
    .select("case_id, application_status, pipeline_status")
    .in("case_id", ids);

  if (error) {
    console.error("[attachNegotiationCounts]", error.message);
    return cases.map((c) => ({
      ...c,
      applicationCount: c.applicationCount ?? 0,
      negotiationCount: c.negotiationCount ?? 0,
    }));
  }

  const application = new Map<string, number>();
  const negotiation = new Map<string, number>();
  for (const row of data ?? []) {
    const caseId = row.case_id as string;
    application.set(caseId, (application.get(caseId) ?? 0) + 1);
    const inPipeline =
      row.application_status === "accepted" ||
      Boolean(row.pipeline_status);
    if (inPipeline) {
      negotiation.set(caseId, (negotiation.get(caseId) ?? 0) + 1);
    }
  }

  return cases.map((c) => ({
    ...c,
    applicationCount: application.get(c.id) ?? 0,
    negotiationCount: negotiation.get(c.id) ?? 0,
  }));
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

const caseSelectPlain = `*`;

async function fetchCases(
  build: (
    select: string,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<CaseWithMaker[]> {
  const withJoin = await build(caseSelect);
  if (!withJoin.error) {
    return (withJoin.data ?? []) as CaseWithMaker[];
  }

  console.error("[fetchCases] join select failed, falling back", withJoin.error.message);
  const plain = await build(caseSelectPlain);
  if (plain.error) {
    console.error("[fetchCases] plain select failed", plain.error.message);
    return [];
  }
  return ((plain.data ?? []) as CaseRow[]).map((row) => ({
    ...row,
    profiles: null,
  }));
}

/**
 * /cases listing (no profiles.role check):
 * - Everyone: status=open AND review_status=approved
 * - Logged-in: also cases where maker_id = auth.uid() (any review_status, open only for marketplace)
 */
export async function listOpenCases(): Promise<Case[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const approvedRows = await fetchCases((select) =>
    supabase
      .from("cases")
      .select(select)
      .eq("status", "open")
      .eq("review_status", "approved")
      .order("created_at", { ascending: false }),
  );

  let ownRows: CaseWithMaker[] = [];
  if (user?.id) {
    // maker_id = auth.uid() only — never profiles.role
    ownRows = await fetchCases((select) =>
      supabase
        .from("cases")
        .select(select)
        .eq("maker_id", user.id)
        .eq("status", "open")
        .order("created_at", { ascending: false }),
    );
  }

  const byId = new Map<string, CaseWithMaker>();
  for (const row of approvedRows) byId.set(row.id, row);
  for (const row of ownRows) byId.set(row.id, row);

  const mapped = Array.from(byId.values())
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .map(mapCase);

  const withCounts = await attachNegotiationCounts(mapped);

  console.info("[listOpenCases]", {
    authUid: user?.id ?? null,
    approvedCount: approvedRows.length,
    ownOpenCount: ownRows.length,
    total: withCounts.length,
  });

  return withCounts;
}

/** All cases for maker_id = auth.uid() (any status / review_status). */
export async function listMyCases(): Promise<Case[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const rows = await fetchCases((select) =>
    supabase
      .from("cases")
      .select(select)
      .eq("maker_id", user.id)
      .order("created_at", { ascending: false }),
  );

  console.info("[listMyCases]", {
    authUid: user.id,
    count: rows.length,
  });

  return attachNegotiationCounts(rows.map(mapCase));
}

/** Debug helper: raw own cases for the logged-in auth user (no review filter). */
export async function diagnoseOwnCases(): Promise<{
  authUid: string | null;
  rows: Array<{
    id: string;
    product_name: string;
    maker_id: string;
    status: string;
    review_status: string;
    created_at: string;
  }>;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authUid: null, rows: [], error: "NO_AUTH_USER" };
  }

  const { data, error } = await supabase
    .from("cases")
    .select("id, product_name, maker_id, status, review_status, created_at")
    .eq("maker_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[diagnoseOwnCases]", error.message);
    return { authUid: user.id, rows: [], error: error.message };
  }

  return {
    authUid: user.id,
    rows: (data ?? []) as Array<{
      id: string;
      product_name: string;
      maker_id: string;
      status: string;
      review_status: string;
      created_at: string;
    }>,
    error: null,
  };
}

/** Maker's own open cases (includes pending_review for self-check). */
export async function listOpenCasesByMaker(
  makerId: string,
  limit = 5,
): Promise<Case[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select(caseSelect)
    .eq("status", "open")
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
): Promise<{ id: string; reviewStatus: ReviewStatus } | { error: string }> {
  try {
    const normalized = normalizeCaseCreateInput(input);
    const validationError = validateCaseCreateInput(normalized);
    if (validationError) {
      return { error: validationError };
    }

    const reviewStatus: ReviewStatus = betaAutoApproveCases()
      ? "approved"
      : "pending_review";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("[createCase] no auth user");
      return { error: "ログインセッションが無効です" };
    }
    if (user.id !== makerId) {
      console.error("[createCase] maker_id mismatch", {
        authUid: user.id,
        makerId,
      });
      return { error: "maker_id と auth.uid() が一致しません" };
    }

    console.info("[createCase] insert start", {
      table: "cases",
      makerId,
      authUid: user.id,
      product_name: normalized.productName,
      description_len: normalized.description.length,
      summary_len: normalized.summary.length,
      reviewStatus,
      status: "open",
    });

    const insertPayload = {
      maker_id: makerId,
      title: normalized.title.trim(),
      category: normalized.category.trim(),
      region: normalized.region.trim(),
      summary: normalized.summary.trim(),
      description: normalized.description.trim(),
      ideal_partner: normalized.idealPartner.trim(),
      offer: normalized.offer.trim(),
      product_name: normalized.productName.trim(),
      product_features: normalized.productFeatures.trim() || null,
      price_band: normalized.priceBand.trim() || null,
      sales_format: normalized.salesFormat,
      sales_terms: normalized.salesTerms.trim() || null,
      min_order: normalized.minOrder.trim() || null,
      is_exclusive: normalized.isExclusive,
      target_country: normalized.targetCountry,
      partner_channels: normalized.partnerChannels.trim() || null,
      partner_requirements: normalized.partnerRequirements.trim() || null,
      product_image_url: normalized.productImageUrl,
      status: "open" as const,
      review_status: reviewStatus,
    };

    let { data, error } = await supabase
      .from("cases")
      .insert(insertPayload)
      .select("id, product_name, maker_id, status, review_status, created_at")
      .single();

    // Retry without product_image_url if column missing on older DBs
    if (
      error &&
      /product_image_url/i.test(error.message + (error.details ?? ""))
    ) {
      console.warn("[createCase] retry without product_image_url");
      const { product_image_url: _omit, ...withoutImage } = insertPayload;
      const retry = await supabase
        .from("cases")
        .insert(withoutImage)
        .select("id, product_name, maker_id, status, review_status, created_at")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.error("[createCase] insert failed", {
        table: "cases",
        makerId,
        authUid: user.id,
        error: error?.message ?? "no data",
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      return {
        error: formatSupabaseError(
          "案件の登録に失敗しました",
          error ?? { message: "no data returned after insert" },
        ),
      };
    }

    console.info("[createCase] insert ok", {
      table: "cases",
      caseId: data.id,
      product_name: data.product_name,
      maker_id: data.maker_id,
      status: data.status,
      review_status: data.review_status,
      created_at: data.created_at,
      maker_matches_auth: data.maker_id === user.id,
    });

    return {
      id: data.id as string,
      reviewStatus: data.review_status as ReviewStatus,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[createCase] unexpected", message);
    return { error: `案件の登録に失敗しました: ${message}` };
  }
}

export async function updateCase(
  caseId: string,
  input: CaseCreateInput,
): Promise<{ error?: string }> {
  try {
    const normalized = normalizeCaseCreateInput(input);
    const validationError = validateCaseCreateInput(normalized);
    if (validationError) return { error: validationError };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "ログインが必要です" };

    const { data, error } = await supabase
      .from("cases")
      .update({
        title: normalized.title.trim(),
        category: normalized.category.trim(),
        region: normalized.region.trim(),
        summary: normalized.summary.trim(),
        description: normalized.description.trim(),
        ideal_partner: normalized.idealPartner.trim(),
        offer: normalized.offer.trim(),
        product_name: normalized.productName.trim(),
        product_features: normalized.productFeatures.trim() || null,
        price_band: normalized.priceBand.trim() || null,
        sales_format: normalized.salesFormat,
        sales_terms: normalized.salesTerms.trim() || null,
        min_order: normalized.minOrder.trim() || null,
        is_exclusive: normalized.isExclusive,
        target_country: normalized.targetCountry,
        partner_channels: normalized.partnerChannels.trim() || null,
        partner_requirements: normalized.partnerRequirements.trim() || null,
        product_image_url: normalized.productImageUrl,
      })
      .eq("id", caseId)
      .eq("maker_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[updateCase]", error.message);
      return { error: formatSupabaseError("案件の更新に失敗しました", error) };
    }
    if (!data) {
      return { error: "案件を更新できません（本人の案件のみ編集可）" };
    }
    return {};
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `案件の更新に失敗しました: ${message}` };
  }
}

/** Withdraw: status=closed, review_status=withdrawn. Requires maker_id = auth.uid(). */
export async function withdrawCase(
  caseId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const { data, error } = await supabase
    .from("cases")
    .update({
      status: "closed",
      review_status: "withdrawn",
    })
    .eq("id", caseId)
    .eq("maker_id", user.id)
    .select("id, status, review_status")
    .maybeSingle();

  if (error) {
    console.error("[withdrawCase]", error.message);
    return { error: error.message };
  }
  if (!data) {
    return { error: "案件を取り下げできません（本人の案件のみ）" };
  }

  console.info("[withdrawCase] ok", {
    caseId: data.id,
    status: data.status,
    review_status: data.review_status,
    authUid: user.id,
  });
  return {};
}
