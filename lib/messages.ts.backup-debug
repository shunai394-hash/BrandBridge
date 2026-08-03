import { createClient } from "@/lib/supabase/server";
import type { MessageView } from "@/lib/types";
import { NEGOTIATION_ATTACHMENTS_BUCKET } from "@/lib/negotiation-attachments";

type MessageRow = {
  id: string;
  negotiation_id: string;
  sender_id: string;
  body: string;
  topic: string | null;
  created_at: string;
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_mime: string | null;
  attachment_size: number | null;
  profiles: { contact_name: string; company_name: string } | null;
};

export async function listMessages(
  negotiationId: string,
  currentUserId: string,
): Promise<MessageView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      negotiation_id,
      sender_id,
      body,
      topic,
      created_at,
      attachment_path,
      attachment_name,
      attachment_mime,
      attachment_size,
      profiles!sender_id ( contact_name, company_name )
    `,
    )
    .eq("negotiation_id", negotiationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[listMessages]", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as MessageRow[];
  const views: MessageView[] = [];

  for (const row of rows) {
    const raw = row.profiles as
      | { contact_name: string; company_name: string }
      | { contact_name: string; company_name: string }[]
      | null;
    const profile = Array.isArray(raw) ? raw[0] : raw;

    let attachmentUrl: string | null = null;
    if (row.attachment_path) {
      const { data: signed, error: signError } = await supabase.storage
        .from(NEGOTIATION_ATTACHMENTS_BUCKET)
        .createSignedUrl(row.attachment_path, 60 * 60);

      if (signError) {
        console.error("[listMessages] signedUrl", signError.message);
      } else {
        attachmentUrl = signed?.signedUrl ?? null;
      }
    }

    views.push({
      id: row.id,
      negotiationId: row.negotiation_id,
      senderId: row.sender_id,
      senderName: profile?.company_name || profile?.contact_name || "ユーザー",
      body: row.body ?? "",
      topic: row.topic,
      createdAt: row.created_at,
      isMine: row.sender_id === currentUserId,
      attachment: row.attachment_path
        ? {
            path: row.attachment_path,
            name: row.attachment_name || "添付ファイル",
            mime: row.attachment_mime,
            size: row.attachment_size,
            url: attachmentUrl,
          }
        : null,
    });
  }

  return views;
}

export async function sendMessage(input: {
  negotiationId: string;
  senderId: string;
  body: string;
  topic?: string | null;
  attachment?: {
    path: string;
    name: string;
    mime: string;
    size: number;
  } | null;
}): Promise<{ id: string } | { error: string }> {
  const trimmed = input.body.trim();
  const hasAttachment = Boolean(input.attachment?.path);

  if (!trimmed && !hasAttachment) {
    return { error: "メッセージまたは添付ファイルを指定してください" };
  }

  if (input.attachment?.path) {
    const prefix = `${input.negotiationId}/${input.senderId}/`;
    if (!input.attachment.path.startsWith(prefix)) {
      return { error: "添付ファイルのパスが不正です" };
    }
  }

  const supabase = await createClient();

  let topic = input.topic?.trim() || null;
  if (!topic) {
    const { data: nego } = await supabase
      .from("negotiations")
      .select("topic")
      .eq("id", input.negotiationId)
      .maybeSingle();
    topic = (nego?.topic as string | null | undefined)?.trim() || null;
  }
  if (!topic) {
    const { data: first } = await supabase
      .from("messages")
      .select("topic")
      .eq("negotiation_id", input.negotiationId)
      .not("topic", "is", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    topic = (first?.topic as string | null | undefined)?.trim() || null;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      negotiation_id: input.negotiationId,
      sender_id: input.senderId,
      body: trimmed || (hasAttachment ? "ファイルを添付しました" : ""),
      topic,
      attachment_path: input.attachment?.path ?? null,
      attachment_name: input.attachment?.name ?? null,
      attachment_mime: input.attachment?.mime ?? null,
      attachment_size: input.attachment?.size ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "メッセージの送信に失敗しました" };
  }

  return { id: data.id as string };
}
