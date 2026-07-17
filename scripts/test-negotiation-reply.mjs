/**
 * Browser E2E: negotiation reply button enabled + send succeeds (maker & partner).
 */
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import { readFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

function loadEnvLocal() {
  const raw = readFileSync(resolve(ROOT, ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

function getServiceRoleKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY.trim();
  }
  const local = resolve(ROOT, ".tmp/api-keys.json");
  let text = readFileSync(local, "utf8").replace(/^\uFEFF/, "");
  const arrStart = text.indexOf("[");
  const objStart = text.indexOf("{");
  const start =
    arrStart >= 0 && (objStart < 0 || arrStart < objStart) ? arrStart : objStart;
  if (start < 0) throw new Error("invalid .tmp/api-keys.json");
  const opener = text[start];
  const closer = opener === "[" ? "]" : "}";
  const end = text.lastIndexOf(closer);
  const json = JSON.parse(text.slice(start, end + 1));
  const list = Array.isArray(json) ? json : json.keys || [];
  const key = list.find(
    (k) => k.name === "service_role" || k.id === "service_role",
  )?.api_key;
  if (!key) throw new Error("service_role key not found");
  return key;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

/** Match @supabase/ssr cookie chunking (max ~3180). */
function chunkCookie(name, value) {
  const MAX = 3180;
  if (value.length <= MAX) return [{ name, value }];
  const chunks = [];
  let i = 0;
  let n = 0;
  while (i < value.length) {
    chunks.push({ name: `${name}.${n}`, value: value.slice(i, i + MAX) });
    i += MAX;
    n += 1;
  }
  return chunks;
}

async function setSessionCookies(context, url, anonKey, email, password) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  assert(!error && data.session, `signIn ${email}: ${error?.message}`);

  const projectRef = new URL(url).hostname.split(".")[0];
  const storageKey = `sb-${projectRef}-auth-token`;
  const encoded =
    "base64-" +
    Buffer.from(JSON.stringify(data.session), "utf8").toString("base64url");

  const host = new URL(BASE).hostname;
  const cookies = chunkCookie(storageKey, encoded).map((c) => ({
    name: c.name,
    value: c.value,
    domain: host,
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  }));
  await context.addCookies(cookies);
}

async function main() {
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  assert(url && anon, "Supabase env missing");
  const serviceKey = getServiceRoleKey();

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const stamp = Date.now();
  const password = `TestPass_${stamp}!aA1`;
  const makerEmail = `maker.reply.${stamp}@example.com`;
  const partnerEmail = `partner.reply.${stamp}@example.com`;

  console.log("[e2e] creating confirmed maker + partner…");
  const { data: makerAuth, error: makerErr } = await admin.auth.admin.createUser({
    email: makerEmail,
    password,
    email_confirm: true,
    user_metadata: {
      role: "maker",
      company_name: "E2E Maker Co",
      contact_name: "Maker Tester",
    },
  });
  assert(!makerErr && makerAuth.user, `maker create: ${makerErr?.message}`);

  const { data: partnerAuth, error: partnerErr } =
    await admin.auth.admin.createUser({
      email: partnerEmail,
      password,
      email_confirm: true,
      user_metadata: {
        role: "partner",
        company_name: "E2E Partner Co",
        contact_name: "Partner Tester",
      },
    });
  assert(
    !partnerErr && partnerAuth.user,
    `partner create: ${partnerErr?.message}`,
  );

  const makerId = makerAuth.user.id;
  const partnerId = partnerAuth.user.id;

  for (const [id, role, company, email] of [
    [makerId, "maker", "E2E Maker Co", makerEmail],
    [partnerId, "partner", "E2E Partner Co", partnerEmail],
  ]) {
    const { error } = await admin.from("profiles").upsert({
      id,
      role,
      company_name: company,
      contact_name: "Tester",
      email,
      onboarding_completed: true,
      is_active: true,
    });
    assert(!error, `profile upsert ${role}: ${error?.message}`);
  }

  const { data: caseRow, error: caseErr } = await admin
    .from("cases")
    .insert({
      maker_id: makerId,
      title: "E2E 交渉テスト案件",
      product_name: "E2E Product",
      category: "食品",
      region: "関東",
      summary: "summary",
      description: "desc",
      ideal_partner: "販売パートナー",
      offer: "卸条件応相談",
      sales_format: "wholesale",
      is_exclusive: false,
      target_country: "JP",
      status: "open",
      review_status: "approved",
    })
    .select("id")
    .single();
  assert(!caseErr && caseRow, `case insert: ${caseErr?.message}`);

  const { data: nego, error: negoErr } = await admin
    .from("negotiations")
    .insert({
      case_id: caseRow.id,
      partner_id: partnerId,
      topic: "E2E 件名テスト",
      message: "開始メッセージ",
      application_status: "accepted",
      pipeline_status: "in_negotiation",
    })
    .select("id")
    .single();
  assert(!negoErr && nego, `negotiation insert: ${negoErr?.message}`);

  const { error: msgErr } = await admin.from("messages").insert({
    negotiation_id: nego.id,
    sender_id: partnerId,
    topic: "E2E 件名テスト",
    body: "開始メッセージ",
  });
  assert(!msgErr, `opening message: ${msgErr?.message}`);

  const negotiationUrl = `${BASE}/negotiations/${nego.id}`;
  const replyBody = `ブラウザ送信テスト ${stamp}`;

  console.log("[e2e] launching browser…");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("pageerror", (err) => {
    console.log("[e2e] pageerror:", err.message);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("[e2e] console.error:", msg.text());
    }
  });

  async function sendReplyAs(email, role) {
    console.log(`[e2e] session as ${role}…`);
    await context.clearCookies();
    await setSessionCookies(context, url, anon, email, password);

    await page.goto(negotiationUrl, { waitUntil: "networkidle" });
    // Must not bounce to login
    assert(
      !page.url().includes("/login"),
      `${role}: redirected to login (session cookie failed)`,
    );

    const submit = page.getByTestId("negotiation-reply-submit");
    await submit.waitFor({ state: "visible", timeout: 20000 });
    await page.waitForTimeout(800);

    const btnType = await submit.getAttribute("type");
    const disabledBefore = await submit.isDisabled();
    console.log(
      `[e2e] ${role} button type=${btnType} disabled(empty)=${disabledBefore}`,
    );
    assert(btnType === "submit", `${role}: button type must be submit`);
    assert(
      disabledBefore === false,
      `${role}: submit must be enabled even with empty body`,
    );

    const bodySnippet = `${replyBody} (${role})`;
    await page.getByTestId("negotiation-reply-body").fill(bodySnippet);

    // Drive React 19 state the way users do: type via keyboard API
    await page.getByTestId("negotiation-reply-body").click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type(bodySnippet, { delay: 5 });

    const actionPromise = page.waitForRequest(
      (req) =>
        Boolean(req.headers()["next-action"]) ||
        (req.method() === "POST" && req.url().includes("/negotiations/")),
      { timeout: 25000 },
    );

    await page.getByTestId("negotiation-reply-form").evaluate((form) => {
      if (form instanceof HTMLFormElement) form.requestSubmit();
    });
    const actionReq = await actionPromise.catch(() => null);
    console.log(
      `[e2e] ${role} action:`,
      actionReq
        ? `${actionReq.method()} next-action=${Boolean(actionReq.headers()["next-action"])}`
        : "NO",
      "url=",
      page.url(),
    );

    const alertTextEarly = await page
      .locator('[role="alert"]')
      .first()
      .textContent()
      .catch(() => null);
    if (alertTextEarly) {
      console.log(`[e2e] ${role} alert early:`, alertTextEarly.trim());
    }

    assert(actionReq, `${role}: form submit/Server Action was not triggered`);
    await page.waitForTimeout(3500);

    const alertText = await page
      .locator('[role="alert"]')
      .first()
      .textContent()
      .catch(() => null);
    if (alertText) {
      console.log(`[e2e] ${role} alert:`, alertText.trim());
    }

    let visible = await page.getByText(bodySnippet).count();
    if (visible === 0) {
      await page.reload({ waitUntil: "networkidle" });
      visible = await page.getByText(bodySnippet).count();
    }

    const { count, error: countErr } = await admin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("negotiation_id", nego.id)
      .eq("body", bodySnippet);
    console.log(`[e2e] ${role} db count:`, count, countErr?.message ?? "");

    assert(
      visible > 0 || (count ?? 0) > 0,
      `${role}: send failed (ui=${visible}, db=${count}, alert=${alertText ?? "none"}, url=${page.url()})`,
    );
    console.log(`[e2e] ${role} send SUCCESS`);
  }

  try {
    await sendReplyAs(partnerEmail, "partner");
    await sendReplyAs(makerEmail, "maker");
    console.log("[e2e] ALL PASSED");
  } finally {
    await browser.close();
    await admin.from("messages").delete().eq("negotiation_id", nego.id);
    await admin.from("negotiations").delete().eq("id", nego.id);
    await admin.from("cases").delete().eq("id", caseRow.id);
    await admin.auth.admin.deleteUser(partnerId);
    await admin.auth.admin.deleteUser(makerId);
  }
}

main().catch((err) => {
  console.error("[e2e] FAIL:", err.message);
  process.exit(1);
});
