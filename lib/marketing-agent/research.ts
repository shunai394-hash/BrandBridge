import { parseJsonFromAi } from "./json";
import { CORE_TOPICS } from "./site-catalog";
import type { AgentReachStatus, MarketSignal, PlatformTarget } from "./types";

/**
 * Public-web research adapter.
 * Uses Jina Reader (r.jina.ai / s.jina.ai) — no cookies, no login, no scraping-to-post.
 * Optional AGENT_REACH_BIN is never used to store credentials.
 */

const MARKET_RESEARCH_QUERIES = [
  "looking for Japanese distributor",
  "Japan market entry overseas brand",
  "find Japanese retailer for imported brand",
  "Japan wholesale partner for foreign brand",
  "sell in Japan distributor wanted",
  "import to Japan food cosmetics brand",
];

const COMPETITOR_DISCOVERY_QUERIES = [
  "Japan market entry platform for overseas brands",
  "find Japanese distributors for foreign brands",
  "B2B matching Japan importer overseas brand",
];

const PLATFORM_DISCOVERY_QUERIES = [
  "Reddit Japan market entry overseas brand",
  "LinkedIn Japan distributor search discussion",
  "YouTube how to enter Japanese market brand",
];

export function getAgentReachConnection(): AgentReachStatus {
  if (process.env.AGENT_REACH_DISABLED === "true") {
    return {
      connected: false,
      mode: "disabled",
      message: "AgentReach は無効化されています（AGENT_REACH_DISABLED=true）。",
    };
  }
  return {
    connected: true,
    mode: "jina",
    message:
      "公開情報リサーチは Jina Reader 経由です。Cookie ログインや非公式投稿は使いません。",
  };
}

async function jinaSearch(query: string): Promise<{ title: string; url: string; snippet: string }[]> {
  if (process.env.AGENT_REACH_DISABLED === "true") return [];
  try {
    const res = await fetch(
      `https://s.jina.ai/${encodeURIComponent(query)}`,
      {
        headers: {
          Accept: "application/json",
          "X-Retain-Images": "none",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      },
    );
    if (!res.ok) return [];
    const text = await res.text();
    const parsed = parseJsonFromAi<{
      data?: { title?: string; url?: string; content?: string; description?: string }[];
    }>(text);
    const rows = parsed?.data;
    if (Array.isArray(rows) && rows.length > 0) {
      return rows.slice(0, 6).map((row) => ({
        title: row.title || query,
        url: row.url || "",
        snippet: (row.description || row.content || "").slice(0, 400),
      }));
    }
    // Fallback: treat as markdown list
    return text
      .split("\n")
      .map((line) => {
        const m = line.match(/\[([^\]]+)\]\((https?:[^)]+)\)/);
        if (!m) return null;
        return { title: m[1], url: m[2], snippet: line.slice(0, 240) };
      })
      .filter((item): item is { title: string; url: string; snippet: string } =>
        Boolean(item),
      )
      .slice(0, 6);
  } catch {
    return [];
  }
}

export async function readPublicPage(url: string): Promise<string> {
  if (!url.startsWith("https://") && !url.startsWith("http://")) return "";
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { "X-Retain-Images": "none" },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return "";
    const text = await res.text();
    return text.slice(0, 6000);
  } catch {
    return "";
  }
}

function inferCountry(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(australia|australian)\b/.test(lower)) return "AU";
  if (/\b(united states|usa|american)\b/.test(lower)) return "US";
  if (/\b(united kingdom|uk|british)\b/.test(lower)) return "GB";
  if (/\b(singapore)\b/.test(lower)) return "SG";
  if (/\b(korea|korean)\b/.test(lower)) return "KR";
  if (/\b(taiwan)\b/.test(lower)) return "TW";
  if (/\b(france|french)\b/.test(lower)) return "FR";
  if (/\b(germany|german)\b/.test(lower)) return "DE";
  if (/\b(canada|canadian)\b/.test(lower)) return "CA";
  return "global";
}

