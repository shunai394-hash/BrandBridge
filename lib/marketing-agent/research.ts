import { existsSync } from "fs";
import { homedir } from "os";
import path from "path";
import type {
  AgentReachConnectionStatus,
  MarketSignal,
  MarketingPriority,
} from "@/lib/marketing-agent/types";

export const MARKET_RESEARCH_QUERIES = [
  "looking for Japanese distributor",
  "looking for Japanese retailer",
  "Japan market entry",
  "sell in Japan",
  "Japanese business partner",
  "Japan distribution",
  "Japan expansion",
  "Japanese wholesale",
  "import to Japan",
] as const;

export const COMPETITOR_DISCOVERY_QUERIES = [
  "Japan market entry services",
  "Japanese distributor matching",
  "Japanese distributor search",
  "Japan sales agent",
  "Japan retail distribution",
  "Japan wholesale",
  "Japan import distributor",
  "overseas brands entering Japan",
  "Japan B2B marketplace",
  "Japan business matching",
  "Japan market expansion support",
] as const;

const SOCIAL_PUBLIC_QUERIES = [
  "site:linkedin.com Japan market entry distributor",
  "site:reddit.com looking for Japanese distributor",
  "site:youtube.com how to enter Japanese market brand",
  "site:x.com Japan market entry brand distributor",
  "site:instagram.com Japan market entry brand",
] as const;

function defaultCliPath(): string {
  const custom = process.env.AGENT_REACH_BIN?.trim();
  if (custom) return custom;
  const home = homedir();
  const win = path.join(home, ".agent-reach-venv", "Scripts", "agent-reach.exe");
  const unix = path.join(home, ".agent-reach-venv", "bin", "agent-reach");
  if (existsSync(win)) return win;
  if (existsSync(unix)) return unix;
  return "";
}

export function getAgentReachConnection(): AgentReachConnectionStatus {
  if (process.env.AGENT_REACH_DISABLED === "true") {
    return {
      webReader: false,
      cliAvailable: false,
      note: "AGENT_REACH_DISABLED=true。公開Web取得もスキップします。",
    };
  }
  const cli = defaultCliPath();
  return {
    webReader: true,
    cliAvailable: Boolean(cli),
    note: cli
      ? "ローカル AgentReach CLI あり。Cookie は BrandBridge DB に保存しません。SNSログインチャネルは未接続です。"
      : "公開Web（Jina Reader）でリサーチします。Cookie チャネルは使いません。",
  };
}

function isAgentReachDisabled(): boolean {
  return process.env.AGENT_REACH_DISABLED === "true";
}

async function fetchText(
  url: string,
  timeoutMs: number,
): Promise<{ ok: boolean; text: string; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "text/plain, text/html, application/json",
        "User-Agent": "BrandBridgeMarketingAgent/1.0",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    const text = await response.text();
    if (!response.ok) {
      return { ok: false, text: "", error: `HTTP ${response.status}` };
    }
    return { ok: true, text };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "timeout"
        : error instanceof Error
          ? error.message
          : "fetch failed";
    return { ok: false, text: "", error: message };
  } finally {
    clearTimeout(timer);
  }
}

function extractUrls(markdown: string): Array<{ title: string; url: string; snippet: string }> {
  const hits: Array<{ title: string; url: string; snippet: string }> = [];
  const seen = new Set<string>();
  const mdLink = /\[([^\]]{1,160})\]\((https?:\/\/[^)\s]+)\)/g;
  let match = mdLink.exec(markdown);
  while (match && hits.length < 8) {
    const title = match[1]?.trim() ?? "";
    const url = match[2]?.trim() ?? "";
    if (url && !seen.has(url) && !url.includes("r.jina.ai") && !url.includes("s.jina.ai")) {
      seen.add(url);
      const idx = match.index ?? 0;
      hits.push({
        title,
        url,
        snippet: markdown.slice(idx, idx + 240).replace(/\s+/g, " ").trim(),
      });
    }
    match = mdLink.exec(markdown);
  }
  return hits;
}

async function searchPublicWeb(query: string): Promise<{
  query: string;
  source: "jina" | "none";
  error?: string;
  hits: Array<{ title: string; url: string; snippet: string }>;
}> {
  if (isAgentReachDisabled()) {
    return { query, source: "none", error: "AgentReach disabled", hits: [] };
  }
  const encoded = encodeURIComponent(query);
  const result = await fetchText(`https://s.jina.ai/${encoded}`, 12_000);
  if (!result.ok) {
    return {
      query,
      source: "none",
      error: result.error ?? "search failed",
      hits: [],
    };
  }
  return {
    query,
    source: "jina",
    hits: extractUrls(result.text),
  };
}

