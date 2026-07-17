import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = "http://127.0.0.1:3000";
const OUT = resolve(import.meta.dirname, "../.tmp");
mkdirSync(OUT, { recursive: true });

const STRINGS = [
  "審査待ち案件",
  "公開中案件",
  "交渉数",
  "商品・ブランド名",
  "商品の特徴・差別化ポイント",
  "BB_ADMIN_OPS_V2",
  "審査待ち商品",
  "商品名",
  "案件を登録",
];

const PATHS = [
  "/",
  "/admin",
  "/admin",
  "/admin/cases",
  "/maker/cases/new",
  "/maker/setup",
  "/for-makers",
  "/login",
];

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext();
await context.setExtraHTTPHeaders({ "x-bb-admin-ui-probe": "1" });
const page = await context.newPage();
const report = [];

for (const path of PATHS) {
  const res = await page.goto(`${BASE}${path}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(800);
  const finalUrl = page.url();
  const title = await page.title();
  const body = await page.locator("body").innerText().catch(() => "");
  const hits = {};
  for (const s of STRINGS) hits[s] = body.includes(s);
  const h1 = await page
    .locator("h1")
    .allTextContents()
    .catch(() => []);
  report.push({
    requested: path,
    status: res?.status() ?? null,
    finalUrl,
    title,
    h1,
    hits,
  });
  console.log(
    JSON.stringify(
      {
        requested: path,
        finalUrl,
        status: res?.status() ?? null,
        oldHits: Object.entries(hits)
          .filter(([, v]) => v)
          .map(([k]) => k),
      },
      null,
      0,
    ),
  );
}

writeFileSync(resolve(OUT, "visible-ui-report.json"), JSON.stringify(report, null, 2));
await browser.close();
console.log("wrote", resolve(OUT, "visible-ui-report.json"));
