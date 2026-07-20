import { Resend } from "resend";
import { getMailFrom } from "@/lib/mail-from";

function requireResendApiKey():
  | { ok: true; apiKey: string }
  | { ok: false; error: string } {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error:
        "RESEND_API_KEY is not set（.env.local または Vercel の Environment Variables に設定してください）",
    };
  }
  return { ok: true, apiKey };
}

/**
 * Reply-To for sales mail. Prefer REPLY_TO_EMAIL; fall back to MAIL_FROM_ADDRESS
 * so From and Reply-To share the same sales mailbox by design.
 */
export function getReplyToEmail(): string | null {
  const replyTo = process.env.REPLY_TO_EMAIL?.trim();
  if (replyTo) return replyTo;
  const from = process.env.MAIL_FROM_ADDRESS?.trim();
  return from || null;
}

export function requireSalesMailEnv():
  | { ok: true; fromName: string; fromAddress: string; replyTo: string }
  | { ok: false; error: string } {
  const fromName = process.env.MAIL_FROM_NAME?.trim();
  const fromAddress = process.env.MAIL_FROM_ADDRESS?.trim();
  const replyTo = getReplyToEmail();

  if (!fromName) {
    return { ok: false, error: "MAIL_FROM_NAME is not set" };
  }
  if (!fromAddress) {
    return { ok: false, error: "MAIL_FROM_ADDRESS is not set" };
  }
  if (!replyTo) {
    return {
      ok: false,
      error: "REPLY_TO_EMAIL（または MAIL_FROM_ADDRESS）is not set",
    };
  }
  return { ok: true, fromName, fromAddress, replyTo };
}

/**
 * Send outbound sales email via Resend.
 * From: MAIL_FROM_NAME / MAIL_FROM_ADDRESS
 * Reply-To: REPLY_TO_EMAIL (same sales mailbox by design)
 */
export async function sendOutboundSalesEmail(input: {
  to: string;
  subject: string;
  body: string;
}): Promise<{
  ok: boolean;
  error?: string;
  fromEmail?: string;
  replyToEmail?: string;
  resendEmailId?: string;
}> {
  const keyResult = requireResendApiKey();
  if (!keyResult.ok) {
    return { ok: false, error: keyResult.error };
  }

  const env = requireSalesMailEnv();
  if (!env.ok) {
    return { ok: false, error: env.error };
  }

  const to = input.to.trim();
  const subject = input.subject.trim();
  const body = input.body.trim();
  const from = getMailFrom();

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { ok: false, error: "宛先メールアドレスを正しく入力してください" };
  }
  if (!subject) {
    return { ok: false, error: "件名を入力してください" };
  }
  if (!body) {
    return { ok: false, error: "本文を入力してください" };
  }

  try {
    const resend = new Resend(keyResult.apiKey);
    const { data, error } = await resend.emails.send({
      from: `${env.fromName} <${env.fromAddress}>`,
      to: [to],
      replyTo: env.replyTo,
      subject,
      text: body,
    });

    if (error) {
      console.error("[sendOutboundSalesEmail]", error.message);
      return {
        ok: false,
        error: error.message,
        fromEmail: env.fromAddress,
        replyToEmail: env.replyTo,
      };
    }

    return {
      ok: true,
      fromEmail: env.fromAddress,
      replyToEmail: env.replyTo,
      resendEmailId: data?.id,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[sendOutboundSalesEmail]", message);
    return {
      ok: false,
      error: message,
      fromEmail: from.address,
      replyToEmail: env.replyTo,
    };
  }
}

export function createResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}
