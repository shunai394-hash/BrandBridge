import { createClient } from "@/lib/supabase/server";
import type { MessageView } from "@/lib/types";

type MessageRow = {
  id: string;
  negotiation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
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
      created_at,
      profiles!sender_id ( contact_name, company_name )
    `,
    )
    .eq("negotiation_id", negotiationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[listMessages]", error.message);
    return [];
  }

  return ((data ?? []) as unknown as MessageRow[]).map((row) => {
    const raw = row.profiles as
      | { contact_name: string; company_name: string }
      | { contact_name: string; company_name: string }[]
      | null;
    const profile = Array.isArray(raw) ? raw[0] : raw;
    return {
      id: row.id,
      negotiationId: row.negotiation_id,
      senderId: row.sender_id,
      senderName: profile?.company_name || profile?.contact_name || "ユーザー",
      body: row.body,
      createdAt: row.created_at,
      isMine: row.sender_id === currentUserId,
    };
  });
}

export async function sendMessage(input: {
  negotiationId: string;
  senderId: string;
  body: string;
}): Promise<{ id: string } | { error: string }> {
  const trimmed = input.body.trim();
  if (!trimmed) {
    return { error: "メッセージを入力してください" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      negotiation_id: input.negotiationId,
      sender_id: input.senderId,
      body: trimmed,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "メッセージの送信に失敗しました" };
  }

  return { id: data.id as string };
}
