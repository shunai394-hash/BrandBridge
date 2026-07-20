import { NextResponse } from "next/server";
import { ingestInboundProspectReply } from "@/lib/admin-outbound-mail";
import { createResendClient } from "@/lib/outbound-mail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ResendReceivedEvent = {
  type?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
  };
};

/**
 * Resend inbound webhook (email.received).
 * Dashboard → Webhooks → URL: https://<site>/api/resend/inbound
 * Event: email.received
 *
 * Requires receiving domain on Resend pointing at MAIL_FROM_ADDRESS / REPLY_TO_EMAIL.
 */
export async function POST(request: Request) {
  let event: ResendReceivedEvent;
  try {
    event = (await request.json()) as ResendReceivedEvent;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const emailId = event.data?.email_id;
  if (!emailId) {
    return NextResponse.json({ error: "missing_email_id" }, { status: 400 });
  }

  const resend = createResendClient();
  if (!resend) {
    console.error("[resend/inbound] RESEND_API_KEY missing");
    return NextResponse.json({ error: "resend_not_configured" }, { status: 500 });
  }

  const { data: email, error } = await resend.emails.receiving.get(emailId);
  if (error || !email) {
    console.error("[resend/inbound] receiving.get", error?.message);
    return NextResponse.json(
      { error: error?.message ?? "fetch_failed" },
      { status: 502 },
    );
  }

  const from =
    typeof email.from === "string"
      ? email.from
      : event.data?.from ?? "";
  const fromEmail = from.match(/<([^>]+)>/)?.[1] ?? from;
  const subject = email.subject ?? event.data?.subject ?? "";
  const body =
    (typeof email.text === "string" && email.text.trim()) ||
    (typeof email.html === "string"
      ? email.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      : "");

  if (!body) {
    console.info("[resend/inbound] empty body", { emailId, fromEmail });
    return NextResponse.json({ ok: true, empty: true });
  }

  const result = await ingestInboundProspectReply({
    fromEmail,
    subject,
    body,
    resendEmailId: emailId,
  });

  console.info("[resend/inbound] result", {
    matched: result.matched,
    outboundEmailId: result.outboundEmailId ?? null,
    error: result.error ?? null,
  });

  return NextResponse.json({
    ok: true,
    matched: result.matched,
    outboundEmailId: result.outboundEmailId ?? null,
  });
}
