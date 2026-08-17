import { getOfficialPublicOrigin } from "@/lib/site";
import type { AnalyzedPage, CatalogPage } from "@/lib/marketing-agent/types";
import {
  catalogPathToUrl,
  listFetchTargets,
} from "@/lib/marketing-agent/site-catalog";

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "));
}

function metaContent(html: string, name: string): string | null {
  const named = html.match(
    new RegExp(
      `<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>`,
      "i",
    ),
  );
  if (named?.[1]) return decodeEntities(named[1]);
  const reversed = html.match(
    new RegExp(
      `<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["'][^>]*>`,
      "i",
    ),
  );
  return reversed?.[1] ? decodeEntities(reversed[1]) : null;
}

function canonicalHref(html: string): string | null {
  const canonical = html.match(
    /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i,
  );
  const reversed = html.match(
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i,
  );
  const href = canonical?.[1] || reversed?.[1];
  return href ? decodeEntities(href) : null;
}

export function extractPageSignals(html: string, origin: string): {
  title: string | null;
  description: string | null;
  h1: string | null;
  h2: string[];
  canonical: string | null;
  robots: string | null;
  internalLinks: string[];
} {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h2: string[] = [];
  const h2Re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let h2Match = h2Re.exec(html);
  while (h2Match && h2.length < 12) {
    const text = stripTags(h2Match[1] ?? "");
    if (text) h2.push(text);
    h2Match = h2Re.exec(html);
  }

  const links = new Set<string>();
  const aRe = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let aMatch = aRe.exec(html);
  while (aMatch) {
    const href = aMatch[1] ?? "";
    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      aMatch = aRe.exec(html);
      continue;
    }
    try {
      const url = new URL(href, origin);
      if (url.origin === origin) {
        const path = `${url.pathname}${url.search}`;
        if (!path.startsWith("/admin")) links.add(path || "/");
      }
    } catch {
      // ignore invalid href
    }
    aMatch = aRe.exec(html);
  }

  return {
    title: titleMatch?.[1] ? stripTags(titleMatch[1]) : null,
    description: metaContent(html, "description"),
    h1: h1Match?.[1] ? stripTags(h1Match[1]) : null,
    h2,
    canonical: canonicalHref(html),
    robots: metaContent(html, "robots"),
    internalLinks: Array.from(links).slice(0, 40),
  };
}

function pageIssues(page: AnalyzedPage): string[] {
  const issues: string[] = [];
  if (page.fetchError) issues.push(`fetch failed: ${page.fetchError}`);
  if (!page.title) issues.push("missing title");
  else if (page.title.length < 20 || page.title.length > 70) {
    issues.push(`title length ${page.title.length}`);
  }
  if (!page.description) issues.push("missing meta description");
  else if (page.description.length < 70 || page.description.length > 170) {
    issues.push(`meta description length ${page.description.length}`);
  }
  if (!page.h1) issues.push("missing h1");
  if (page.h2.length < 2 && page.pageType === "guide") {
    issues.push("few h2 headings");
  }
  if (page.internalLinks.length < 3) issues.push("few internal links");
  if (!page.canonical && page.seoImportance === "high") {
    issues.push("missing canonical");
  }
  return issues;
}

async function fetchOne(
  page: CatalogPage,
  origin: string,
): Promise<AnalyzedPage> {
  const url = catalogPathToUrl(page.path, origin);
  const base: AnalyzedPage = {
    ...page,
    url,
    title: null,
    description: null,
    h1: null,
    h2: [],
    canonical: null,
    robots: null,
    internalLinks: [],
    issues: [],
  };

  if (!page.fetchLive) {
    base.issues = ["not fetched (utility/low-priority)"];
    return base;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "text/html",
        "User-Agent": "BrandBridgeMarketingAgent/1.0",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      base.fetchError = `HTTP ${response.status}`;
      base.issues = pageIssues(base);
      return base;
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      base.fetchError = `unexpected content-type ${contentType}`;
      base.issues = pageIssues(base);
      return base;
    }
    const html = await response.text();
    const signals = extractPageSignals(html, origin);
    const analyzed = { ...base, ...signals };
    analyzed.issues = pageIssues(analyzed);
    return analyzed;
  } catch (error) {
    base.fetchError =
      error instanceof Error && error.name === "AbortError"
        ? "timeout"
        : error instanceof Error
          ? error.message
          : "fetch failed";
    base.issues = pageIssues(base);
    return base;
  } finally {
    clearTimeout(timer);
  }
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current]);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker(),
  );
  await Promise.all(workers);
  return results;
}

export async function crawlPublicPages(options?: {
  maxPages?: number;
}): Promise<AnalyzedPage[]> {
  const origin = getOfficialPublicOrigin();
  const targets = listFetchTargets().slice(0, options?.maxPages ?? 28);
  if (targets.length === 0) return [];
  return mapPool(targets, 4, (page) => fetchOne(page, origin));
}

export function summarizePagesForPrompt(pages: AnalyzedPage[]) {
  return pages.map((page) => ({
    url: page.url,
    path: page.path || "/",
    language: page.language,
    pageType: page.pageType,
    seoImportance: page.seoImportance,
    title: page.title,
    description: page.description,
    h1: page.h1,
    h2: page.h2.slice(0, 8),
    canonical: page.canonical,
    robots: page.robots,
    internalLinkCount: page.internalLinks.length,
    issues: page.issues,
    fetchError: page.fetchError ?? null,
  }));
}

export function heuristicSeoFlags(pages: AnalyzedPage[]) {
  return {
    importantPages: pages
      .filter((page) => page.seoImportance === "high")
      .map((page) => page.path || "/"),
    missingTitleOrMeta: pages
      .filter(
        (page) =>
          page.issues.includes("missing title") ||
          page.issues.includes("missing meta description"),
      )
      .map((page) => page.path || "/"),
    thinOrFewHeadings: pages
      .filter((page) =>
        page.issues.some(
          (issue) => issue.includes("h2") || issue.includes("h1"),
        ),
      )
      .map((page) => page.path || "/"),
    fewInternalLinks: pages
      .filter((page) => page.issues.includes("few internal links"))
      .map((page) => page.path || "/"),
  };
}
