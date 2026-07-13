import { createClient } from "@/lib/supabase/server";
import { getDealStats } from "@/lib/deals";
import type {
  ApplicationStatus,
  PipelineStatus,
  Profile,
  ReviewStatus,
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
  title: string;
  category: string;
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
): Promise<AdminCaseListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("cases")
    .select(
      `
      id,
      title,
      category,
      maker_id,
      review_status,
      status,
      created_at,
      review_note,
      profiles!maker_id ( company_name )
    `,
    )
    .order("created_at", { ascending: false });

  if (reviewStatus && reviewStatus !== "all") {
    query = query.eq("review_status", reviewStatus);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[listAdminCases]", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id as string,
      title: row.title as string,
      category: row.category as string,
      makerId: row.maker_id as string,
      makerName:
        (profile as { company_name?: string } | null)?.company_name ?? "メーカー",
      reviewStatus: row.review_status as ReviewStatus,
      status: row.status as string,
      createdAt: row.created_at as string,
      reviewNote: (row.review_note as string | null) ?? null,
    };
  });
}

export async function reviewCase(input: {
  caseId: string;
  adminId: string;
  reviewStatus: Extract<ReviewStatus, "approved" | "rejected">;
  reviewNote?: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cases")
    .update({
      review_status: input.reviewStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: input.adminId,
      review_note: input.reviewNote?.trim() || null,
    })
    .eq("id", input.caseId);

  if (error) {
    return { error: error.message };
  }
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
