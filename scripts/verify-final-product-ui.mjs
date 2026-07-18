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
          res.on("end", () => resolve({ status: res.statusCode, body: b }));
        },
      )
      .on("error", reject);
  });
}

const FORBIDDEN = ["案件を登録", "案件番号", "案件一覧", "案件詳細"];
const probe = { "x-bb-admin-ui-probe": "1" };

const form = await fetch("/maker/cases/new", probe);
const list = await fetch("/cases");
const id = list.body.match(/\/cases\/([0-9a-f-]{36})/)?.[1];
const detail = id ? await fetch(`/cases/${id}`) : { status: 0, body: "" };

for (const [name, r] of [
  ["form", form],
  ["list", list],
  ["detail", detail],
]) {
  const hits = FORBIDDEN.filter((s) => r.body.includes(s));
  console.log(name, "status", r.status, "forbidden", hits.length ? hits.join("|") : "(none)");
}

console.log("form has 商品コード（SKU）", form.body.includes("商品コード（SKU）"));
console.log("form has 商品画像 section last?", (() => {
  const iSku = form.body.indexOf("商品コード（SKU）");
  const iImg = form.body.lastIndexOf("商品画像");
  const iPartner = form.body.indexOf("希望パートナー条件");
  return iImg > iPartner && iImg > iSku;
})());
console.log("list has 商品番号（SKU）", list.body.includes("商品番号（SKU）"));
console.log("list has 掲載番号", list.body.includes("掲載番号"));
console.log("list has caseNumber class sticky?", list.body.includes("case-number") || list.body.includes("案件番号"));
console.log("detail has 商品コード（SKU）", detail.body.includes("商品コード（SKU）"));
console.log("detail has 商品説明", detail.body.includes("商品説明"));

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const ctx = await browser.newContext();
await ctx.setExtraHTTPHeaders(probe);
const page = await ctx.newPage();

await page.goto("http://127.0.0.1:3000/maker/cases/new", {
  waitUntil: "networkidle",
  timeout: 90000,
});
const sectionTitles = await page.locator("form h2").allTextContents();
console.log("BROWSER form sections:", sectionTitles.join(" → "));
console.log(
  "BROWSER image last:",
  sectionTitles[sectionTitles.length - 1] === "商品画像",
);
await page.screenshot({
  path: "C:/Users/shuro/Desktop/BrandBridge/.tmp/final-form.png",
  fullPage: true,
});

await page.goto("http://127.0.0.1:3000/cases", {
  waitUntil: "networkidle",
  timeout: 90000,
});
const headers = await page.locator("table thead th").allTextContents();
console.log("BROWSER list columns:", headers.map((h) => h.trim()).join(" | "));
const bodyText = await page.locator("body").innerText();
console.log("BROWSER forbidden in list", FORBIDDEN.filter((s) => bodyText.includes(s)));
await page.screenshot({
  path: "C:/Users/shuro/Desktop/BrandBridge/.tmp/final-list.png",
  fullPage: true,
});

if (id) {
  await page.goto(`http://127.0.0.1:3000/cases/${id}`, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  const d = await page.locator("body").innerText();
  console.log("BROWSER detail SKU label", d.includes("商品コード（SKU）"));
  console.log("BROWSER detail forbidden", FORBIDDEN.filter((s) => d.includes(s)));
  await page.screenshot({
    path: "C:/Users/shuro/Desktop/BrandBridge/.tmp/final-detail.png",
    fullPage: true,
  });
}

await browser.close();
console.log("OK");
