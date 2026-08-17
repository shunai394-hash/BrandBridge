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

/** Public marketing / SNS origin. Never a Vercel deployment URL. */
export const OFFICIAL_PUBLIC_ORIGIN = "https://www.brandbridge.jp";

export function getOfficialPublicOrigin(): string {
  return OFFICIAL_PUBLIC_ORIGIN;
}

export function isVercelDeploymentHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  return (
    host === "vercel.app" ||
    host.endsWith(".vercel.app") ||
    host === "vercel.com" ||
    host.endsWith(".vercel.com")
  );
}

export function containsVercelAppUrl(text: string): boolean {
  return /(?:https?:\/\/)?[^\s]*vercel\.app\b/i.test(text);
}

function parseOrigin(value: string): string | null {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

/**
 * App origin for sitemap / OG / auth.
 * Never falls back to VERCEL_URL or *.vercel.app.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  const fromEnv = raw ? parseOrigin(raw) : null;
  if (fromEnv && !isVercelDeploymentHost(new URL(fromEnv).hostname)) {
    return fromEnv;
  }

  if (process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return OFFICIAL_PUBLIC_ORIGIN;
}

/** Catalog path or any URL → https://www.brandbridge.jp/... */
export function toOfficialPublicUrl(pathOrUrl = ""): string {
  const origin = OFFICIAL_PUBLIC_ORIGIN;
  const trimmed = pathOrUrl.trim();
  if (!trimmed || trimmed === "/") return origin;

  let pathname = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      pathname = new URL(trimmed).pathname;
    } catch {
      return origin;
    }
  }

  const withSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const normalized = withSlash.replace(/\/+$/, "") || "/";
  return normalized === "/" ? origin : `${origin}${normalized}`;
}

export function rewriteVercelAppUrls(text: string): string {
  if (!text) return text;
  return text.replace(
    /https?:\/\/[^\s<>"')\]]*vercel\.app(\/[^\s<>"')\]]*)?/gi,
    (raw, pathPart: string | undefined) => {
      const trailing = raw.match(/[.,;:]+$/)?.[0] ?? "";
      const pathname = (pathPart ?? "").replace(/[.,;:]+$/, "").split(/[?#]/)[0] ?? "";
      return `${toOfficialPublicUrl(pathname)}${trailing}`;
    },
  );
}

export function getSiteHost(): string {
  return new URL(getSiteUrl()).hostname.replace(/^www\./i, "").toLowerCase();
}

export function toSiteUrl(path = ""): string {
  const origin = getSiteUrl();
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") return origin;
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${origin}${withSlash.replace(/\/+$/, "")}`;
}

export function isOfficialSiteUrl(value: string, origin = getSiteUrl()): boolean {
  try {
    const expected = new URL(origin);
    const actual = new URL(value);
    if (isVercelDeploymentHost(actual.hostname)) return false;
    const expectedHost = expected.hostname.replace(/^www\./i, "").toLowerCase();
    const actualHost = actual.hostname.replace(/^www\./i, "").toLowerCase();
    return actual.protocol === expected.protocol && actualHost === expectedHost;
  } catch {
    return false;
  }
}

/** SNS posts may only link to https://www.brandbridge.jp/... */
export function isAllowedSnsPublicUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    if (isVercelDeploymentHost(url.hostname)) return false;
    return url.hostname.toLowerCase() === "www.brandbridge.jp";
  } catch {
    return false;
  }
}

export function assertNoVercelAppUrl(text: string): void {
  if (containsVercelAppUrl(text)) {
    throw new Error("Vercel のデプロイURLは公開URLとして使用できません。");
  }
}

