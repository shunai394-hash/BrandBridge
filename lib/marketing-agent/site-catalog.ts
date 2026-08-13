import { listPublishedModelCases } from "@/lib/model-cases";
import { getSiteUrl } from "@/lib/site";
import type { CatalogPage } from "./types";

export const STATIC_PAGES: CatalogPage[] = [
  {
    path: "/",
    title: "BrandBridge — 海外ブランドと日本の販売パートナーをつなぐ",
    language: "ja",
    kind: "hub",
    keyword: "日本進出 販売パートナー",
  },
  {
    path: "/en",
    title: "BrandBridge — Connect overseas brands with Japanese sales partners",
    language: "en",
    kind: "hub",
    keyword: "Japan market entry",
  },
  {
    path: "/en/japan-market-entry",
    title: "How to Enter the Japanese Market",
    language: "en",
    kind: "hub",
    keyword: "Japan market entry",
  },
  {
    path: "/en/japan-market-entry/how-to-enter-the-japanese-market",
    title: "How to Enter the Japanese Market (guide)",
    language: "en",
    kind: "guide",
    keyword: "enter Japanese market",
  },
  {
    path: "/en/japan-market-entry/how-to-find-japanese-distributors",
    title: "How to Find Japanese Distributors",
    language: "en",
    kind: "guide",
    keyword: "Japanese distributor",
  },
  {
    path: "/en/japan-market-entry/how-to-find-a-japanese-distributor",
    title: "How to Find a Japanese Distributor",
    language: "en",
    kind: "guide",
    keyword: "find Japanese distributor",
  },
  {
    path: "/en/japan-market-entry/how-to-find-japanese-retailers",
    title: "How to Find Japanese Retailers",
    language: "en",
    kind: "guide",
    keyword: "Japanese retailer",
  },
  {
    path: "/en/how-to-sell-in-japan",
    title: "How to Sell in Japan",
    language: "en",
    kind: "guide",
    keyword: "sell in Japan",
  },
  {
    path: "/how-to-sell-in-japan",
    title: "日本で売るには",
    language: "ja",
    kind: "guide",
    keyword: "日本で売る",
  },
  {
    path: "/en/japan-market-for-functional-food-brands",
    title: "Japan Market for Functional Food Brands",
    language: "en",
    kind: "guide",
    keyword: "Japan functional food",
  },
  {
    path: "/en/japan-partner-demand-snapshot",
    title: "Japan Partner Demand Snapshot",
    language: "en",
    kind: "guide",
    keyword: "Japan wholesale",
  },
  {
    path: "/en/product-showcase",
    title: "Product Showcase",
    language: "en",
    kind: "product",
    keyword: "import to Japan",
  },
  {
    path: "/en/pricing",
    title: "Pricing",
    language: "en",
    kind: "utility",
  },
  {
    path: "/for-makers",
    title: "商品提供企業向け",
    language: "ja",
    kind: "utility",
  },
  {
    path: "/for-partners",
    title: "販売パートナー向け",
    language: "ja",
    kind: "utility",
  },
  {
    path: "/company",
    title: "会社情報",
    language: "ja",
    kind: "utility",
  },
];

export function listCatalogPages(): CatalogPage[] {
  const modelPages: CatalogPage[] = listPublishedModelCases().map((item) => ({
    path: `/en/model-cases/${item.slug}`,
    title: item.title,
    language: "en" as const,
    kind: "model_case" as const,
    keyword: "Japan business partner",
  }));
  return [...STATIC_PAGES, ...modelPages];
}

export function catalogPageUrl(path: string): string {
  const base = getSiteUrl();
  if (path === "/") return base;
  return `${base}${path}`;
}

export const CORE_TOPICS = [
  "Japan market",
  "Japan market entry",
  "Japanese distributor",
  "Japanese retailer",
  "Japan wholesale",
  "sell in Japan",
  "import to Japan",
  "Japan business partner",
] as const;
