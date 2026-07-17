/**
 * Real-browser verification on localhost:3000 with screenshots.
 * Partner: send text + image. Maker: reply. Attachment link must open.
 */
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
const SHOT = resolve(ROOT, ".tmp/screenshots");

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
  const opener = text[start];
  const closer = opener === "[" ? "]" : "}";
  const end = text.lastIndexOf(closer);
  const json = JSON.parse(text.slice(start, end + 1));
  const list = Array.isArray(json) ? json : json.keys || [];
  const key = list.find(
    (k) => k.name === "service_role" || k.id === "service_role",
  )?.api_key;
  if (!key) throw new Error("service_role missing — write .tmp/api-keys.json");
  return key;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

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
  assert(!error && data.session, `signIn: ${error?.message}`);
  const projectRef = new URL(url).hostname.split(".")[0];
  const storageKey = `sb-${projectRef}-auth-token`;
  const encoded =
    "base64-" +
    Buffer.from(JSON.stringify(data.session), "utf8").toString("base64url");
  const host = new URL(BASE).hostname;
  await context.addCookies(
    chunkCookie(storageKey, encoded).map((c) => ({
      name: c.name,
      value: c.value,
      domain: host,
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    })),
  );
}

/** Minimal valid JPEG (~1KB) */
function writeSampleJpeg(path) {
  const jpeg = Buffer.from(
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEABj8Cf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hf//Z",
    "base64",
  );
  writeFileSync(path, jpeg);
}

