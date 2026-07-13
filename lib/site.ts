export const siteConfig = {
  name: "BrandBridge",
  shortName: "BrandBridge",
  tagline: "メーカーと販売パートナーをつなぐ",
  description:
    "BrandBridgeは、製品を広げたいメーカーと、良い商材を探す販売パートナーのためのBtoBマッチングサービスです。案件掲載・交渉・成約までをサポートします。",
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
