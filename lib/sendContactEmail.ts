import { Resend } from "resend";
import type { ContactCategory } from "@/lib/contact-types";
import { contactCategoryOptions } from "@/lib/contact-types";

const FROM_ADDRESS = "BrandBridge <onboarding@resend.dev>";

export type ContactEmailPayload = {
  name: string;
  email: string;
  companyName: string | null;
  category: ContactCategory;
  message: string;
};

function categoryLabel(category: ContactCategory): string {
  return (
    contactCategoryOptions.find((item) => item.value === category)?.label ??
    category
  );
}

/**
 * Notify CONTACT_RECEIVE_EMAIL via Resend after contact_inquiries insert.
 * Missing env / send failure is logged; callers should not fail the user submit.
 */
export async function sendContactEmail(
  payload: ContactEmailPayload,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_RECEIVE_EMAIL?.trim();

  if (!apiKey) {
    console.error("[sendContactEmail] RESEND_API_KEY is not set");
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }
  if (!to) {
    console.error("[sendContactEmail] CONTACT_RECEIVE_EMAIL is not set");
    return { ok: false, error: "CONTACT_RECEIVE_EMAIL is not set" };
  }

  const company = payload.companyName?.trim() || "（未入力）";
  const category = categoryLabel(payload.category);

  const text = [
    "BrandBridge に新しいお問い合わせがありました。",
    "",
    `会社名: ${company}`,
    `担当者名: ${payload.name}`,
    `メールアドレス: ${payload.email}`,
    `カテゴリ: ${category}`,
    "",
    "お問い合わせ内容:",
    payload.message,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      replyTo: payload.email,
      subject: "【BrandBridge】新しいお問い合わせがあります",
      text,
    });

    if (error) {
      console.error("[sendContactEmail]", error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[sendContactEmail]", message);
    return { ok: false, error: message };
  }
}

export type InquiryReplyEmailPayload = {
  to: string;
  subject: string;
  body: string;
  /** Inquirer email (Reply-To per product spec) */
  replyTo: string;
};

/**
 * Send admin reply to the inquirer via Resend.
 * From: BrandBridge contact settings (onboarding@resend.dev in dev).
 * Reply-To: inquirer email (contact_inquiries.email).
 */
export async function sendInquiryReplyEmail(
  payload: InquiryReplyEmailPayload,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("[sendInquiryReplyEmail] RESEND_API_KEY is not set");
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }

  const to = payload.to.trim();
  const subject = payload.subject.trim();
  const body = payload.body.trim();
  const replyTo = payload.replyTo.trim() || to;

  if (!to || !subject || !body) {
    return { ok: false, error: "送信先・件名・本文は必須です" };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      replyTo,
      subject,
      text: body,
    });

    if (error) {
      console.error("[sendInquiryReplyEmail]", error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[sendInquiryReplyEmail]", message);
    return { ok: false, error: message };
  }
}