async function main() {
  mkdirSync(SHOT, { recursive: true });
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  assert(url && anon, "env missing");

  // Health check real localhost
  const health = await fetch(BASE).then((r) => r.status).catch((e) => e.message);
  assert(health === 200, `localhost not ready: ${health}`);
  console.log("[ui] localhost:3000 OK");

  const admin = createClient(url, getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const stamp = Date.now();
  const password = `TestPass_${stamp}!aA1`;
  const makerEmail = `maker.ui.${stamp}@example.com`;
  const partnerEmail = `partner.ui.${stamp}@example.com`;

  const { data: makerAuth, error: mErr } = await admin.auth.admin.createUser({
    email: makerEmail,
    password,
    email_confirm: true,
    user_metadata: { role: "maker", company_name: "UI Maker", contact_name: "M" },
  });
  assert(!mErr && makerAuth.user, mErr?.message);
  const { data: partnerAuth, error: pErr } = await admin.auth.admin.createUser({
    email: partnerEmail,
    password,
    email_confirm: true,
    user_metadata: {
      role: "partner",
      company_name: "UI Partner",
      contact_name: "P",
    },
  });
  assert(!pErr && partnerAuth.user, pErr?.message);
  const makerId = makerAuth.user.id;
  const partnerId = partnerAuth.user.id;

  for (const [id, role, company, email] of [
    [makerId, "maker", "UI Maker", makerEmail],
    [partnerId, "partner", "UI Partner", partnerEmail],
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
    assert(!error, error?.message);
  }

  const { data: caseRow, error: cErr } = await admin
    .from("cases")
    .insert({
      maker_id: makerId,
      title: "UI検証案件",
      product_name: "UI Product",
      category: "食品",
      region: "関東",
      summary: "s",
      description: "d",
      ideal_partner: "p",
      offer: "o",
      sales_format: "wholesale",
      is_exclusive: false,
      target_country: "JP",
      status: "open",
      review_status: "approved",
    })
    .select("id")
    .single();
  assert(!cErr && caseRow, cErr?.message);

  const { data: nego, error: nErr } = await admin
    .from("negotiations")
    .insert({
      case_id: caseRow.id,
      partner_id: partnerId,
      topic: "UI検証スレッド",
      message: "開始",
      application_status: "accepted",
      pipeline_status: "in_negotiation",
    })
    .select("id")
    .single();
  assert(!nErr && nego, nErr?.message);

  await admin.from("messages").insert({
    negotiation_id: nego.id,
    sender_id: partnerId,
    topic: "UI検証スレッド",
    body: "開始メッセージ",
  });

  const jpegPath = resolve(SHOT, "image (9).jpg");
  writeSampleJpeg(jpegPath);
  const negoUrl = `${BASE}/negotiations/${nego.id}`;
  const partnerMsg = `パートナー送信 ${stamp}`;
  const makerMsg = `メーカー返信 ${stamp}`;

  // headed:false but real Chromium against localhost — screenshots prove UI
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    // --- Partner ---
    await setSessionCookies(context, url, anon, partnerEmail, password);
    await page.goto(negoUrl, { waitUntil: "networkidle" });
    assert(!page.url().includes("/login"), "partner session failed");

    const submit = page.getByTestId("negotiation-reply-submit");
    await submit.waitFor({ state: "visible" });
    const disabledEmpty = await submit.isDisabled();
    console.log("[ui] partner submit disabled (empty):", disabledEmpty);
    assert(disabledEmpty === false, "submit disabled when empty");
    await page.screenshot({
      path: resolve(SHOT, "01-partner-send-enabled.png"),
      fullPage: true,
    });

    await page.getByTestId("negotiation-reply-file").setInputFiles(jpegPath);
    await page.getByTestId("negotiation-reply-file-ready").waitFor();
    const readyText = await page.getByTestId("negotiation-reply-file-ready").innerText();
    assert(readyText.includes("添付済み"), "missing 添付済み");
    assert(readyText.includes("アップロード準備完了"), "missing 準備完了");
    assert(!readyText.includes("選択中"), "still shows 選択中");
    console.log("[ui] attachment preview OK");
    await page.screenshot({
      path: resolve(SHOT, "02-partner-attachment-ready.png"),
      fullPage: true,
    });

    await page.getByTestId("negotiation-reply-topic").fill(`件名 パートナー ${stamp}`);
    await page.getByTestId("negotiation-reply-body").fill(partnerMsg);
    const actionP = page.waitForRequest(
      (r) => Boolean(r.headers()["next-action"]),
      { timeout: 25000 },
    );
    await submit.click();
    assert(await actionP, "partner Server Action missing");
    await page.waitForTimeout(4000);
    await page.reload({ waitUntil: "networkidle" });

    assert(
      (await page.getByText(partnerMsg).count()) > 0,
      "partner message not in thread",
    );
    const att = page.getByTestId("message-attachment").last();
    await att.waitFor({ state: "visible" });
    const openLink = att.getByTestId("message-attachment-open");
    await openLink.waitFor({ state: "visible" });
    const href = await openLink.getAttribute("href");
    assert(href && href.includes("http"), `bad attachment href: ${href}`);
    // Fetch signed URL — must be reachable
    const attRes = await page.request.get(href);
    console.log("[ui] attachment HTTP status:", attRes.status());
    assert(attRes.ok(), "attachment URL not openable");
    await page.screenshot({
      path: resolve(SHOT, "03-partner-sent-with-attachment.png"),
      fullPage: true,
    });
    console.log("[ui] partner send + attachment OK");

    // --- Maker reply ---
    await context.clearCookies();
    await setSessionCookies(context, url, anon, makerEmail, password);
    await page.goto(negoUrl, { waitUntil: "networkidle" });
    assert(!page.url().includes("/login"), "maker session failed");

    const makerSubmit = page.getByTestId("negotiation-reply-submit");
    await makerSubmit.waitFor({ state: "visible" });
    assert((await makerSubmit.isDisabled()) === false, "maker submit disabled");
    const makerTopic = `件名 メーカー回答 ${stamp}`;
    await page.getByTestId("negotiation-reply-topic").fill(makerTopic);
    await page.getByTestId("negotiation-reply-body").fill(makerMsg);
    await page.getByTestId("negotiation-reply-file").setInputFiles(jpegPath);
    await page.getByTestId("negotiation-reply-file-ready").waitFor();
    const makerReady = await page.getByTestId("negotiation-reply-file-ready").innerText();
    assert(makerReady.includes("📎 添付済み"), "maker missing 📎 添付済み");
    assert(makerReady.includes("アップロード準備完了"), "maker missing 準備完了");
    const actionM = page.waitForRequest(
      (r) => Boolean(r.headers()["next-action"]),
      { timeout: 25000 },
    );
    await makerSubmit.click();
    assert(await actionM, "maker Server Action missing");
    await page.waitForTimeout(4000);
    await page.reload({ waitUntil: "networkidle" });
    assert(
      (await page.getByText(makerMsg).count()) > 0,
      "maker reply not in thread",
    );
    assert(
      (await page.getByText(makerTopic).count()) > 0,
      "maker topic not in maker thread",
    );
    await page.screenshot({
      path: resolve(SHOT, "04-maker-replied.png"),
      fullPage: true,
    });
    console.log("[ui] maker reply OK");

    // --- Partner sees maker topic/body/attachment ---
    await context.clearCookies();
    await setSessionCookies(context, url, anon, partnerEmail, password);
    await page.goto(negoUrl, { waitUntil: "networkidle" });
    assert(!page.url().includes("/login"), "partner re-login failed");
    assert(
      (await page.getByText(makerTopic).count()) > 0,
      "partner cannot see maker topic",
    );
    assert(
      (await page.getByText(makerMsg).count()) > 0,
      "partner cannot see maker body",
    );
    const partnerViewAtt = page.getByTestId("message-attachment").last();
    await partnerViewAtt.waitFor({ state: "visible" });
    assert(
      (await partnerViewAtt.innerText()).includes("image (9).jpg") ||
        (await partnerViewAtt.innerText()).includes("添付"),
      "partner cannot see maker attachment",
    );
    await page.screenshot({
      path: resolve(SHOT, "05-partner-sees-maker-reply.png"),
      fullPage: true,
    });
    console.log("[ui] partner sees maker topic/body/attachment OK");
    console.log("[ui] ALL PASSED — screenshots in .tmp/screenshots/");
  } finally {
    await browser.close();
    await admin.from("messages").delete().eq("negotiation_id", nego.id);
    await admin.from("negotiations").delete().eq("id", nego.id);
    await admin.from("cases").delete().eq("id", caseRow.id);
    await admin.auth.admin.deleteUser(partnerId);
    await admin.auth.admin.deleteUser(makerId);
  }
}

main().catch((e) => {
  console.error("[ui] FAIL:", e.message);
  process.exit(1);
});
