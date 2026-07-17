/**
 * Scan admin-related URLs; report which ones contain old card labels in the DOM.
 * Uses x-bb-admin-ui-probe so layout auth does not redirect to login.
 */
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:3000";
const OLD = ["審査待ち案件", "公開中案件", "交渉数", "成約件数", "成約金額合計"];
const PATHS = [
  "/admin",
  "/admin/",
  "/admin?x=1",
  "/admin",
  "/admin/cases",
  "/admin/cases?status=pending_review",
  "/admin/cases?status=approved",
  "/admin/cases?status=all",
  "/admin/negotiations",
  "/admin/users",
  "/deals",
  "/cases",
];

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext();
await context.setExtraHTTPHeaders({ "x-bb-admin-ui-probe": "1" });
const page = await context.newPage();

const found = [];
for (const path of PATHS) {
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(500);
  const body = await page.locator("body").innerText();
  const hits = OLD.filter((s) => body.includes(s));
  if (hits.length) {
    found.push({ path, finalUrl: page.url(), hits });
    console.log("HIT", path, "->", page.url(), hits.join("|"));
  } else {
    console.log("ok ", path, "->", page.url());
  }
}

await browser.close();
if (!found.length) {
  console.log("NO_URL_WITH_OLD_CARD_LABELS_ON_LIVE_SERVER");
} else {
  console.log("FOUND_COUNT", found.length);
  console.log(JSON.stringify(found, null, 2));
}
