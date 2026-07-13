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
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
