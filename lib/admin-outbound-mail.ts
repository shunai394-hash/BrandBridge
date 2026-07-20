import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  getReplyToEmail,
  requireSalesMailEnv,
  sendOutboundSalesEmail,
} from "@/lib/outbound-mail";

export type OutboundDisplayStatus = "sent" | "failed" | "replied";
export type ReadStatus = "unread" | "read";
export type SenderType = "admin" | "prospect";

export type OutboundEmail = {
  id: string;
  toEmail: string;
  fromEmail: string;
  replyToEmail: string | null;
  subject: string;
  body: string;
  status: OutboundDisplayStatus;
  createdAt: string;
  repliedAt: string | null;
  threadId: string | null;
  unreadInboundCount: number;
};

export type InboundEmail = {
  id: string;
  outboundEmailId: string | null;
  fromEmail: string;
  subject: string;
  body: string;
  receivedAt: string;
  readStatus: ReadStatus;
};

export type EmailThreadSummary = {
  id: string;
  outboundEmailId: string;
  createdAt: string;
  subject: string;
  toEmail: string;
  status: OutboundDisplayStatus;
  lastMessageAt: string;
  lastPreview: string;
  unreadCount: number;
  messageCount: number;
};

export type EmailThreadMessage = {
  id: string;
  threadId: string;
  senderType: SenderType;
  message: string;
  createdAt: string;
  inboundEmailId: string | null;
};

type OutboundRow = {
  id: string;
  to_email: string;
  from_email: string;
  reply_to_email: string | null;
  subject: string;
  body: string;
  status: string;
  created_at: string;
  replied_at: string | null;
};

type InboundRow = {
  id: string;
  outbound_email_id: string | null;
  from_email: string;
  subject: string;
  body: string;
  received_at: string;
  read_status: string;
};

type MessageRow = {
  id: string;
  thread_id: string;
  sender_type: SenderType;
  message: string;
  created_at: string;
  inbound_email_id: string | null;
};

function mapStatus(status: string): OutboundDisplayStatus {
  if (status === "failed") return "failed";
  if (status === "replied") return "replied";
  return "sent";
}

function mapOutbound(
  row: OutboundRow,
  threadId: string | null,
  unreadInboundCount: number,
): OutboundEmail {
  return {
    id: row.id,
    toEmail: row.to_email,
    fromEmail: row.from_email,
    replyToEmail: row.reply_to_email,
    subject: row.subject,
    body: row.body,
    status: mapStatus(row.status),
    createdAt: row.created_at,
    repliedAt: row.replied_at,
    threadId,
    unreadInboundCount,
  };
}

function mapInbound(row: InboundRow): InboundEmail {
  return {
    id: row.id,
    outboundEmailId: row.outbound_email_id,
    fromEmail: row.from_email,
    subject: row.subject,
    body: row.body,
    receivedAt: row.received_at,
    readStatus: row.read_status === "read" ? "read" : "unread",
  };
}

function mapMessage(row: MessageRow): EmailThreadMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderType: row.sender_type,
    message: row.message,
    createdAt: row.created_at,
    inboundEmailId: row.inbound_email_id,
  };
}

export function normalizeSubjectForMatch(subject: string): string {
  return subject
    .replace(/^\s*((re|fw|fwd)\s*:\s*)+/gi, "")
    .trim()
    .toLowerCase();
}

async function markOutboundReplied(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any },
  outboundEmailId: string,
  repliedAt?: string,
) {
  const at = repliedAt ?? new Date().toISOString();
  const { error } = await supabase
    .from("outbound_emails")
    .update({ status: "replied", replied_at: at })
    .eq("id", outboundEmailId)
    .neq("status", "failed");

  if (error) {
    console.error("[markOutboundReplied]", error.message);
  }
}

async function ensureThread(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any },
  outboundEmailId: string,
  createdAt?: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("email_threads")
    .select("id")
    .eq("outbound_email_id", outboundEmailId)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase
    .from("email_threads")
    .insert({
      outbound_email_id: outboundEmailId,
      ...(createdAt ? { created_at: createdAt } : {}),
    })
    .select("id")
    .single();

  if (error || !created) {
    console.error("[ensureThread]", error?.message);
    return null;
  }
  return created.id as string;
}

