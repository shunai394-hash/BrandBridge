import { chromium } from "playwright";

const BASE = "http://127.0.0.1:3000";
const OLD = [
  "商品・ブランド名",
  "商品の特徴・差別化ポイント",
  "審査待ち案件",
  "公開中案件",
  "交渉数",
];

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext();
await context.setExtraHTTPHeaders({ "x-bb-admin-ui-probe": "1" });
const page = await context.newPage();

async function check(path, expectStayOn, expectNew) {
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 90000 });
  const url = page.url();
  const body = await page.locator("body").innerText();
  const oldHits = OLD.filter((s) => body.includes(s));
  const newHits = expectNew.filter((s) => body.includes(s));
  const stayed =
    url === BASE + expectStayOn ||
    url.startsWith(BASE + expectStayOn + "?");
  console.log(`\n[${path}] finalUrl=${url}`);
  console.log("  stayedOnSameUrl:", stayed);
  console.log("  oldHits:", oldHits.length ? oldHits.join(" | ") : "(none)");
  console.log("  newHits:", newHits.join(" | ") || "(none)");
  return { url, stayed, oldHits, newHits, body };
}

const maker = await check("/maker/cases/new", "/maker/cases/new", [
  "商品名",
  "商品説明",
]);
await page.screenshot({
  path: "C:/Users/shuro/Desktop/BrandBridge/.tmp/verify-maker-new.png",
  fullPage: true,
});

const admin = await check("/admin", "/admin", ["商品", "交渉", "手数料", "売上"]);
await page.screenshot({
  path: "C:/Users/shuro/Desktop/BrandBridge/.tmp/verify-admin.png",
  fullPage: true,
});

await browser.close();

let fail = false;
if (!maker.stayed || maker.oldHits.length || maker.newHits.length < 2) {
  console.error("FAIL maker/cases/new");
  fail = true;
}
if (
  !admin.stayed ||
  admin.oldHits.some((s) =>
    ["公開中案件", "交渉数", "審査待ち案件"].includes(s),
  ) ||
  !["商品", "交渉", "手数料", "売上"].every((s) => admin.body.includes(s))
) {
  console.error("FAIL admin (must stay on /admin with new sections)");
  fail = true;
}

if (fail) process.exit(1);
console.log("\nOK same-URL working-tree UI verified");
