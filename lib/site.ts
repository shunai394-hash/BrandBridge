export const siteConfig = {
  name: "BrandBridge",
  shortName: "BrandBridge",
  tagline: "日本進出したい海外ブランドと売れる販売パートナーをつなぐ",
  description:
    "BrandBridgeは、MOQ・卸価格・独占可否・輸送条件まで整理された、交渉可能なBtoB商談プラットフォーム。紹介だけで終わらず、条件が合えばそのまま商談・交渉へ進めます。現在ベータ先行登録受付中。",
  locale: "ja_JP",
  contactEmail: "support@brandbridge.example",
  company: {
    name: "BrandBridge",
    postalCode: "〒150-0013",
    address: "東京都渋谷区恵比寿1-23-9",
  },
} as const;

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  const fallback = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
    : "http://localhost:3000";

  const candidate = raw && raw.length > 0 ? raw : fallback;
  const withProtocol = /^https?:\/\//i.test(candidate)
    ? candidate
    : `https://${candidate}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    console.error(
      "[getSiteUrl] invalid NEXT_PUBLIC_SITE_URL, using fallback:",
      candidate,
    );
    return "http://localhost:3000";
  }
}