export async function listInboundEmails(): Promise<{
  items: InboundEmail[];
  unreadCount: number;
  error?: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inbound_emails")
    .select(
      "id, outbound_email_id, from_email, subject, body, received_at, read_status",
    )
    .order("received_at", { ascending: false });

  if (error) {
    console.error("[listInboundEmails]", error.message);
    return { items: [], unreadCount: 0, error: error.message };
  }

  const items = ((data ?? []) as InboundRow[]).map(mapInbound);
  return {
    items,
    unreadCount: items.filter((i) => i.readStatus === "unread").length,
  };
}

export async function getInboundEmailById(
  id: string,
): Promise<InboundEmail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inbound_emails")
    .select(
      "id, outbound_email_id, from_email, subject, body, received_at, read_status",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapInbound(data as InboundRow);
}

export async function markInboundRead(input: {
  inboundId?: string;
  outboundEmailId?: string | null;
  markAllForOutbound?: boolean;
}): Promise<{ error?: string }> {
  const supabase = await createClient();

  if (input.markAllForOutbound && input.outboundEmailId) {
    const { error } = await supabase
      .from("inbound_emails")
      .update({ read_status: "read" })
      .eq("outbound_email_id", input.outboundEmailId)
      .eq("read_status", "unread");
    if (error) {
      console.error("[markInboundRead] all", error.message);
      return { error: error.message };
    }
    return {};
  }

  if (!input.inboundId) return { error: "inboundId required" };

  const { error } = await supabase
    .from("inbound_emails")
    .update({ read_status: "read" })
    .eq("id", input.inboundId);

  if (error) {
    console.error("[markInboundRead]", error.message);
    return { error: error.message };
  }
  return {};
}

export async function listOutboundEmails(): Promise<{
  items: OutboundEmail[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outbound_emails")
    .select(
      "id, to_email, from_email, reply_to_email, subject, body, status, created_at, replied_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listOutboundEmails]", error.message);
    return { items: [], error: error.message };
  }

  const rows = (data ?? []) as OutboundRow[];
  if (rows.length === 0) return { items: [] };

  const ids = rows.map((r) => r.id);
  const [{ data: threads }, { data: inbounds }] = await Promise.all([
    supabase
      .from("email_threads")
      .select("id, outbound_email_id")
      .in("outbound_email_id", ids),
    supabase
      .from("inbound_emails")
      .select("outbound_email_id, read_status")
      .in("outbound_email_id", ids),
  ]);

  const threadByOutbound = new Map<string, string>();
  for (const t of threads ?? []) {
    threadByOutbound.set(t.outbound_email_id as string, t.id as string);
  }

  const unreadByOutbound = new Map<string, number>();
  for (const i of inbounds ?? []) {
    if (i.read_status === "unread" && i.outbound_email_id) {
      const key = i.outbound_email_id as string;
      unreadByOutbound.set(key, (unreadByOutbound.get(key) ?? 0) + 1);
    }
  }

  return {
    items: rows.map((r) =>
      mapOutbound(
        r,
        threadByOutbound.get(r.id) ?? null,
        unreadByOutbound.get(r.id) ?? 0,
      ),
    ),
  };
}

export async function getOutboundEmailById(
  id: string,
): Promise<OutboundEmail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outbound_emails")
    .select(
      "id, to_email, from_email, reply_to_email, subject, body, status, created_at, replied_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const { data: thread } = await supabase
    .from("email_threads")
    .select("id")
    .eq("outbound_email_id", id)
    .maybeSingle();

  const { count } = await supabase
    .from("inbound_emails")
    .select("id", { count: "exact", head: true })
    .eq("outbound_email_id", id)
    .eq("read_status", "unread");

  return mapOutbound(
    data as OutboundRow,
    (thread?.id as string) ?? null,
    count ?? 0,
  );
}