export async function readPublicPage(url: string): Promise<{
  url: string;
  markdown: string;
  error?: string;
  via: "jina" | "direct" | "none";
}> {
  if (isAgentReachDisabled()) {
    return { url, markdown: "", error: "AgentReach disabled", via: "none" };
  }
  const jina = await fetchText(`https://r.jina.ai/${url}`, 12_000);
  if (jina.ok && jina.text.trim().length > 80) {
    return { url, markdown: jina.text.slice(0, 12_000), via: "jina" };
  }
  const direct = await fetchText(url, 8_000);
  if (direct.ok) {
    return { url, markdown: direct.text.slice(0, 12_000), via: "direct" };
  }
  return {
    url,
    markdown: "",
    error: jina.error || direct.error || "unreadable",
    via: "none",
  };
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
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

function inferSignalType(query: string, url: string): MarketSignal["signalType"] {
  const q = query.toLowerCase();
  const u = url.toLowerCase();
  if (u.includes("linkedin.com") || u.includes("reddit.com") || u.includes("x.com")) {
    return "demand";
  }
  if (q.includes("looking for") || q.includes("business partner")) return "partner_search";
  if (q.includes("matching") || q.includes("marketplace") || q.includes("service")) {
    return "competitor";
  }
  if (q.includes("how to") || q.includes("guide") || q.includes("entry")) return "content";
  return "other";
}

function relevanceFromQuery(query: string): MarketingPriority {
  if (
    query.includes("looking for Japanese") ||
    query.includes("distributor matching")
  ) {
    return "high";
  }
  if (query.includes("Japan market entry") || query.includes("sell in Japan")) {
    return "high";
  }
  return "medium";
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function isNoiseUrl(url: string): boolean {
  const host = hostnameOf(url)?.toLowerCase() ?? "";
  if (!host) return true;
  if (host.includes("brandbridge")) return true;
  if (host.includes("google.") || host.includes("bing.com")) return true;
  if (host.includes("jina.ai")) return true;
  if (url.includes("/login") || url.includes("/signup")) return true;
  return false;
}

export async function runMarketResearchSearches(): Promise<{
  agentReach: AgentReachConnectionStatus;
  searches: Array<{
    query: string;
    source: string;
    error?: string;
    hitCount: number;
  }>;
  signals: MarketSignal[];
}> {
  const agentReach = getAgentReachConnection();
  const searches = await mapPool([...MARKET_RESEARCH_QUERIES], 3, searchPublicWeb);
  const signals: MarketSignal[] = [];
  const seen = new Set<string>();

  for (const search of searches) {
    for (const hit of search.hits) {
      if (isNoiseUrl(hit.url) || seen.has(hit.url)) continue;
      seen.add(hit.url);
      signals.push({
        source: search.source,
        url: hit.url,
        date: null,
        companyPerson: hostnameOf(hit.url),
        signalType: inferSignalType(search.query, hit.url),
        summary: hit.snippet || hit.title,
        relevance: relevanceFromQuery(search.query),
        potentialLead:
          search.query.includes("looking for") &&
          !hit.url.includes("wikipedia.org"),
        contentOpportunity: hit.title || null,
        query: search.query,
      });
    }
  }

  return {
    agentReach,
    searches: searches.map((item) => ({
      query: item.query,
      source: item.source,
      error: item.error,
      hitCount: item.hits.length,
    })),
    signals: signals.slice(0, 40),
  };
}

export async function discoverCompetitorUrls(): Promise<{
  queries: string[];
  urls: Array<{ title: string; url: string; query: string; snippet: string }>;
  errors: string[];
}> {
  const errors: string[] = [];
  const found: Array<{ title: string; url: string; query: string; snippet: string }> =
    [];
  const seen = new Set<string>();
  const searches = await mapPool(
    [...COMPETITOR_DISCOVERY_QUERIES],
    3,
    searchPublicWeb,
  );
  for (const search of searches) {
    if (search.error) errors.push(`${search.query}: ${search.error}`);
    for (const hit of search.hits) {
      if (isNoiseUrl(hit.url) || seen.has(hit.url)) continue;
      seen.add(hit.url);
      found.push({
        title: hit.title,
        url: hit.url,
        query: search.query,
        snippet: hit.snippet,
      });
    }
  }
  return {
    queries: [...COMPETITOR_DISCOVERY_QUERIES],
    urls: found.slice(0, 12),
    errors,
  };
}

export async function searchPublicSocialMentions(): Promise<{
  available: boolean;
  note: string;
  hits: Array<{ query: string; title: string; url: string; snippet: string }>;
}> {
  const connection = getAgentReachConnection();
  if (!connection.webReader) {
    return {
      available: false,
      note: connection.note,
      hits: [],
    };
  }
  const searches = await mapPool([...SOCIAL_PUBLIC_QUERIES], 2, searchPublicWeb);
  const hits: Array<{ query: string; title: string; url: string; snippet: string }> =
    [];
  for (const search of searches) {
    for (const hit of search.hits.slice(0, 3)) {
      hits.push({
        query: search.query,
        title: hit.title,
        url: hit.url,
        snippet: hit.snippet,
      });
    }
  }
  return {
    available: hits.length > 0,
    note:
      hits.length > 0
        ? "公開インデックス経由（ログイン不要）。Cookie チャネルは未使用。"
        : "SNSログインチャネル未接続。公開Web検索でもヒットがありませんでした。",
    hits: hits.slice(0, 15),
  };
}
