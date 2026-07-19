export const siteConfig = {
  name: "BrandBridge",
  shortName: "BrandBridge",
  tagline: "商品を広げたい事業者と販売パートナーを最短でつなぐ",
  description:
    "BrandBridgeは、商品を広げたい事業者と売れる商材を探す販売パートナーをつなぐ、条件が見えるBtoBマッチング。掲載・商材探し・交渉・成約までを一つの流れで。現在ベータ先行登録受付中。",
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