export async function listEmailThreadSummaries(): Promise<{
  items: EmailThreadSummary[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: threads, error } = await supabase
    .from("email_threads")
    .select("id, outbound_email_id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listEmailThreadSummaries]", error.message);
    return { items: [], error: error.message };
  }

  const threadRows = threads ?? [];
  if (threadRows.length === 0) return { items: [] };

  const outboundIds = threadRows.map((t) => t.outbound_email_id as string);
  const threadIds = threadRows.map((t) => t.id as string);

  const [{ data: outbounds }, { data: messages }, { data: inbounds }] =
    await Promise.all([
      supabase
        .from("outbound_emails")
        .select("id, to_email, subject, status, created_at, body")
        .in("id", outboundIds),
      supabase
        .from("email_messages")
        .select("thread_id, message, created_at")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("inbound_emails")
        .select("outbound_email_id, read_status")
        .in("outbound_email_id", outboundIds),
    ]);

  const outboundMap = new Map(
    (outbounds ?? []).map((o) => [o.id as string, o]),
  );

  const lastByThread = new Map<
    string,
    { message: string; created_at: string; count: number }
  >();
  for (const m of messages ?? []) {
    const tid = m.thread_id as string;
    const prev = lastByThread.get(tid);
    if (!prev) {
      lastByThread.set(tid, {
        message: m.message as string,
        created_at: m.created_at as string,
        count: 1,
      });
    } else {
      prev.count += 1;
    }
  }

  const unreadByOutbound = new Map<string, number>();
  for (const i of inbounds ?? []) {
    if (i.read_status === "unread" && i.outbound_email_id) {
      const key = i.outbound_email_id as string;
      unreadByOutbound.set(key, (unreadByOutbound.get(key) ?? 0) + 1);
    }
  }

  const items: EmailThreadSummary[] = [];
  for (const t of threadRows) {
    const oid = t.outbound_email_id as string;
    const o = outboundMap.get(oid);
    if (!o) continue;
    const last = lastByThread.get(t.id as string);
    items.push({
      id: t.id as string,
      outboundEmailId: oid,
      createdAt: t.created_at as string,
      subject: o.subject as string,
      toEmail: o.to_email as string,
      status: mapStatus(o.status as string),
      lastMessageAt: last?.created_at ?? (t.created_at as string),
      lastPreview: (last?.message ?? (o.body as string)).slice(0, 120),
      unreadCount: unreadByOutbound.get(oid) ?? 0,
      messageCount: last?.count ?? 0,
    });
  }

  items.sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );

  return { items };
}

export async function listThreadMessages(
  outboundEmailId: string,
): Promise<EmailThreadMessage[]> {
  const supabase = await createClient();
  const { data: thread } = await supabase
    .from("email_threads")
    .select("id")
    .eq("outbound_email_id", outboundEmailId)
    .maybeSingle();

  if (!thread?.id) return [];

  const { data, error } = await supabase
    .from("email_messages")
    .select(
      "id, thread_id, sender_type, message, created_at, inbound_email_id",
    )
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[listThreadMessages]", error.message);
    return [];
  }

  return ((data ?? []) as MessageRow[]).map(mapMessage);
}

/** @deprecated alias for older callers */
export async function listEmailThreadMessages(
  outboundEmailId: string,
): Promise<
  Array<{
    id: string;
    outboundEmailId: string;
    sender: SenderType;
    message: string;
    createdAt: string;
  }>
> {
  const msgs = await listThreadMessages(outboundEmailId);
  return msgs.map((m) => ({
    id: m.id,
    outboundEmailId,
    sender: m.senderType,
    message: m.message,
    createdAt: m.createdAt,
  }));
}

