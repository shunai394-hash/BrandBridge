import { chromium } from "playwright";

const OLD_EXACT = [
  "審査待ち案件",
  "公開中案件",
  "交渉数",
  "成約件数",
  "成約金額合計",
];

function hasLegacyFeeTotal(text) {
  return text.includes("手数料合計") && !text.includes("仲介手数料合計");
}

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext();
await context.setExtraHTTPHeaders({ "x-bb-admin-ui-probe": "1" });
const page = await context.newPage();
await page.goto("http://127.0.0.1:3000/admin", {
  waitUntil: "networkidle",
  timeout: 90000,
});
const url = page.url();
const body = await page.locator("body").innerText();
const oldHits = OLD_EXACT.filter((s) => body.includes(s));
if (hasLegacyFeeTotal(body)) oldHits.push("手数料合計");
const newOk = ["審査待ち商品", "公開中商品", "売上", "表示区分：商品 / 交渉 / 手数料 / 売上"].every(
  (s) => body.includes(s),
);
console.log("URL", url);
console.log("OLD hits", oldHits);
console.log("newOk", newOk);
await page.screenshot({
  path: "C:/Users/shuro/Desktop/BrandBridge/.tmp/admin-final.png",
  fullPage: true,
});
await browser.close();
if (!url.startsWith("http://127.0.0.1:3000/admin")) process.exit(2);
if (url.includes("/dashboard")) process.exit(2);
if (oldHits.length) process.exit(3);
if (!newOk) process.exit(4);
console.log("OK");
