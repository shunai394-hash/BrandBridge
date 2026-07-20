import { Resend } from "resend";
import type { ContactCategory } from "@/lib/contact-types";
import { contactCategoryOptions } from "@/lib/contact-types";

const FROM_ADDRESS = "BrandBridge <onboarding@resend.dev>";

/** Safe diagnostics only — never log the key value. */
function resendApiKeyDiagnostics() {
  const raw = process.env.RESEND_API_KEY;
  const trimmed = raw?.trim() ?? "";
  return {
    defined: typeof raw === "string",
    present: trimmed.length > 0,
    length: trimmed.length,
    looksLikeResendKey: trimmed.startsWith("re_"),
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  };
}

function requireResendApiKey(
  context: string,
): { ok: true; apiKey: string } | { ok: false; error: string } {
  const diagnostics = resendApiKeyDiagnostics();
  console.info(`[${context}] RESEND_API_KEY diagnostics`, diagnostics);

  if (!diagnostics.present) {
    console.error(
      `[${context}] RESEND_API_KEY is not set`,
      "(set in .env.local for local, or Vercel Project → Settings → Environment Variables for Production/Preview)",
    );
    return {
      ok: false,
      error:
        "RESEND_API_KEY is not set（.env.local または Vercel の Environment Variables に設定してください）",
    };
  }

  return { ok: true, apiKey: process.env.RESEND_API_KEY!.trim() };
}

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
  const keyResult = requireResendApiKey("sendContactEmail");
  if (!keyResult.ok) {
    return { ok: false, error: keyResult.error };
  }
  const { apiKey } = keyResult;
  const to = process.env.CONTACT_RECEIVE_EMAIL?.trim();

  if (!to) {
    console.error("[sendContactEmail] CONTACT_RECEIVE_EMAIL is not set", {
      present: false,
      nodeEnv: process.env.NODE_ENV ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
    });
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
  const keyResult = requireResendApiKey("sendInquiryReplyEmail");
  if (!keyResult.ok) {
    return { ok: false, error: keyResult.error };
  }
  const { apiKey } = keyResult;

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

export type CompanyOutreachEmailPayload = {
  to: string;
  subject: string;
  body: string;
};

/**
 * Admin outreach / partnership email to a company.
 * From: BrandBridge official Resend From address.
 * Reply-To: CONTACT_RECEIVE_EMAIL when set.
 */
export async function sendCompanyOutreachEmail(
  payload: CompanyOutreachEmailPayload,
): Promise<{ ok: boolean; error?: string }> {
  const keyResult = requireResendApiKey("sendCompanyOutreachEmail");
  if (!keyResult.ok) {
    return { ok: false, error: keyResult.error };
  }
  const { apiKey } = keyResult;

  const to = payload.to.trim();
  const subject = payload.subject.trim();
  const body = payload.body.trim();
  const replyTo = process.env.CONTACT_RECEIVE_EMAIL?.trim();

  if (!to || !subject || !body) {
    return { ok: false, error: "送信先・件名・本文は必須です" };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      ...(replyTo ? { replyTo } : {}),
      subject,
      text: body,
    });

    if (error) {
      console.error("[sendCompanyOutreachEmail]", error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[sendCompanyOutreachEmail]", message);
    return { ok: false, error: message };
  }
}