export async function createAndSendOutboundEmail(input: {
  toEmail: string;
  subject: string;
  body: string;
}): Promise<{ id?: string; error?: string }> {
  const toEmail = input.toEmail.trim();
  const subject = input.subject.trim();
  const body = input.body.trim();

  if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
    return { error: "宛先メールアドレスを正しく入力してください" };
  }
  if (!subject || subject.length > 200) {
    return { error: "件名を正しく入力してください（200文字以内）" };
  }
  if (!body || body.length > 10000) {
    return { error: "本文を正しく入力してください" };
  }

  const env = requireSalesMailEnv();
  if (!env.ok) return { error: env.error };

  const mail = await sendOutboundSalesEmail({
    to: toEmail,
    subject,
    body,
  });

  const status = mail.ok ? "sent" : "failed";
  const fromEmail = mail.fromEmail ?? env.fromAddress;
  const replyTo = mail.replyToEmail ?? env.replyTo;
  const supabase = await createClient();

  const { data: saved, error: saveError } = await supabase
    .from("outbound_emails")
    .insert({
      to_email: toEmail,
      from_email: fromEmail,
      reply_to_email: replyTo,
      subject,
      body,
      status,
      resend_email_id: mail.resendEmailId ?? null,
    })
    .select("id, created_at")
    .single();

  if (saveError || !saved) {
    console.error("[createAndSendOutboundEmail] save", saveError?.message);
    if (mail.ok) {
      return {
        error: "メールは送信されましたが、履歴の保存に失敗しました。",
      };
    }
    return {
      error: `メール送信に失敗しました: ${mail.error ?? saveError?.message ?? "unknown"}`,
    };
  }

  const outboundId = saved.id as string;
  const threadId = await ensureThread(
    supabase,
    outboundId,
    saved.created_at as string,
  );

  if (mail.ok && threadId) {
    const { error: msgError } = await supabase.from("email_messages").insert({
      thread_id: threadId,
      sender_type: "admin",
      message: body,
    });
    if (msgError) {
      console.error("[createAndSendOutboundEmail] message", msgError.message);
    }
  } else if (!mail.ok) {
    return {
      id: outboundId,
      error: `メール送信に失敗しました: ${mail.error ?? "unknown"}`,
    };
  }

  return { id: outboundId };
}

export async function replyOnOutboundThread(input: {
  outboundEmailId: string;
  message: string;
}): Promise<{ error?: string }> {
  const message = input.message.trim();
  if (!message) return { error: "本文を入力してください" };
  if (message.length > 10000) return { error: "本文が長すぎます" };

  const outbound = await getOutboundEmailById(input.outboundEmailId);
  if (!outbound) return { error: "メール履歴が見つかりません" };

  const subject = outbound.subject.startsWith("Re:")
    ? outbound.subject
    : `Re: ${outbound.subject}`;

  const mail = await sendOutboundSalesEmail({
    to: outbound.toEmail,
    subject,
    body: message,
  });

  if (!mail.ok) {
    return {
      error: `メール送信に失敗しました: ${mail.error ?? "unknown"}`,
    };
  }

  const supabase = await createClient();
  const threadId =
    outbound.threadId ?? (await ensureThread(supabase, outbound.id));
  if (!threadId) {
    return {
      error: "メールは送信されましたが、スレッド保存に失敗しました。",
    };
  }

  const { error } = await supabase.from("email_messages").insert({
    thread_id: threadId,
    sender_type: "admin",
    message,
  });

  if (error) {
    console.error("[replyOnOutboundThread]", error.message);
    return {
      error: "メールは送信されましたが、スレッド保存に失敗しました。",
    };
  }

  return {};
}

/**
 * Record prospect reply into inbox + thread (manual or webhook).
 */
