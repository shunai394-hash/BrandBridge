import { createClient } from "@/lib/supabase/server";
import { getMailFrom } from "@/lib/mail-from";
import { sendOutboundSalesEmail } from "@/lib/outbound-mail";

export type OutboundEmail = {
  id: string;
  toEmail: string;
  fromEmail: string;
  subject: string;
  body: string;
  status: "sent" | "failed";
  createdAt: string;
  threadCount: number;
};

export type EmailThreadMessage = {
  id: string;
  outboundEmailId: string;
  sender: "admin" | "prospect";
  message: string;
  createdAt: string;
};

type OutboundRow = {
  id: string;
  to_email: string;
  from_email: string;
  subject: string;
  body: string;
  status: "sent" | "failed";
  created_at: string;
};

type ThreadRow = {
  id: string;
  outbound_email_id: string;
  sender: "admin" | "prospect";
  message: string;
  created_at: string;
};

function mapOutbound(row: OutboundRow, threadCount = 0): OutboundEmail {
  return {
    id: row.id,
    toEmail: row.to_email,
    fromEmail: row.from_email,
    subject: row.subject,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
    threadCount,
  };
}

function mapThread(row: ThreadRow): EmailThreadMessage {
  return {
    id: row.id,
    outboundEmailId: row.outbound_email_id,
    sender: row.sender,
    message: row.message,
    createdAt: row.created_at,
  };
}

export async function listOutboundEmails(): Promise<{
  items: OutboundEmail[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outbound_emails")
    .select("id, to_email, from_email, subject, body, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listOutboundEmails]", error.message);
    return { items: [], error: error.message };
  }

  const rows = (data ?? []) as OutboundRow[];
  const counts = new Map<string, number>();

  if (rows.length > 0) {
    const { data: threads, error: threadError } = await supabase
      .from("email_threads")
      .select("outbound_email_id")
      .in(
        "outbound_email_id",
        rows.map((r) => r.id),
      );

    if (threadError) {
      console.error("[listOutboundEmails] threads", threadError.message);
    } else {
      for (const t of threads ?? []) {
        const id = t.outbound_email_id as string;
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
  }

  return {
    items: rows.map((r) => mapOutbound(r, counts.get(r.id) ?? 0)),
  };
}

export async function getOutboundEmailById(
  id: string,
): Promise<OutboundEmail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outbound_emails")
    .select("id, to_email, from_email, subject, body, status, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getOutboundEmailById]", error.message);
    return null;
  }
  if (!data) return null;

  const { count } = await supabase
    .from("email_threads")
    .select("id", { count: "exact", head: true })
    .eq("outbound_email_id", id);

  return mapOutbound(data as OutboundRow, count ?? 0);
}

export async function listEmailThreadMessages(
  outboundEmailId: string,
): Promise<EmailThreadMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_threads")
    .select("id, outbound_email_id, sender, message, created_at")
    .eq("outbound_email_id", outboundEmailId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[listEmailThreadMessages]", error.message);
    return [];
  }

  return ((data ?? []) as ThreadRow[]).map(mapThread);
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

  const from = getMailFrom();
  const mail = await sendOutboundSalesEmail({
    to: toEmail,
    subject,
    body,
  });

  const status = mail.ok ? "sent" : "failed";
  const fromEmail = mail.fromEmail ?? from.address;
  const supabase = await createClient();

  const { data: saved, error: saveError } = await supabase
    .from("outbound_emails")
    .insert({
      to_email: toEmail,
      from_email: fromEmail,
      subject,
      body,
      status,
    })
    .select("id")
    .single();

  if (saveError || !saved) {
    console.error("[createAndSendOutboundEmail] save", saveError?.message);
    if (mail.ok) {
      return {
        error:
          "メールは送信されましたが、履歴の保存に失敗しました。",
      };
    }
    return {
      error: `メール送信に失敗しました: ${mail.error ?? saveError?.message ?? "unknown"}`,
    };
  }

  const outboundId = saved.id as string;

  if (mail.ok) {
    const { error: threadError } = await supabase.from("email_threads").insert({
      outbound_email_id: outboundId,
      sender: "admin",
      message: body,
    });
    if (threadError) {
      console.error(
        "[createAndSendOutboundEmail] thread",
        threadError.message,
      );
    }
  } else {
    return {
      id: outboundId,
      error: `メール送信に失敗しました: ${mail.error ?? "unknown"}`,
    };
  }

  return { id: outboundId };
}

/**
 * Log a prospect reply on the thread (manual capture until inbound webhook exists).
 */
export async function addProspectThreadMessage(input: {
  outboundEmailId: string;
  message: string;
}): Promise<{ error?: string }> {
  const message = input.message.trim();
  if (!message) return { error: "メッセージを入力してください" };
  if (message.length > 10000) return { error: "メッセージが長すぎます" };

  const outbound = await getOutboundEmailById(input.outboundEmailId);
  if (!outbound) return { error: "メール履歴が見つかりません" };

  const supabase = await createClient();
  const { error } = await supabase.from("email_threads").insert({
    outbound_email_id: input.outboundEmailId,
    sender: "prospect",
    message,
  });

  if (error) {
    console.error("[addProspectThreadMessage]", error.message);
    return { error: error.message };
  }
  return {};
}

/**
 * Send a follow-up admin reply on an existing outbound thread.
 */
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

  const supabase = await createClient();

  if (!mail.ok) {
    return {
      error: `メール送信に失敗しました: ${mail.error ?? "unknown"}`,
    };
  }

  const { error } = await supabase.from("email_threads").insert({
    outbound_email_id: input.outboundEmailId,
    sender: "admin",
    message,
  });

  if (error) {
    console.error("[replyOnOutboundThread]", error.message);
    return {
      error:
        "メールは送信されましたが、スレッド保存に失敗しました。",
    };
  }

  return {};
}
