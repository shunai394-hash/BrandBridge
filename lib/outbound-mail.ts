import { Resend } from "resend";
import { getMailFrom } from "@/lib/mail-from";

function requireResendApiKey():
  | { ok: true; apiKey: string }
  | { ok: false; error: string } {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  console.info("[outbound-mail] RESEND_API_KEY diagnostics", {
    present: Boolean(apiKey),
    length: apiKey?.length ?? 0,
    looksLikeResendKey: Boolean(apiKey?.startsWith("re_")),
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
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
 * Send outbound sales email via Resend.
 * From is driven by MAIL_FROM_NAME / MAIL_FROM_ADDRESS (see lib/mail-from.ts).
 */
export async function sendOutboundSalesEmail(input: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ ok: boolean; error?: string; fromEmail?: string }> {
  const keyResult = requireResendApiKey();
  if (!keyResult.ok) {
    return { ok: false, error: keyResult.error };
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
    const { error } = await resend.emails.send({
      from: from.formatted,
      to: [to],
      replyTo: from.address,
      subject,
      text: body,
    });

    if (error) {
      console.error("[sendOutboundSalesEmail]", error.message);
      return { ok: false, error: error.message, fromEmail: from.address };
    }

    return { ok: true, fromEmail: from.address };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[sendOutboundSalesEmail]", message);
    return { ok: false, error: message, fromEmail: from.address };
  }
}