export async function ingestProspectReply(input: {
  outboundEmailId?: string;
  fromEmail: string;
  subject?: string;
  body: string;
  resendEmailId?: string;
  useServiceRole?: boolean;
  markRead?: boolean;
}): Promise<{
  matched: boolean;
  outboundEmailId?: string;
  inboundId?: string;
  error?: string;
}> {
  const fromEmail = input.fromEmail.trim().toLowerCase();
  const body = input.body.trim();
  const subject = (input.subject ?? "").trim();

  if (!fromEmail || !body) {
    return { matched: false, error: "from/body required" };
  }

  const supabase = input.useServiceRole
    ? createServiceClient()
    : await createClient();

  let outboundId = input.outboundEmailId ?? null;

  if (!outboundId) {
    const normalizedSubject = normalizeSubjectForMatch(subject);
    const { data, error } = await supabase
      .from("outbound_emails")
      .select("id, to_email, subject, status, created_at")
      .ilike("to_email", fromEmail)
      .in("status", ["sent", "replied"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[ingestProspectReply]", error.message);
      return { matched: false, error: error.message };
    }

    const candidates = (data ?? []) as {
      id: string;
      subject: string;
    }[];

    let match =
      candidates.find(
        (c) => normalizeSubjectForMatch(c.subject) === normalizedSubject,
      ) ?? null;
    if (!match && candidates.length > 0) match = candidates[0];
    outboundId = match?.id ?? null;
  }

  const receivedAt = new Date().toISOString();

  const { data: inbound, error: inboundError } = await supabase
    .from("inbound_emails")
    .insert({
      outbound_email_id: outboundId,
      from_email: fromEmail,
      subject: subject || (outboundId ? "" : "(no subject)"),
      body,
      received_at: receivedAt,
      read_status: input.markRead ? "read" : "unread",
      resend_email_id: input.resendEmailId ?? null,
    })
    .select("id")
    .single();

  if (inboundError || !inbound) {
    console.error("[ingestProspectReply] inbound", inboundError?.message);
    return { matched: false, error: inboundError?.message ?? "inbound save failed" };
  }

  if (outboundId) {
    const threadId = await ensureThread(supabase, outboundId);
    if (threadId) {
      const { error: msgError } = await supabase.from("email_messages").insert({
        thread_id: threadId,
        sender_type: "prospect",
        message: body,
        inbound_email_id: inbound.id,
        created_at: receivedAt,
      });
      if (msgError) {
        console.error("[ingestProspectReply] message", msgError.message);
      }
    }
    await markOutboundReplied(supabase, outboundId, receivedAt);

    if (!subject) {
      const outbound = await supabase
        .from("outbound_emails")
        .select("subject")
        .eq("id", outboundId)
        .maybeSingle();
      if (outbound.data?.subject) {
        await supabase
          .from("inbound_emails")
          .update({ subject: `Re: ${outbound.data.subject as string}` })
          .eq("id", inbound.id);
      }
    }
  }

  return {
    matched: Boolean(outboundId),
    outboundEmailId: outboundId ?? undefined,
    inboundId: inbound.id as string,
  };
}

export async function ingestInboundProspectReply(input: {
  fromEmail: string;
  subject: string;
  body: string;
  resendEmailId?: string;
}): Promise<{ matched: boolean; outboundEmailId?: string; error?: string }> {
  return ingestProspectReply({
    ...input,
    useServiceRole: true,
    markRead: false,
  });
}

export async function addProspectThreadMessage(input: {
  outboundEmailId: string;
  message: string;
  useServiceRole?: boolean;
}): Promise<{ error?: string }> {
  const outbound = await getOutboundEmailById(input.outboundEmailId);
  if (!outbound) return { error: "メール履歴が見つかりません" };

  const result = await ingestProspectReply({
    outboundEmailId: input.outboundEmailId,
    fromEmail: outbound.toEmail,
    subject: `Re: ${outbound.subject}`,
    body: input.message,
    useServiceRole: input.useServiceRole,
    markRead: true,
  });

  if (result.error) return { error: result.error };
  return {};
}

export function getSalesMailboxInfo(): {
  fromFormatted: string;
  replyTo: string | null;
  envOk: boolean;
  error?: string;
} {
  const env = requireSalesMailEnv();
  if (!env.ok) {
    return {
      fromFormatted: "（未設定）",
      replyTo: getReplyToEmail(),
      envOk: false,
      error: env.error,
    };
  }
  return {
    fromFormatted: `${env.fromName} <${env.fromAddress}>`,
    replyTo: env.replyTo,
    envOk: true,
  };
}
