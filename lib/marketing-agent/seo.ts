import { catalogPageUrl, listCatalogPages } from "./site-catalog";
import type { SeoSnapshot } from "./types";

function extractTag(html: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = html.match(re);
  return match?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || null;
}

function extractMeta(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`,
    "i",
  );
  return html.match(re)?.[1]?.trim() || html.match(alt)?.[1]?.trim() || null;
}

function extractAll(html: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const out: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const text = match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text) out.push(text);
  }
  return out;
}

function extractInternalLinks(html: string): string[] {
  const re = /<a[^>]+href=["']([^"']+)["']/gi;
  const out = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const href = match[1];
    if (href.startsWith("/") && !href.startsWith("//")) {
      out.add(href.split("?")[0]);
    }
  }
  return [...out].slice(0, 40);
}

export async function fetchSeoSnapshot(path: string): Promise<SeoSnapshot> {
  const url = catalogPageUrl(path);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "BrandBridgeMarketingAgent/1.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return {
        path,
        url,
        ok: false,
        title: null,
        metaDescription: null,
        h1: null,
        h2: [],
        canonical: null,
        robots: null,
        internalLinks: [],
        error: `HTTP ${res.status}`,
      };
    }
    const html = await res.text();
    const canonical =
      html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ||
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1] ||
      null;

    return {
      path,
      url,
      ok: true,
      title: extractTag(html, "title"),
      metaDescription: extractMeta(html, "description"),
      h1: extractAll(html, "h1")[0] ?? null,
      h2: extractAll(html, "h2").slice(0, 12),
      canonical,
      robots: extractMeta(html, "robots"),
      internalLinks: extractInternalLinks(html),
    };
  } catch (error) {
    return {
      path,
      url,
      ok: false,
      title: null,
      metaDescription: null,
      h1: null,
      h2: [],
      canonical: null,
      robots: null,
      internalLinks: [],
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

export async function analyzeExistingPages(limit = 12): Promise<SeoSnapshot[]> {
  const pages = listCatalogPages().slice(0, limit);
  const snapshots: SeoSnapshot[] = [];
  for (const page of pages) {
    snapshots.push(await fetchSeoSnapshot(page.path));
  }
  return snapshots;
}
