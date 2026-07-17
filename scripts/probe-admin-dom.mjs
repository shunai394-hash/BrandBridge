/**
 * Open localhost admin UI and dump visible metric labels from the DOM.
 * Uses a one-shot layout probe header (dev only) — see admin/layout.tsx.
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = "http://127.0.0.1:3000";
const OUT = resolve(import.meta.dirname, "../.tmp");

const OLD = [
  "審査待ち案件",
  "公開中案件",
  "交渉数",
  "成約件数",
  "成約金額合計",
  "手数料合計",
];
const NEW = [
  "BB_ADMIN_OPS_V2",
  "審査待ち商品",
  "公開中商品",
  "非公開商品",
  "交渉中",
  "契約準備",
  "契約済み",
  "請求待ち",
  "未払い",
  "支払い済み",
  "契約金額合計",
  "仲介手数料合計",
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
});
const context = await browser.newContext();
await context.setExtraHTTPHeaders({ "x-bb-admin-ui-probe": "1" });
const page = await context.newPage();

const urls = ["/admin"];
const report = [];

for (const path of urls) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60000 });
  const url = page.url();
  const bodyText = await page.locator("body").innerText();
  const labels = await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll(
        "[data-dashboard-metric] p, [data-testid='admin-dashboard-version'], h1, h2",
      ),
    );
    return nodes.map((n) => (n.textContent || "").replace(/\s+/g, " ").trim());
  });
  const marker = await page
    .locator("[data-admin-dashboard='ops-v2']")
    .count();
  const entry = {
    path,
    finalUrl: url,
    opsV2Markers: marker,
    labels,
    oldHits: OLD.filter((s) => bodyText.includes(s)),
    newHits: NEW.filter((s) => bodyText.includes(s)),
  };
  report.push(entry);
  await page.screenshot({
    path: resolve(OUT, `admin-dom${path.replace(/\//g, "-") || "-root"}.png`),
    fullPage: true,
  });
  console.log(JSON.stringify(entry, null, 2));
}

writeFileSync(resolve(OUT, "admin-dom-report.json"), JSON.stringify(report, null, 2));
await browser.close();

const dash = report.find((r) => r.path === "/admin") || report[0];
if (!dash.newHits.includes("審査待ち商品") && dash.opsV2Markers < 1) {
  console.error("FAIL: new admin ops UI not in DOM");
  process.exit(1);
}
if (dash.oldHits.some((h) => ["公開中案件", "交渉数", "成約件数"].includes(h))) {
  console.error("FAIL: old card labels still in DOM", dash.oldHits);
  process.exit(1);
}
console.log("OK ops-v2 visible in DOM");
