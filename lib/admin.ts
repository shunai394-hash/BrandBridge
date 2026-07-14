import { createClient } from "@/lib/supabase/server";
import { getDealStats } from "@/lib/deals";
import type {
  ApplicationStatus,
  PipelineStatus,
  Profile,
  ReviewStatus,
  SalesFormat,
  UserRole,
} from "@/lib/types";

export type AdminStats = {
  pendingReviews: number;
  totalUsers: number;
  totalNegotiations: number;
  approvedCases: number;
  dealCount: number;
  totalDealAmount: number;
  totalCommission: number;
};

export type AdminCaseListItem = {
  id: string;
  caseNumber: string;
  title: string;
  productName: string;
  productImageUrl: string | null;
  category: string;
  salesFormat: SalesFormat | null;
  targetCountry: string | null;
  makerName: string;
  makerId: string;
  reviewStatus: ReviewStatus;
  status: string;
  createdAt: string;
  reviewNote: string | null;
};

export type AdminUserListItem = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

export type AdminNegotiationListItem = {
  id: string;
  applicationStatus: ApplicationStatus;
  pipelineStatus: PipelineStatus | null;
  status: ApplicationStatus;
  createdAt: string;
  caseId: string;
  caseTitle: string;
  makerName: string;
  partnerName: string;
  hasDeal: boolean;
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [pending, users, negotiations, approved, dealStats] = await Promise.all([
    supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("review_status", "pending_review"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("negotiations").select("id", { count: "exact", head: true }),
    supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("review_status", "approved")
      .eq("status", "open"),
    getDealStats(),
  ]);

  return {
    pendingReviews: pending.count ?? 0,
    totalUsers: users.count ?? 0,
    totalNegotiations: negotiations.count ?? 0,
    approvedCases: approved.count ?? 0,
    dealCount: dealStats.dealCount,
    totalDealAmount: dealStats.totalDealAmount,
    totalCommission: dealStats.totalCommission,
  };
}

export async function listAdminCases(
  reviewStatus?: ReviewStatus | "all",
): Promise<{ items: AdminCaseListItem[]; error?: string; totalUnfiltered?: number }> {
  const supabase = await createClient();

  const { count: totalUnfiltered, error: countError } = await supabase
    .from("cases")
    .select("id", { count: "exact", head: true });

  if (countError) {
    console.error("[listAdminCases] count failed", countError.message);
    return {
      items: [],
      error: `RLS/取得エラー(count): ${countError.message}`,
      totalUnfiltered: 0,
    };
  }

  const selectWithJoin = `
      id,
      case_number,
      title,
      category,
      maker_id,
      review_status,
      status,
      created_at,
      review_note,
      product_name,
      product_image_url,
      sales_format,
      target_country,
      profiles!maker_id ( company_name )
    `;
  const selectPlain = `
      id,
      case_number,
      title,
      category,
      maker_id,
      review_status,
      status,
      created_at,
      review_note,
      product_name,
      product_image_url,
      sales_format,
      target_country
    `;

  let query = supabase
    .from("cases")
    .select(selectWithJoin)
    .order("created_at", { ascending: false });

  if (reviewStatus && reviewStatus !== "all") {
    query = query.eq("review_status", reviewStatus);
  }

  let data: Array<Record<string, unknown>> | null = null;
  let error: { message: string } | null = null;

  {
    const first = await query;
    data = (first.data as Array<Record<string, unknown>> | null) ?? null;
    error = first.error;
  }

  if (error) {
    console.error("[listAdminCases] join select failed", error.message);
    let plain = supabase
      .from("cases")
      .select(selectPlain)
      .order("created_at", { ascending: false });
    if (reviewStatus && reviewStatus !== "all") {
      plain = plain.eq("review_status", reviewStatus);
    }
    const retry = await plain;
    if (retry.error) {
      console.error("[listAdminCases] plain select failed", retry.error.message);
      return {
        items: [],
        error: `RLS/取得エラー: ${retry.error.message}`,
        totalUnfiltered: totalUnfiltered ?? 0,
      };
    }
    data = (retry.data as Array<Record<string, unknown>> | null) ?? null;
    error = null;
  }

  const items = (data ?? []).map((row) => {
    const rawProfiles = row.profiles;
    const profile = Array.isArray(rawProfiles) ? rawProfiles[0] : rawProfiles;
    const productName =
      (row.product_name as string | null)?.trim() ||
      (row.title as string | null)?.trim() ||
      "(無題)";
    return {
      id: row.id as string,
      caseNumber: (row.case_number as string | null) || "—",
      title: (row.title as string) || productName,
      productName,
      productImageUrl: (row.product_image_url as string | null) ?? null,
      category: row.category as string,
      salesFormat: (row.sales_format as SalesFormat | null) ?? null,
      targetCountry: (row.target_country as string | null) ?? null,
      makerId: row.maker_id as string,
      makerName:
        (profile as { company_name?: string } | null)?.company_name ?? "メーカー",
      reviewStatus: row.review_status as ReviewStatus,
      status: row.status as string,
      createdAt: row.created_at as string,
      reviewNote: (row.review_note as string | null) ?? null,
    };
  });

  console.info("[listAdminCases]", {
    filter: reviewStatus ?? "all",
    count: items.length,
    totalUnfiltered: totalUnfiltered ?? 0,
  });

  return { items, totalUnfiltered: totalUnfiltered ?? 0 };
}


export async function reviewCase(input: {
  caseId: string;
  adminId: string;
  reviewStatus: Extract<ReviewStatus, "approved" | "rejected">;
  reviewNote?: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();

  // Approve → public listing; reject → close case (not listed)
  const status = input.reviewStatus === "approved" ? "open" : "closed";

  const { data, error } = await supabase
    .from("cases")
    .update({
      review_status: input.reviewStatus,
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: input.adminId,
      review_note: input.reviewNote?.trim() || null,
    })
    .eq("id", input.caseId)
    .select("id, review_status, status")
    .maybeSingle();

  if (error) {
    console.error("[reviewCase] failed", error.message);
    return { error: error.message };
  }
  if (!data) {
    return { error: "案件の更新に失敗しました（権限またはIDを確認してください）" };
  }

  console.info("[reviewCase] ok", {
    caseId: data.id,
    reviewStatus: data.review_status,
    status: data.status,
    adminId: input.adminId,
  });

  return {};
}

export async function listAdminUsers(): Promise<AdminUserListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, company_name, contact_name, email, role, is_active, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listAdminUsers]", error.message);
    return [];
  }

  return ((data ?? []) as Profile[]).map((p) => ({
    id: p.id,
    companyName: p.company_name,
    contactName: p.contact_name,
    email: p.email,
    role: p.role,
    isActive: p.is_active !== false,
    createdAt: p.created_at,
  }));
}