function toSignal(
  query: string,
  item: { title: string; url: string; snippet: string },
): MarketSignal {
  const blob = `${item.title} ${item.snippet}`;
  return {
    source: "public_web",
    url: item.url,
    date: new Date().toISOString().slice(0, 10),
    companyPerson: item.title.slice(0, 120),
    signalType: "market_discussion",
    summary: item.snippet || item.title,
    relevance: CORE_TOPICS.some((t) =>
      blob.toLowerCase().includes(t.toLowerCase()),
    )
      ? "high"
      : "medium",
    potentialLead: /distributor|partner|importer|retailer/i.test(blob),
    contentOpportunity: `Explain ${query} from BrandBridge's matching-platform angle`,
    country: inferCountry(blob),
    language: "en",
  };
}

export async function runMarketResearchSearches(): Promise<MarketSignal[]> {
  const out: MarketSignal[] = [];
  for (const query of MARKET_RESEARCH_QUERIES) {
    const rows = await jinaSearch(query);
    for (const row of rows) {
      if (row.url) out.push(toSignal(query, row));
    }
  }
  return dedupeByUrl(out);
}

export async function discoverCompetitorUrls(): Promise<
  { name: string; url: string; snippet: string }[]
> {
  const out: { name: string; url: string; snippet: string }[] = [];
  for (const query of COMPETITOR_DISCOVERY_QUERIES) {
    const rows = await jinaSearch(query);
    for (const row of rows) {
      if (!row.url) continue;
      if (/brandbridge/i.test(row.url)) continue;
      out.push({ name: row.title, url: row.url, snippet: row.snippet });
    }
  }
  const seen = new Set<string>();
  return out.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  }).slice(0, 8);
}

export async function searchPublicSocialMentions(): Promise<MarketSignal[]> {
  const rows = await jinaSearch("BrandBridge Japan market entry overseas brand");
  return rows
    .filter((row) => row.url)
    .map((row) => toSignal("BrandBridge mentions", row));
}

export async function discoverPlatformTargets(): Promise<
  Omit<PlatformTarget, "id" | "createdAt" | "updatedAt">[]
> {
  const out: Omit<PlatformTarget, "id" | "createdAt" | "updatedAt">[] = [];
  for (const query of PLATFORM_DISCOVERY_QUERIES) {
    const rows = await jinaSearch(query);
    for (const row of rows) {
      const platform = inferPlatform(row.url);
      const doNotPromote = shouldNotPromote(row.url, row.snippet);
      out.push({
        platform,
        url: row.url,
        country: inferCountry(`${row.title} ${row.snippet}`),
        language: "en",
        topic: query,
        relevance: doNotPromote ? "low" : "medium",
        recommendedAction: doNotPromote
          ? "do_not_promote"
          : "observe_then_contribute_if_relevant",
        reason: doNotPromote
          ? "宣伝向きではない（規約・スパムリスク・無関係コミュニティ）"
          : row.snippet.slice(0, 280) || row.title,
        doNotPromote,
      });
    }
  }
  return out.slice(0, 20);
}

function inferPlatform(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("reddit.com")) return "reddit";
    if (host.includes("linkedin.com")) return "linkedin";
    if (host.includes("x.com") || host.includes("twitter.com")) return "x";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("medium.com")) return "medium";
    if (host.includes("substack.com")) return "substack";
    return "blog";
  } catch {
    return "web";
  }
}

function shouldNotPromote(url: string, snippet: string): boolean {
  const text = `${url} ${snippet}`.toLowerCase();
  return (
    /hiring only|job board|spam|buy followers|crypto pump|adult/.test(text) ||
    /\/r\/(jobs|forhire|spam)/i.test(url)
  );
}

function dedupeByUrl(items: MarketSignal[]): MarketSignal[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

export { MARKET_RESEARCH_QUERIES, COMPETITOR_DISCOVERY_QUERIES };
