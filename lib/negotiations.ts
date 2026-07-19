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
  topic: string | null;
  application_status: ApplicationStatus;
  pipeline_status: PipelineStatus | null;
  created_at: string;
  updated_at: string;
  cases:
    | {
        id: string;
        case_number: string | null;
        title: string;
        product_name: string | null;
        category: string;
        region: string;
        maker_id: string;
        profiles: { company_name: string } | { company_name: string }[] | null;
      }
    | {
        id: string;
        case_number: string | null;
        title: string;
        product_name: string | null;
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
  const makerCompanyName = makerProfile?.company_name ?? "商品提供企業";
  const partnerCompanyName = partnerProfile?.company_name ?? "パートナー";

  let counterpartName = makerCompanyName;
  if (viewerRole === "maker") {
    counterpartName = partnerCompanyName;
  } else if (viewerRole === "admin") {
    counterpartName = `${makerCompanyName} / ${partnerCompanyName}`;
  }

  const applicationStatus = row.application_status;
  const productName = caseRow?.product_name?.trim() || caseRow?.title || "商品";

  return {
    id: row.id,
    applicationStatus,
    pipelineStatus: row.pipeline_status,
    status: applicationStatus,
    topic: row.topic?.trim() || "（件名なし）",
    initialMessage: row.message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    caseId: caseRow?.id ?? row.case_id,
    caseNumber: caseRow?.case_number || "—",
    caseTitle: caseRow?.title ?? "案件",
    productName,
    productSku: null,
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
  topic,
  application_status,
  pipeline_status,
  created_at,
  updated_at,
  cases!case_id (
    id,
    case_number,
    title,
    product_name,
    category,
    region,
    maker_id,
    profiles!maker_id ( company_name )
  ),
  profiles!partner_id ( company_name )
`;

/** Attach maker-managed SKUs without requiring the column in the join select. */
async function attachProductSkus(
  items: NegotiationListItem[],
): Promise<NegotiationListItem[]> {
  if (items.length === 0) return items;

  const caseIds = [...new Set(items.map((item) => item.caseId).filter(Boolean))];
  if (caseIds.length === 0) return items;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select("id, sku")
    .in("id", caseIds);

  if (error) {
    // Migration 028 not applied yet, or RLS — leave productSku null
    if (!/sku/i.test(error.message)) {
      console.warn("[attachProductSkus]", error.message);
    }
    return items;
  }

  const skuByCaseId = new Map<string, string | null>();
  for (const row of data ?? []) {
    const id = row.id as string;
    const sku = typeof row.sku === "string" ? row.sku.trim() : "";
    skuByCaseId.set(id, sku || null);
  }

  return items.map((item) => ({
    ...item,
    productSku: skuByCaseId.get(item.caseId) ?? null,
  }));
}

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

type MessageMetaRow = {
  negotiation_id: string;
  sender_id: string;
  body: string;
  topic: string | null;
  created_at: string;
};

type ReadRow = {
  negotiation_id: string;
  last_read_at: string;
};

async function enrichInboxFields(
  items: NegotiationListItem[],
  userId: string,
  role: UserRole,
): Promise<NegotiationListItem[]> {
  if (items.length === 0) return items;

  const ids = items.map((i) => i.id);
  const supabase = await createClient();

  const [{ data: messages }, readsResult] = await Promise.all([
    supabase
      .from("messages")
      .select("negotiation_id, sender_id, body, topic, created_at")
      .in("negotiation_id", ids)
      .order("created_at", { ascending: false }),
    supabase
      .from("negotiation_reads")
      .select("negotiation_id, last_read_at")
      .eq("user_id", userId)
      .in("negotiation_id", ids),
  ]);

  if (readsResult.error) {
    console.warn(
      "[enrichInboxFields] negotiation_reads unavailable:",
      readsResult.error.message,
    );
  }

  const readMap = new Map(
    ((readsResult.data ?? []) as ReadRow[]).map((r) => [
      r.negotiation_id,
      r.last_read_at,
    ]),
  );

  const byNego = new Map<string, MessageMetaRow[]>();
  for (const row of (messages ?? []) as MessageMetaRow[]) {
    const list = byNego.get(row.negotiation_id) ?? [];
    list.push(row);
    byNego.set(row.negotiation_id, list);
  }

  return items.map((item) => {
    const msgs = byNego.get(item.id) ?? [];
    const last = msgs[0] ?? null;
    const oldestWithTopic = [...msgs]
      .reverse()
      .find((m) => m.topic?.trim());
    const topicFromMessages = oldestWithTopic?.topic?.trim() || null;
    const lastReadAt = readMap.get(item.id);
    const lastReadMs = lastReadAt ? new Date(lastReadAt).getTime() : 0;

    let unreadCount = 0;
    for (const m of msgs) {
      if (m.sender_id === userId) continue;
      if (new Date(m.created_at).getTime() > lastReadMs) {
        unreadCount += 1;
      }
    }

    // Maker: never-opened thread with messages → unread attention
    if (role === "maker" && !lastReadAt && msgs.length > 0) {
      unreadCount = Math.max(unreadCount, 1);
    }

    const preview =
      last?.body?.trim() ||
      item.initialMessage?.trim() ||
      null;

    return {
      ...item,
      topic:
        item.topic !== "（件名なし）"
          ? item.topic
          : topicFromMessages || "（件名なし）",
      unreadCount,
      messageCount: msgs.length,
      lastMessagePreview: preview
        ? preview.length > 80
          ? `${preview.slice(0, 77)}...`
          : preview
        : null,
      lastMessageAt: last?.created_at ?? item.updatedAt ?? item.createdAt,
    };
  });
}

/** True if partner already has at least one negotiation on this case */
export async function hasAppliedToCase(
  caseId: string,
  partnerId: string,
): Promise<boolean> {
  const threads = await listPartnerThreadsForCase(caseId, partnerId);
  return threads.length > 0;
}

/** Existing themes for the same case (partner) — allows starting another topic */
export async function listPartnerThreadsForCase(
  caseId: string,
  partnerId: string,
): Promise<{ id: string; topic: string; applicationStatus: ApplicationStatus }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("negotiations")
    .select("id, topic, application_status, created_at")
    .eq("case_id", caseId)
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listPartnerThreadsForCase]", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    topic: ((row.topic as string | null)?.trim() || "（件名なし）") as string,
    applicationStatus: row.application_status as ApplicationStatus,
  }));
}

/** Resolve thread topic for reply messages */
export async function getNegotiationTopic(
  negotiationId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data: nego } = await supabase
    .from("negotiations")
    .select("topic")
    .eq("id", negotiationId)
    .maybeSingle();

  const fromNego = (nego?.topic as string | null | undefined)?.trim();
  if (fromNego) return fromNego;

  const { data: msg } = await supabase
    .from("messages")
    .select("topic")
    .eq("negotiation_id", negotiationId)
    .not("topic", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (msg?.topic as string | null | undefined)?.trim() || null;
}

export async function listNegotiationsForUser(
  user: SessionUser,
): Promise<NegotiationListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("negotiations")
    .select(negotiationSelect)
    .order("updated_at", { ascending: false });

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

  const mapped = rows
    .map((row) => mapNegotiation(row, user.role, dealSet.has(row.id)))
    .filter((item) =>
      user.role === "maker" ? item.makerId === user.id : true,
    );

  const enriched = await enrichInboxFields(mapped, user.id, user.role);
  const withSku = await attachProductSkus(enriched);

  // Sort by latest activity, unread first
  return withSku.sort((a, b) => {
    const unreadDiff = (b.unreadCount ?? 0) - (a.unreadCount ?? 0);
    if (unreadDiff !== 0) return unreadDiff;
    const aTime = new Date(a.lastMessageAt ?? a.updatedAt).getTime();
    const bTime = new Date(b.lastMessageAt ?? b.updatedAt).getTime();
    return bTime - aTime;
  });
}

export async function countNegotiationsForUser(
  user: SessionUser,
): Promise<{ total: number; unread: number }> {
  const items = await listNegotiationsForUser(user);
  return {
    total: items.length,
    unread: items.reduce(
      (sum, i) => sum + ((i.unreadCount ?? 0) > 0 ? 1 : 0),
      0,
    ),
  };
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
    const [enriched] = await enrichInboxFields([item], user.id, user.role);
    const [withSku] = await attachProductSkus([enriched]);
    return withSku;
  }

  const isParty =
    user.role === "partner"
      ? item.partnerId === user.id
      : item.makerId === user.id;

  if (!isParty) return null;

  const [enriched] = await enrichInboxFields([item], user.id, user.role);
  const [withSku] = await attachProductSkus([enriched]);
  return withSku;
}

/** Mark negotiation thread as read for the current user */
export async function markNegotiationRead(
  negotiationId: string,
  userId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase.from("negotiation_reads").upsert(
    {
      negotiation_id: negotiationId,
      user_id: userId,
      last_read_at: now,
    },
    { onConflict: "negotiation_id,user_id" },
  );

  if (error) {
    console.error("[markNegotiationRead]", error.message);
    return { error: error.message };
  }

  return {};
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