export async function setUserActive(
  userId: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }
  return {};
}

export async function listAdminNegotiations(): Promise<
  AdminNegotiationListItem[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("negotiations")
    .select(
      `
      id,
      application_status,
      pipeline_status,
      created_at,
      case_id,
      partner_id,
      cases!case_id (
        title,
        maker_id,
        profiles!maker_id ( company_name )
      ),
      profiles!partner_id ( company_name )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listAdminNegotiations]", error.message);
    return [];
  }

  const ids = (data ?? []).map((r) => r.id as string);
  const { data: deals } = await supabase
    .from("deals")
    .select("negotiation_id")
    .in("negotiation_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const dealSet = new Set((deals ?? []).map((d) => d.negotiation_id as string));

  return (data ?? []).map((row) => {
    const caseRow = Array.isArray(row.cases) ? row.cases[0] : row.cases;
    const makerProfile = caseRow
      ? Array.isArray(caseRow.profiles)
        ? caseRow.profiles[0]
        : caseRow.profiles
      : null;
    const partnerProfile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;
    const applicationStatus = row.application_status as ApplicationStatus;

    return {
      id: row.id as string,
      applicationStatus,
      pipelineStatus: (row.pipeline_status as PipelineStatus | null) ?? null,
      status: applicationStatus,
      createdAt: row.created_at as string,
      caseId: row.case_id as string,
      caseTitle: (caseRow as { title?: string } | null)?.title ?? "案件",
      makerName:
        (makerProfile as { company_name?: string } | null)?.company_name ??
        "メーカー",
      partnerName:
        (partnerProfile as { company_name?: string } | null)?.company_name ??
        "パートナー",
      hasDeal: dealSet.has(row.id as string),
    };
  });
}
