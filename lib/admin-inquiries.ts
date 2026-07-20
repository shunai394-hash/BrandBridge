import { createClient } from "@/lib/supabase/server";
import type { ContactCategory } from "@/lib/contact-types";
import { contactCategoryOptions } from "@/lib/contact-types";
import { sendInquiryReplyEmail } from "@/lib/sendContactEmail";

export type InquiryReplyStatus = "unreplied" | "replied";

export type AdminInquiry = {
  id: string;
  companyName: string | null;
  contactName: string;
  email: string;
  category: ContactCategory;
  message: string;
  userId: string | null;
  createdAt: string;
  replyStatus: InquiryReplyStatus;
  adminReplyCount: number;
};

export type AdminInquiryMessage = {
  id: string;
  inquiryId: string;
  senderType: "admin" | "user";
  subject: string | null;
  message: string;
  createdAt: string;
};

type ContactInquiryRow = {
  id: string;
  name: string;
  email: string;
  company_name: string | null;
  category: string;
  message: string;
  user_id: string | null;
  created_at: string;
};

type MessageRow = {
  id: string;
  inquiry_id: string;
  sender_type: "admin" | "user";
  subject: string | null;
  message: string;
  created_at: string;
};

export function inquiryCategoryLabel(category: string): string {
  return (
    contactCategoryOptions.find((item) => item.value === category)?.label ??
    category
  );
}

export function inquiryReplyStatusLabel(status: InquiryReplyStatus): string {
  return status === "replied" ? "返信済み" : "未返信";
}

function mapRow(
  row: ContactInquiryRow,
  adminReplyCount: number,
): AdminInquiry {
  return {
    id: row.id,
    companyName: row.company_name,
    contactName: row.name,
    email: row.email,
    category: row.category as ContactCategory,
    message: row.message,
    userId: row.user_id,
    createdAt: row.created_at,
    adminReplyCount,
    replyStatus: adminReplyCount > 0 ? "replied" : "unreplied",
  };
}

function mapMessage(row: MessageRow): AdminInquiryMessage {
  return {
    id: row.id,
    inquiryId: row.inquiry_id,
    senderType: row.sender_type,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at,
  };
}

async function countAdminRepliesByInquiry(
  inquiryIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (inquiryIds.length === 0) return counts;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_inquiry_messages")
    .select("inquiry_id")
    .in("inquiry_id", inquiryIds)
    .eq("sender_type", "admin");

  if (error) {
    console.error("[countAdminRepliesByInquiry]", error.message);
    return counts;
  }

  for (const row of data ?? []) {
    const id = row.inquiry_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

export async function listAdminInquiries(): Promise<{
  items: AdminInquiry[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_inquiries")
    .select(
      "id, name, email, company_name, category, message, user_id, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listAdminInquiries]", error.message);
    return { items: [], error: error.message };
  }

  const rows = (data ?? []) as ContactInquiryRow[];
  const counts = await countAdminRepliesByInquiry(rows.map((r) => r.id));

  return {
    items: rows.map((row) => mapRow(row, counts.get(row.id) ?? 0)),
  };
}

export async function getAdminInquiryById(
  id: string,
): Promise<AdminInquiry | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_inquiries")
    .select(
      "id, name, email, company_name, category, message, user_id, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getAdminInquiryById]", error.message);
    return null;
  }
  if (!data) return null;

  const counts = await countAdminRepliesByInquiry([id]);
  return mapRow(data as ContactInquiryRow, counts.get(id) ?? 0);
}

export async function listInquiryMessages(
  inquiryId: string,
): Promise<AdminInquiryMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_inquiry_messages")
    .select("id, inquiry_id, sender_type, subject, message, created_at")
    .eq("inquiry_id", inquiryId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[listInquiryMessages]", error.message);
    return [];
  }

  return ((data ?? []) as MessageRow[]).map(mapMessage);
}

export async function replyToInquiry(input: {
  inquiryId: string;
  subject: string;
  body: string;
}): Promise<{ error?: string }> {
  const subject = input.subject.trim();
  const body = input.body.trim();

  if (!subject || subject.length > 200) {
    return { error: "件名を正しく入力してください（200文字以内）" };
  }
  if (!body || body.length < 1) {
    return { error: "本文を入力してください" };
  }
  if (body.length > 10000) {
    return { error: "本文が長すぎます" };
  }

  const inquiry = await getAdminInquiryById(input.inquiryId);
  if (!inquiry) {
    return { error: "お問い合わせが見つかりません" };
  }

  const mail = await sendInquiryReplyEmail({
    to: inquiry.email,
    subject,
    body,
    replyTo: inquiry.email,
  });

  if (!mail.ok) {
    return {
      error: `メール送信に失敗しました: ${mail.error ?? "unknown"}`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_inquiry_messages").insert({
    inquiry_id: input.inquiryId,
    sender_type: "admin",
    subject,
    message: body,
  });

  if (error) {
    console.error("[replyToInquiry] save failed after send", error.message);
    return {
      error:
        "メールは送信されましたが、履歴の保存に失敗しました。画面を更新して確認してください。",
    };
  }

  return {};
}
