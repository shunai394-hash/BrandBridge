export const siteConfig = {
  name: "BrandBridge",
  shortName: "BrandBridge",
  tagline: "販路開拓と商材探しを最短でつなぐ",
  description:
    "BrandBridgeは、販路を広げたいメーカーと売れる商材を探す販売パートナーのための条件が見えるBtoBマッチング。掲載・商材探し・交渉・成約までを一つの流れで。現在ベータ先行登録受付中。",
  locale: "ja_JP",
  contactEmail: "support@brandbridge.example",
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
