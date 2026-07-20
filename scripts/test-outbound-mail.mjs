/**
 * Local smoke test for sales mail send + inbound ingest.
 * Usage: node scripts/test-outbound-mail.mjs [toEmail]
 */
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

function serviceRoleKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY.trim();
  }
  const p = resolve(process.cwd(), ".tmp/api-keys.json");
  if (!existsSync(p)) return null;
  const text = readFileSync(p, "utf8");
  const json = JSON.parse(text.replace(/^\uFEFF/, ""));
  const list = Array.isArray(json) ? json : json.keys || [];
  return (
    list.find((k) => k.name === "service_role" || k.id === "service_role")
      ?.api_key ?? null
  );
}

loadEnvLocal();

const fromName = process.env.MAIL_FROM_NAME?.trim();
const fromAddress = process.env.MAIL_FROM_ADDRESS?.trim();
const replyTo =
  process.env.REPLY_TO_EMAIL?.trim() || fromAddress || null;
const apiKey = process.env.RESEND_API_KEY?.trim();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = serviceRoleKey();
const to =
  process.argv[2] ||
  process.env.OUTBOUND_TEST_TO?.trim() ||
  replyTo;

const report = {
  env: {
    MAIL_FROM_NAME: Boolean(fromName),
    MAIL_FROM_ADDRESS: Boolean(fromAddress),
    REPLY_TO_EMAIL: Boolean(process.env.REPLY_TO_EMAIL?.trim()),
    RESEND_API_KEY: Boolean(apiKey),
    SUPABASE: Boolean(url && serviceKey),
  },
  send: null,
  ingest: null,
};

if (!fromName || !fromAddress || !replyTo || !apiKey || !url || !serviceKey) {
  console.log(JSON.stringify({ ok: false, report, error: "missing_env" }, null, 2));
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const resend = new Resend(apiKey);
const subject = `【BrandBridge試験】営業メール ${new Date().toISOString()}`;
const body =
  "BrandBridge 営業メール送信テストです。\nこのメールへの返信は受信連携の確認に使えます。";

const { data: sendData, error: sendError } = await resend.emails.send({
  from: `${fromName} <${fromAddress}>`,
  to: [to],
  replyTo,
  subject,
  text: body,
});

if (sendError) {
  report.send = { ok: false, error: sendError.message };
  console.log(JSON.stringify({ ok: false, report }, null, 2));
  process.exit(1);
}

const { data: outbound, error: outErr } = await supabase
  .from("outbound_emails")
  .insert({
    to_email: to,
    from_email: fromAddress,
    reply_to_email: replyTo,
    subject,
    body,
    status: "sent",
    resend_email_id: sendData?.id ?? null,
  })
  .select("id")
  .single();

if (outErr || !outbound) {
  report.send = { ok: false, error: outErr?.message ?? "save_failed", resendId: sendData?.id };
  console.log(JSON.stringify({ ok: false, report }, null, 2));
  process.exit(1);
}

const { data: thread, error: threadErr } = await supabase
  .from("email_threads")
  .insert({ outbound_email_id: outbound.id })
  .select("id")
  .single();

if (threadErr || !thread) {
  report.send = { ok: false, error: threadErr?.message ?? "thread_failed", outboundId: outbound.id };
  console.log(JSON.stringify({ ok: false, report }, null, 2));
  process.exit(1);
}

await supabase.from("email_messages").insert({
  thread_id: thread.id,
  sender_type: "admin",
  message: body,
});

report.send = { ok: true, outboundId: outbound.id, to, resendId: sendData?.id };

const replyBody = "送信テストへの返信（自動ingest確認）です。";
const { data: inbound, error: inErr } = await supabase
  .from("inbound_emails")
  .insert({
    outbound_email_id: outbound.id,
    from_email: to,
    subject: `Re: ${subject}`,
    body: replyBody,
    read_status: "unread",
  })
  .select("id")
  .single();

if (inErr || !inbound) {
  report.ingest = { ok: false, error: inErr?.message };
  console.log(JSON.stringify({ ok: false, report }, null, 2));
  process.exit(1);
}

await supabase.from("email_messages").insert({
  thread_id: thread.id,
  sender_type: "prospect",
  message: replyBody,
  inbound_email_id: inbound.id,
});

await supabase
  .from("outbound_emails")
  .update({ status: "replied", replied_at: new Date().toISOString() })
  .eq("id", outbound.id);

report.ingest = {
  ok: true,
  inboundId: inbound.id,
  threadId: thread.id,
  adminUrl: `/admin/mail/${outbound.id}`,
};

console.log(JSON.stringify({ ok: true, report }, null, 2));
