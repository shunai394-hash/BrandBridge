import { createClient } from "@/lib/supabase/server";
import type {
  ApplicationStatus,
  NegotiationListItem,
  PipelineStatus,
  SessionUser,
  UserRole,
} from "@/lib/types";

type NegotiationQueryRow = {
  id: string;
  case_id: string;
  partner_id: string;
  message: string | null;
  application_status: ApplicationStatus;
  pipeline_status: PipelineStatus | null;
  created_at: string;
  updated_at: string;
  cases:
    | {
        id: string;
        title: string;
        category: string;
        region: string;
        maker_id: string;
        profiles: { company_name: string } | { company_name: string }[] | null;
      }
    | {
        id: string;
        title: string;
        category: string;
        region: string;
        maker_id: string;
        profiles: { company_name: string } | { company_name: string }[] | null;
      }[]
    | null;
  profiles: { company_name: string } | { company_name: string }[] | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapNegotiation(
  row: NegotiationQueryRow,
  viewerRole: UserRole,
  hasDeal = false,
): NegotiationListItem {
  const caseRow = one(row.cases);
  const partnerProfile = one(row.profiles);
  const makerProfile = one(caseRow?.profiles ?? null);
  const makerCompanyName = makerProfile?.company_name ?? "メーカー";
  const partnerCompanyName = partnerProfile?.company_name ?? "パートナー";

  let counterpartName = makerCompanyName;
  if (viewerRole === "maker") {
    counterpartName = partnerCompanyName;
  } else if (viewerRole === "admin") {
    counterpartName = `${makerCompanyName} / ${partnerCompanyName}`;
  }

  const applicationStatus = row.application_status;

  return {
    id: row.id,
    applicationStatus,
    pipelineStatus: row.pipeline_status,
    status: applicationStatus,
    initialMessage: row.message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    caseId: caseRow?.id ?? row.case_id,
    caseTitle: caseRow?.title ?? "案件",
    caseCategory: caseRow?.category ?? "",
    caseRegion: caseRow?.region ?? "",
    partnerId: row.partner_id,
    partnerCompanyName,
    makerId: caseRow?.maker_id ?? "",
    makerCompanyName,
    counterpartName,
    hasDeal,
  };
}

const negotiationSelect = `
  id,
  case_id,
  partner_id,
  message,
  application_status,
  pipeline_status,
  created_at,
  updated_at,
  cases!case_id (
    id,
    title,
    category,
    region,
    maker_id,
    profiles!maker_id ( company_name )
  ),
  profiles!partner_id ( company_name )
`;

async function dealIdsForNegotiations(
  negotiationIds: string[],
): Promise<Set<string>> {
  if (negotiationIds.length === 0) return new Set();
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select("negotiation_id")
    .in("negotiation_id", negotiationIds);
  return new Set((data ?? []).map((d) => d.negotiation_id as string));
}

export async function createNegotiation(input: {
  caseId: string;
  partnerId: string;
  message?: string;
}): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("negotiations")
    .insert({
      case_id: input.caseId,
      partner_id: input.partnerId,
      message: input.message?.trim() || null,
      application_status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      return { error: "この案件にはすでに交渉を申し込んでいます" };
    }
    return { error: error?.message ?? "交渉の申込に失敗しました" };
  }

  return { id: data.id as string };
}

export async function hasAppliedToCase(
  caseId: string,
  partnerId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("negotiations")
    .select("id")
    .eq("case_id", caseId)
    .eq("partner_id", partnerId)
    .maybeSingle();

  return Boolean(data);
}

export async function listNegotiationsForUser(
  user: SessionUser,
): Promise<NegotiationListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("negotiations")
    .select(negotiationSelect)
    .order("created_at", { ascending: false });

  if (user.role === "partner") {
    query = query.eq("partner_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[listNegotiationsForUser]", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as NegotiationQueryRow[];
  const dealSet = await dealIdsForNegotiations(rows.map((r) => r.id));

  return rows
    .map((row) => mapNegotiation(row, user.role, dealSet.has(row.id)))
    .filter((item) =>
      user.role === "maker" ? item.makerId === user.id : true,
    );
}

export async function getNegotiationById(
  id: string,
  user: SessionUser,
): Promise<NegotiationListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("negotiations")
    .select(negotiationSelect)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getNegotiationById]", error.message);
    return null;
  }

  const dealSet = await dealIdsForNegotiations([id]);
  const item = mapNegotiation(
    data as unknown as NegotiationQueryRow,
    user.role,
    dealSet.has(id),
  );

  if (user.role === "admin") {
    return item;
  }

  const isParty =
    user.role === "partner"
      ? item.partnerId === user.id
      : item.makerId === user.id;

  if (!isParty) return null;
  return item;
}

export async function updateNegotiationStatus(
  id: string,
  status: Extract<ApplicationStatus, "accepted" | "rejected">,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const payload: Record<string, unknown> = {
    application_status: status,
  };
  if (status === "accepted") {
    payload.pipeline_status = "in_negotiation";
  }
  if (status === "rejected") {
    payload.pipeline_status = null;
  }

  const { error } = await supabase
    .from("negotiations")
    .update(payload)
    .eq("id", id)
    .eq("application_status", "pending");

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function updatePipelineStatus(
  id: string,
  pipelineStatus: PipelineStatus,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("negotiations")
    .update({ pipeline_status: pipelineStatus })
    .eq("id", id)
    .eq("application_status", "accepted");

  if (error) {
    return { error: error.message };
  }

  return {};
}
