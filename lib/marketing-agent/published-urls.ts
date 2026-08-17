import {
  catalogPathToUrl,
  findCatalogPageByPath,
  listPublicCatalogPages,
  normalizeCatalogPath,
} from "@/lib/marketing-agent/site-catalog";
import type { CatalogPage } from "@/lib/marketing-agent/types";
import {
  getOfficialPublicOrigin,
  isAllowedSnsPublicUrl,
  isVercelDeploymentHost,
  rewriteVercelAppUrls,
  toOfficialPublicUrl,
} from "@/lib/site";

export const PUBLIC_URL_MISSING = "公開URLがありません";
export const JA_PUBLIC_URL_MISSING = "日本語公開ページがありません";

export type PublishedPageRef = {
  path: string;
  label: string;
  language: CatalogPage["language"];
  pageType: CatalogPage["pageType"];
  url: string;
};

const SOCIAL_PAGE_TYPES = new Set<CatalogPage["pageType"]>([
  "home",
  "listing",
  "guide",
  "register",
  "pricing",
  "showcase",
  "model_case",
  "company",
]);

function toRef(
  page: CatalogPage,
  origin = getOfficialPublicOrigin(),
): PublishedPageRef {
  const path = normalizeCatalogPath(page.path);
  return {
    path: path || "/",
    label: page.label,
    language: page.language,
    pageType: page.pageType,
    url: catalogPathToUrl(page.path, origin),
  };
}

export function listPublishedPageRefs(
  origin = getOfficialPublicOrigin(),
): PublishedPageRef[] {
  return listPublicCatalogPages()
    .filter((page) => page.published)
    .map((page) => toRef(page, origin));
}

export function listSocialTargetPages(
  language?: CatalogPage["language"],
  origin = getOfficialPublicOrigin(),
): PublishedPageRef[] {
  return listPublicCatalogPages()
    .filter(
      (page) =>
        page.published &&
        SOCIAL_PAGE_TYPES.has(page.pageType) &&
        page.seoImportance !== "low" &&
        (!language || page.language === language),
    )
    .map((page) => toRef(page, origin));
}

function parseUrlOrPath(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const path = normalizeCatalogPath(url.pathname);
      if (isVercelDeploymentHost(url.hostname)) {
        return path;
      }
      const host = url.hostname.replace(/^www\./i, "").toLowerCase();
      if (host !== "brandbridge.jp") return null;
      return path;
    } catch {
      return null;
    }
  }
  return normalizeCatalogPath(trimmed);
}

/**
 * Resolves a live public page. Never guesses from titles or draft slugs.
 * Only exact catalog paths (or official-origin URLs of those paths) match.
 */
export function findPublishedPage(
  pathOrUrl: string,
  origin = getOfficialPublicOrigin(),
): PublishedPageRef | null {
  const path = parseUrlOrPath(pathOrUrl);
  if (path === null) return null;
  const page = findCatalogPageByPath(path);
  if (!page?.published) return null;
  return toRef(page, origin);
}

export function resolvePublishedPageOrThrow(
  pathOrUrl: string,
  origin = getOfficialPublicOrigin(),
): PublishedPageRef {
  const page = findPublishedPage(pathOrUrl, origin);
  if (!page) {
    throw new Error(PUBLIC_URL_MISSING);
  }
  return page;
}

/** Draft slugs are not public URLs unless they exactly match a catalog path. */
export function publishedPageForDraftSlug(
  slug: string | null | undefined,
  origin = getOfficialPublicOrigin(),
): PublishedPageRef | null {
  if (!slug?.trim()) return null;
  return findPublishedPage(slug, origin);
}

