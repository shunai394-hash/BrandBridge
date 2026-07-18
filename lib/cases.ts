import {
  formatSupabaseError,
  normalizeCaseCreateInput,
  skuForDb,
  validateCaseCreateInput,
} from "@/lib/case-validation";
import { listCaseImages } from "@/lib/case-images";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
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
    sku: row.sku?.trim() || null,
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

/**
 * applicationCount / negotiationCount + hasDeal (成約済み).
 * Uses service_role: negotiations/deals RLS hides rows from anon.
 */
export async function attachNegotiationCounts(
  cases: Case[],
): Promise<Case[]> {
  if (cases.length === 0) return cases;

  const ids = cases.map((c) => c.id);
  let data: {
    case_id: string;
    application_status: string | null;
    pipeline_status: string | null;
  }[] | null = null;
  let dealRows: { case_id: string }[] | null = null;
  let error: { message: string } | null = null;

  try {
    const supabase = createServiceClient();
    const [negoResult, dealResult] = await Promise.all([
      supabase
        .from("negotiations")
        .select("case_id, application_status, pipeline_status")
        .in("case_id", ids),
      supabase.from("deals").select("case_id").in("case_id", ids),
    ]);
    data = negoResult.data;
    dealRows = dealResult.data;
    error = negoResult.error ?? dealResult.error;
  } catch (e) {
    error = {
      message: e instanceof Error ? e.message : String(e),
    };
  }

  if (error) {
    // Loud failure: zeros here used to be painted by CaseList props.
    // CaseList must ignore these and use /api/case-application-counts.
    console.error(
      "[attachNegotiationCounts] FAILED — props will be 0/false:",
      error.message,
    );
    return cases.map((c) => ({
      ...c,
      applicationCount: 0,
      negotiationCount: 0,
      hasDeal: false,
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

  const withDeal = new Set((dealRows ?? []).map((r) => r.case_id as string));

  return cases.map((c) => ({
    ...c,
    applicationCount: application.get(c.id) ?? 0,
    negotiationCount: negotiation.get(c.id) ?? 0,
    hasDeal: withDeal.has(c.id),
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
 * /cases listing — guest and logged-in share ONE path:
 *   approved+open → mapCase → attachNegotiationCounts (applicationCount + hasDeal)
 * No authenticated-only case query (that caused divergent props).
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

  const mapped = approvedRows.map(mapCase);
  const withCounts = await attachNegotiationCounts(mapped);

  console.info("[listOpenCases]", {
    authUid: user?.id ?? null,
    path: "approved+open → attachNegotiationCounts",
    total: withCounts.length,
    sample: withCounts
      .filter((c) =>
        ["ATL-0010", "HYC-0003", "AOB-0002"].includes(c.sku?.trim() || ""),
      )
      .map((c) => ({
        sku: c.sku,
        applicationCount: c.applicationCount,
        hasDeal: c.hasDeal,
      })),
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

  const mapped = mapCase(data as CaseWithMaker);
  const [withCounts] = await attachNegotiationCounts([mapped]);
  const images = await listCaseImages(id);

  // Prefer gallery; fall back to legacy product_image_url as single image
  if (images.length > 0) {
    return {
      ...withCounts,
      images,
      productImageUrl: images[0].imageUrl || withCounts.productImageUrl,
    };
  }

  if (withCounts.productImageUrl?.trim()) {
    return {
      ...withCounts,
      images: [
        {
          id: `legacy-${withCounts.id}`,
          caseId: withCounts.id,
          imageUrl: withCounts.productImageUrl,
          storagePath: null,
          sortOrder: 0,
          createdAt: withCounts.createdAt,
        },
      ],
    };
  }

  return { ...withCounts, images: [] };
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
      return { error: "maker_id 縺ｨ auth.uid() 縺御ｸ閾ｴ縺励∪縺帙ｓ" };
    }

    const imageUrl = normalized.productImageUrl?.trim() || null;

    console.info("[createCase] insert start", {
      table: "cases",
      makerId,
      authUid: user.id,
      product_name: normalized.productName,
      has_product_image_url: Boolean(imageUrl),
      product_image_url_len: imageUrl?.length ?? 0,
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
      sku: skuForDb(normalized.sku),
      product_features: normalized.productFeatures.trim() || null,
      price_band: normalized.priceBand.trim() || null,
      sales_format: normalized.salesFormat,
      sales_terms: normalized.salesTerms.trim() || null,
      min_order: normalized.minOrder.trim() || null,
      is_exclusive: normalized.isExclusive,
      target_country: normalized.targetCountry,
      partner_channels: normalized.partnerChannels.trim() || null,
      partner_requirements: normalized.partnerRequirements.trim() || null,
      product_image_url: imageUrl,
      status: "open" as const,
      review_status: reviewStatus,
    };

    let { data, error } = await supabase
      .from("cases")
      .insert(insertPayload)
      .select(
        "id, product_name, maker_id, status, review_status, created_at, product_image_url",
      )
      .single();

    const errText = `${error?.message ?? ""} ${error?.details ?? ""}`;
    // Retry without sku when migration 028 is not applied yet
    const missingSku =
      error && /Could not find the 'sku' column/i.test(errText);
    if (missingSku) {
      console.warn("[createCase] retry without sku (column missing)");
      const { sku: _omitSku, ...withoutSku } = insertPayload;
      const retrySku = await supabase
        .from("cases")
        .insert(withoutSku)
        .select(
          "id, product_name, maker_id, status, review_status, created_at, product_image_url",
        )
        .single();
      data = retrySku.data;
      error = retrySku.error;
    }

    // Only retry without the column when schema cache truly lacks it
    const missingColumn =
      error &&
      /Could not find the 'product_image_url' column/i.test(
        `${error.message} ${error.details ?? ""}`,
      );
    if (missingColumn) {
      console.warn("[createCase] retry without product_image_url (column missing)");
      const { product_image_url: _omit, sku: _omitSku2, ...withoutImage } =
        insertPayload;
      const retry = await supabase
        .from("cases")
        .insert(withoutImage)
        .select("id, product_name, maker_id, status, review_status, created_at")
        .single();
      data = retry.data
        ? { ...retry.data, product_image_url: null }
        : retry.data;
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
          "譯井ｻｶ縺ｮ逋ｻ骭ｲ縺ｫ螟ｱ謨励＠縺ｾ縺励◆",
          error ?? { message: "no data returned after insert" },
        ),
      };
    }

    // Always force-write Storage URL after insert (schema-cache / select quirks)
    let savedImageUrl =
      (data.product_image_url as string | null | undefined)?.trim() || null;

    if (imageUrl) {
      const { data: patched, error: patchError } = await supabase
        .from("cases")
        .update({ product_image_url: imageUrl })
        .eq("id", data.id)
        .eq("maker_id", user.id)
        .select("product_image_url")
        .maybeSingle();

      if (patchError) {
        console.error("[createCase] product_image_url patch failed", {
          caseId: data.id,
          error: patchError.message,
          code: patchError.code,
        });
        return {
          error: formatSupabaseError(
            "譯井ｻｶ縺ｯ菴懈・縺輔ｌ縺ｾ縺励◆縺悟膚蜩∫判蜒酋RL縺ｮ菫晏ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆",
            patchError,
          ),
        };
      }

      savedImageUrl =
        (patched?.product_image_url as string | null | undefined)?.trim() ||
        null;

      if (savedImageUrl !== imageUrl) {
        console.error("[createCase] product_image_url mismatch after patch", {
          caseId: data.id,
          expected: imageUrl,
          saved: savedImageUrl,
        });
        return {
          error: "画像URLが登録されませんでした。管理画面から画像を設定してください。",
        };
      }
    }

    console.info("[createCase] insert ok", {
      table: "cases",
      caseId: data.id,
      product_name: data.product_name,
      maker_id: data.maker_id,
      status: data.status,
      review_status: data.review_status,
      product_image_url: savedImageUrl,
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
    return { error: `譯井ｻｶ縺ｮ逋ｻ骭ｲ縺ｫ螟ｱ謨励＠縺ｾ縺励◆: ${message}` };
  }
}

/** Text/content fields only. product_image_url is managed by CaseImageUploader. */
function caseUpdatePayload(normalized: CaseCreateInput) {
  return {
    title: normalized.title.trim(),
    category: normalized.category.trim(),
    region: normalized.region.trim(),
    summary: normalized.summary.trim(),
    description: normalized.description.trim(),
    ideal_partner: normalized.idealPartner.trim(),
    offer: normalized.offer.trim(),
    product_name: normalized.productName.trim(),
    sku: skuForDb(normalized.sku),
    product_features: normalized.productFeatures.trim() || null,
    price_band: normalized.priceBand.trim() || null,
    sales_format: normalized.salesFormat,
    sales_terms: normalized.salesTerms.trim() || null,
    min_order: normalized.minOrder.trim() || null,
    is_exclusive: normalized.isExclusive,
    target_country: normalized.targetCountry,
    partner_channels: normalized.partnerChannels.trim() || null,
    partner_requirements: normalized.partnerRequirements.trim() || null,
  };
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

    const payload = caseUpdatePayload(normalized);
    let { data, error } = await supabase
      .from("cases")
      .update(payload)
      .eq("id", caseId)
      .eq("maker_id", user.id)
      .select("id, product_image_url")
      .maybeSingle();

    if (
      error &&
      /Could not find the 'sku' column/i.test(
        `${error.message} ${error.details ?? ""}`,
      )
    ) {
      console.warn("[updateCase] retry without sku (column missing)");
      const { sku: _omit, ...withoutSku } = payload;
      const retry = await supabase
        .from("cases")
        .update(withoutSku)
        .eq("id", caseId)
        .eq("maker_id", user.id)
        .select("id, product_image_url")
        .maybeSingle();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("[updateCase]", error.message);
      return { error: formatSupabaseError("譯井ｻｶ縺ｮ譖ｴ譁ｰ縺ｫ螟ｱ謨励＠縺ｾ縺励◆", error) };
    }
    if (!data) {
      return { error: "案件を更新できませんでした" };
    }

    console.info("[updateCase] ok", {
      caseId: data.id,
      product_image_url: data.product_image_url,
    });
    return {};
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `譯井ｻｶ縺ｮ譖ｴ譁ｰ縺ｫ螟ｱ謨励＠縺ｾ縺励◆: ${message}` };
  }
}

/** Admin update: no maker_id filter (RLS allows is_admin()). */
export async function adminUpdateCase(
  caseId: string,
  input: CaseCreateInput,
): Promise<{ error?: string }> {
  try {
    const normalized = normalizeCaseCreateInput(input);
    const validationError = validateCaseCreateInput(normalized);
    if (validationError) return { error: validationError };

    const supabase = await createClient();
    const payload = caseUpdatePayload(normalized);

    let { data, error } = await supabase
      .from("cases")
      .update(payload)
      .eq("id", caseId)
      .select("id, product_name, product_image_url")
      .maybeSingle();

    if (
      error &&
      /Could not find the 'sku' column/i.test(
        `${error.message} ${error.details ?? ""}`,
      )
    ) {
      console.warn("[adminUpdateCase] retry without sku (column missing)");
      const { sku: _omit, ...withoutSku } = payload;
      const retry = await supabase
        .from("cases")
        .update(withoutSku)
        .eq("id", caseId)
        .select("id, product_name, product_image_url")
        .maybeSingle();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("[adminUpdateCase]", error.message);
      return { error: formatSupabaseError("譯井ｻｶ縺ｮ譖ｴ譁ｰ縺ｫ螟ｱ謨励＠縺ｾ縺励◆", error) };
    }
    if (!data) {
      return { error: "案件を更新できませんでした。権限またはIDを確認してください" };
    }

    console.info("[adminUpdateCase] ok", {
      caseId: data.id,
      product_name: data.product_name,
      product_image_url: data.product_image_url,
    });
    return {};
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `譯井ｻｶ縺ｮ譖ｴ譁ｰ縺ｫ螟ｱ謨励＠縺ｾ縺励◆: ${message}` };
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
    return { error: "案件を取り下げできませんでした" };
  }

  console.info("[withdrawCase] ok", {
    caseId: data.id,
    status: data.status,
    review_status: data.review_status,
    authUid: user.id,
  });
  return {};
}














