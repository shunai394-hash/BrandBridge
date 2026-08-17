import {
  catalogPathToUrl,
  findCatalogPageByPath,
  listPublicCatalogPages,
  normalizeCatalogPath,
} from "@/lib/marketing-agent/site-catalog";
import type { CatalogPage } from "@/lib/marketing-agent/types";
import { getSiteUrl, isOfficialSiteUrl } from "@/lib/site";

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

function toRef(page: CatalogPage, origin = getSiteUrl()): PublishedPageRef {
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
  origin = getSiteUrl(),
): PublishedPageRef[] {
  return listPublicCatalogPages()
    .filter((page) => page.published)
    .map((page) => toRef(page, origin));
}

export function listSocialTargetPages(
  language?: CatalogPage["language"],
  origin = getSiteUrl(),
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

function parseUrlOrPath(value: string, origin = getSiteUrl()): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (!isOfficialSiteUrl(url.toString(), origin)) return null;
      return normalizeCatalogPath(url.pathname);
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
  origin = getSiteUrl(),
): PublishedPageRef | null {
  const path = parseUrlOrPath(pathOrUrl, origin);
  if (path === null) return null;
  const page = findCatalogPageByPath(path);
  if (!page?.published) return null;
  return toRef(page, origin);
}

export function resolvePublishedPageOrThrow(
  pathOrUrl: string,
  origin = getSiteUrl(),
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
  origin = getSiteUrl(),
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
  origin = getSiteUrl(),
): string {
  if (!text) return text;
  const officialHost = new URL(origin).hostname.replace(/^www\./i, "").toLowerCase();
  const rewrittenHttp = text.replace(HTTP_URL_RE, (raw) => {
    const trailing = raw.match(/[.,;:]+$/)?.[0] ?? "";
    const candidate = trailing ? raw.slice(0, -trailing.length) : raw;
    try {
      const url = new URL(candidate);
      const host = url.hostname.replace(/^www\./i, "").toLowerCase();
      if (host === officialHost || host.includes("brandbridge")) {
        return `${canonicalUrl}${trailing}`;
      }
      return raw;
    } catch {
      return raw;
    }
  });
  const rewritten = rewrittenHttp.replace(BARE_BRANDBRIDGE_RE, (raw) => {
    if (raw === canonicalUrl) return raw;
    try {
      const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      const host = url.hostname.replace(/^www\./i, "").toLowerCase();
      if (host === officialHost || host.includes("brandbridge")) {
        return canonicalUrl;
      }
      return raw;
    } catch {
      return canonicalUrl;
    }
  });

  const hasCanonical = rewritten.includes(canonicalUrl);
  if (hasCanonical) return rewritten;
  return `${rewritten.trim()}\n\n${canonicalUrl}`.trim();
}

export function sanitizeSocialPayload(
  posts: Record<string, unknown>,
  canonicalUrl: string,
  origin = getSiteUrl(),
): Record<string, unknown> {
  const rewriteValue = (value: unknown): unknown => {
    if (typeof value === "string") {
      return rewriteToCanonicalUrl(value, canonicalUrl, origin);
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
    canonicalUrl,
    siteOrigin: origin,
  };
}

export async function assertPublishedUrlLive(
  url: string,
  origin = getSiteUrl(),
): Promise<{ title: string | null; description: string | null; h1: string | null }> {
  if (!isOfficialSiteUrl(url, origin)) {
    throw new Error(PUBLIC_URL_MISSING);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        Accept: "text/html",
        "User-Agent": "BrandBridgeMarketingAgent/1.0",
      },
      signal: controller.signal,
    });
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
    return { title, description, h1 };
  } catch (error) {
    if (error instanceof Error && error.message === PUBLIC_URL_MISSING) {
      throw error;
    }
    throw new Error(PUBLIC_URL_MISSING);
  } finally {
    clearTimeout(timer);
  }
}