const HTTP_URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;
const BARE_BRANDBRIDGE_RE =
  /\b(?:https?:\/\/)?(?:www\.)?brandbridge\.[a-z0-9.-]+(?:\/[^\s<>"')\]]*)?/gi;

export function rewriteToCanonicalUrl(
  text: string,
  canonicalUrl: string,
  origin = getOfficialPublicOrigin(),
): string {
  if (!text) return text;
  const officialCanonical = toOfficialPublicUrl(canonicalUrl);
  const officialHost = new URL(origin).hostname.replace(/^www\./i, "").toLowerCase();
  const withoutVercel = rewriteVercelAppUrls(text);
  const rewrittenHttp = withoutVercel.replace(HTTP_URL_RE, (raw) => {
    const trailing = raw.match(/[.,;:]+$/)?.[0] ?? "";
    const candidate = trailing ? raw.slice(0, -trailing.length) : raw;
    try {
      const url = new URL(candidate);
      if (isVercelDeploymentHost(url.hostname)) {
        return `${officialCanonical}${trailing}`;
      }
      const host = url.hostname.replace(/^www\./i, "").toLowerCase();
      if (host === officialHost || host.includes("brandbridge")) {
        return `${officialCanonical}${trailing}`;
      }
      return raw;
    } catch {
      return raw;
    }
  });
  const rewritten = rewrittenHttp.replace(BARE_BRANDBRIDGE_RE, (raw) => {
    if (raw === officialCanonical) return raw;
    try {
      const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      if (isVercelDeploymentHost(url.hostname)) {
        return officialCanonical;
      }
      const host = url.hostname.replace(/^www\./i, "").toLowerCase();
      if (host === officialHost || host.includes("brandbridge")) {
        return officialCanonical;
      }
      return raw;
    } catch {
      return officialCanonical;
    }
  });

  const hasCanonical = rewritten.includes(officialCanonical);
  if (hasCanonical) return rewritten;
  return `${rewritten.trim()}\n\n${officialCanonical}`.trim();
}

export function sanitizeSocialPayload(
  posts: Record<string, unknown>,
  canonicalUrl: string,
  _origin = getOfficialPublicOrigin(),
): Record<string, unknown> {
  const officialCanonical = toOfficialPublicUrl(canonicalUrl);
  const officialOrigin = getOfficialPublicOrigin();
  const rewriteValue = (value: unknown): unknown => {
    if (typeof value === "string") {
      return rewriteToCanonicalUrl(value, officialCanonical, officialOrigin);
    }
    if (Array.isArray(value)) {
      return value.map((item) => rewriteValue(item));
    }
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, item]) => [
          key,
          rewriteValue(item),
        ]),
      );
    }
    return value;
  };

  const rewritten = rewriteValue(posts);
  const record =
    rewritten && typeof rewritten === "object" && !Array.isArray(rewritten)
      ? (rewritten as Record<string, unknown>)
      : {};

  return {
    ...record,
    canonicalUrl: officialCanonical,
    siteOrigin: officialOrigin,
  };
}

const AUTH_WALL_TITLE_RE =
  /login\s*[–—\-]\s*vercel|authentication required|vercel sso|deployment protection/i;

export function usableFetchedPageText(value: string | null | undefined): string | null {
  const text = value?.replace(/\s+/g, " ").trim() ?? "";
  if (!text) return null;
  if (AUTH_WALL_TITLE_RE.test(text)) return null;
  return text;
}

function isAuthWallHtml(html: string, title: string | null): boolean {
  if (title && AUTH_WALL_TITLE_RE.test(title)) return true;
  if (/Login\s*[–—-]\s*Vercel/i.test(html)) return true;
  if (/vercel\.com\/login/i.test(html) && /deployment protection/i.test(html)) {
    return true;
  }
  return false;
}

export async function assertPublishedUrlLive(
  url: string,
): Promise<{ title: string | null; description: string | null; h1: string | null }> {
  const officialUrl = toOfficialPublicUrl(url);
  if (!isAllowedSnsPublicUrl(officialUrl)) {
    throw new Error(PUBLIC_URL_MISSING);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(officialUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        Accept: "text/html",
        "User-Agent": "BrandBridgeMarketingAgent/1.0",
      },
      signal: controller.signal,
    });
    if (response.status === 401 || response.status === 403) {
      return { title: null, description: null, h1: null };
    }
    if (response.status === 404 || response.status === 410 || !response.ok) {
      throw new Error(PUBLIC_URL_MISSING);
    }
    const html = await response.text();
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim() ?? null;
    const description =
      html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
      )?.[1] ??
      html.match(
        /<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i,
      )?.[1] ??
      null;
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim() ?? null;
    if (isAuthWallHtml(html, title)) {
      return { title: null, description: null, h1: null };
    }
    return {
      title: usableFetchedPageText(title),
      description: usableFetchedPageText(description),
      h1: usableFetchedPageText(h1),
    };
  } catch (error) {
    if (error instanceof Error && error.message === PUBLIC_URL_MISSING) {
      throw error;
    }
    throw new Error(PUBLIC_URL_MISSING);
  } finally {
    clearTimeout(timer);
  }
}
