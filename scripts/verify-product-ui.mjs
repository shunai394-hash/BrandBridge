import http from "node:http";
import { chromium } from "playwright";

function fetch(path, headers = {}) {
  return new Promise((resolve, reject) => {
    http
      .get(
        {
          hostname: "127.0.0.1",
          port: 3000,
          path,
          headers: { Accept: "text/html", ...headers },
        },
        (res) => {
          let b = "";
          res.setEncoding("utf8");
          res.on("data", (c) => (b += c));
          res.on("end", () =>
            resolve({ status: res.statusCode, body: b, loc: res.headers.location || "" }),
          );
        },
      )
      .on("error", reject);
  });
}

const probe = { "x-bb-admin-ui-probe": "1" };

const form = await fetch("/maker/cases/new", probe);
console.log("FORM status", form.status);
console.log(
  "FORM has 商品コード（SKU）",
  form.body.includes("商品コード（SKU）"),
);
console.log("FORM has 商品名", form.body.includes("商品名"));
console.log("FORM has ★SKUテスト★", form.body.includes("★SKUテスト★"));
console.log("FORM has 商品を登録", form.body.includes("商品を登録"));

const list = await fetch("/cases");
console.log("\nLIST status", list.status);
console.log("LIST has 商品一覧", list.body.includes("商品一覧"));
console.log("LIST has SKU：", list.body.includes("SKU："));

// Find a case id from list HTML if present
const idMatch = list.body.match(/\/cases\/([0-9a-f-]{36})/);
const caseId = idMatch?.[1];
console.log("LIST sample caseId", caseId || "(none)");

if (caseId) {
  const detail = await fetch(`/cases/${caseId}`);
  console.log("\nDETAIL status", detail.status);
  console.log(
    "DETAIL has 商品コード（SKU）",
    detail.body.includes("商品コード（SKU）"),
  );
  console.log("DETAIL has 差別化ポイント row label alone", /差別化ポイント/.test(detail.body) && !detail.body.includes("商品特徴・強み・差別化ポイント"));
}

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext();
await context.setExtraHTTPHeaders(probe);
const page = await context.newPage();
await page.goto("http://127.0.0.1:3000/maker/cases/new", {
  waitUntil: "networkidle",
  timeout: 90000,
});
const labels = await page.locator("label, span.font-medium, h1").allTextContents();
console.log("\nBROWSER form labels sample:", labels.slice(0, 20).join(" | "));
const skuVisible = await page.getByText("商品コード（SKU）", { exact: true }).count();
console.log("BROWSER sku field count", skuVisible);
await page.screenshot({
  path: "C:/Users/shuro/Desktop/BrandBridge/.tmp/verify-product-form.png",
  fullPage: true,
});

await page.goto("http://127.0.0.1:3000/cases", {
  waitUntil: "networkidle",
  timeout: 90000,
});
const listText = await page.locator("body").innerText();
console.log("BROWSER list has 商品一覧", listText.includes("商品一覧"));
console.log("BROWSER list has SKU：", listText.includes("SKU："));
await page.screenshot({
  path: "C:/Users/shuro/Desktop/BrandBridge/.tmp/verify-product-list.png",
  fullPage: true,
});

if (caseId) {
  await page.goto(`http://127.0.0.1:3000/cases/${caseId}`, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  const detailText = await page.locator("body").innerText();
  console.log(
    "BROWSER detail has 商品コード（SKU）",
    detailText.includes("商品コード（SKU）"),
  );
  await page.screenshot({
    path: "C:/Users/shuro/Desktop/BrandBridge/.tmp/verify-product-detail.png",
    fullPage: true,
  });
}

await browser.close();
console.log("\nOK verify done");
