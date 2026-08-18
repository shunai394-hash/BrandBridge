import { completeJson } from "@/lib/marketing-agent/ai";
import {
  CONTENT_OPPORTUNITIES_TASK,
  GEO_TASK,
  INTERNAL_LINKS_TASK,
  JA_PARTNER_PR_TASK,
  SITE_ANALYSIS_TASK,
  SOCIAL_TASK,
  systemPrompt,
} from "@/lib/marketing-agent/prompts";
import { asRecord, asString } from "@/lib/marketing-agent/json";
import type {
  AnalyzedPage,
  MarketingPriority,
  MarketingRecommendationCategory,
  SearchConsoleResult,
} from "@/lib/marketing-agent/types";
import { summarizePagesForPrompt } from "@/lib/marketing-agent/seo";

function compactGsc(result: SearchConsoleResult | null) {
  if (!result) {
    return { configured: false, note: "Search Console未接続" };
  }
  const rows = result.rows.slice(0, 80).map((row) => ({
    query: row.query,
    page: row.page,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: Number(row.ctr.toFixed(4)),
    position: Number(row.position.toFixed(1)),
  }));
  return {
    configured: result.configured,
    siteUrl: result.siteUrl,
    startDate: result.startDate,
    endDate: result.endDate,
    error: result.error ?? null,
    rowCount: result.rows.length,
    rows,
  };
}

function asPriority(value: unknown): MarketingPriority {
  if (value === "high" || value === "low" || value === "medium") return value;
  return "medium";
}

function asCategory(value: unknown): MarketingRecommendationCategory {
  const allowed: MarketingRecommendationCategory[] = [
    "seo",
    "keyword",
    "content",
    "geo",
    "internal_link",
    "social",
  "existing_page",
    "competitor",
    "market_signal",
    "differentiation",
  ];
  if (typeof value === "string" && allowed.includes(value as MarketingRecommendationCategory)) {
    return value as MarketingRecommendationCategory;
  }
  return "seo";
}

export function mapRecommendationItems(raw: unknown): Array<{
  category: MarketingRecommendationCategory;
  title: string;
  description: string;
  priority: MarketingPriority;
  data: Record<string, unknown>;
}> {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(asRecord(raw).recommendations)
      ? (asRecord(raw).recommendations as unknown[])
      : [];

  return list
    .map((item) => asRecord(item))
    .filter((item) => asString(item.title).trim())
    .slice(0, 20)
    .map((item) => ({
      category: asCategory(item.category),
      title: asString(item.title).slice(0, 200),
      description: asString(item.description).slice(0, 2000),
      priority: asPriority(item.priority),
      data: item,
    }));
}

export async function analyzeSiteWithAi(input: {
  pages: AnalyzedPage[];
  searchConsole: SearchConsoleResult | null;
  heuristic: Record<string, unknown>;
}): Promise<Record<string, unknown>> {
  return completeJson(
    [
      { role: "system", content: systemPrompt(SITE_ANALYSIS_TASK) },
      {
        role: "user",
        content: JSON.stringify({
          pages: summarizePagesForPrompt(input.pages),
          heuristic: input.heuristic,
          searchConsole: compactGsc(input.searchConsole),
          target:
            "Overseas brands/manufacturers considering Japan market entry; Japanese sales partners as secondary audience.",
        }),
      },
    ],
    { temperature: 0.3, maxTokens: 3500 },
  );
}

export async function discoverOpportunitiesWithAi(input: {
  pages: AnalyzedPage[];
  searchConsole: SearchConsoleResult | null;
  latestSeo?: Record<string, unknown> | null;
  competitorGaps?: Array<{ title: string; gapType: string; description: string | null; priority: string }>;
  marketSignals?: Array<{ query?: string; summary: string; signalType: string }>;
}): Promise<Record<string, unknown>> {
  return completeJson(
    [
      { role: "system", content: systemPrompt(CONTENT_OPPORTUNITIES_TASK) },
      {
        role: "user",
        content: JSON.stringify({
          existingPages: summarizePagesForPrompt(input.pages).map((page) => ({
            path: page.path,
            title: page.title,
            language: page.language,
            pageType: page.pageType,
            issues: page.issues,
          })),
          searchConsole: compactGsc(input.searchConsole),
          latestSeo: input.latestSeo ?? null,
          competitorGaps: input.competitorGaps ?? [],
          marketSignals: input.marketSignals ?? [],
          rankUsing: [
            "search demand",
            "competitor strength",
            "BrandBridge current content",
            "competitor content gaps",
            "BrandBridge relevance",
          ],
          themes: [
            "Japan market entry",
            "Japanese distributors",
            "Japanese retailers",
            "wholesale / MOQ",
            "import into Japan",
            "exclusive distribution",
            "category-specific Japan entry",
          ],
        }),
      },
    ],
    { temperature: 0.45, maxTokens: 3500 },
  );
}

export async function proposeGeoWithAi(input: {
  pages: AnalyzedPage[];
  draftTitle?: string | null;
  draftExcerpt?: string | null;
}): Promise<Record<string, unknown>> {
  return completeJson(
    [
      { role: "system", content: systemPrompt(GEO_TASK) },
      {
        role: "user",
        content: JSON.stringify({
          pages: summarizePagesForPrompt(input.pages),
          draftTitle: input.draftTitle ?? null,
          draftExcerpt: input.draftExcerpt ?? null,
        }),
      },
    ],
    { temperature: 0.35, maxTokens: 3000 },
  );
}

export async function proposeInternalLinksWithAi(input: {
  pages: AnalyzedPage[];
}): Promise<Record<string, unknown>> {
  return completeJson(
    [
      { role: "system", content: systemPrompt(INTERNAL_LINKS_TASK) },
      {
        role: "user",
        content: JSON.stringify({
          catalog: summarizePagesForPrompt(input.pages).map((page) => ({
            path: page.path,
            title: page.title,
            h1: page.h1,
            language: page.language,
            pageType: page.pageType,
            internalLinkCount: page.internalLinkCount,
          })),
        }),
      },
    ],
    { temperature: 0.3, maxTokens: 2500 },
  );
}

export async function generateSocialWithAi(input: {
  title: string;
  canonicalUrl: string;
  siteOrigin: string;
  pagePath: string;
  excerpt: string;
  metaDescription: string | null;
}): Promise<Record<string, unknown>> {
  return completeJson(
    [
      { role: "system", content: systemPrompt(SOCIAL_TASK) },
      {
        role: "user",
        content: JSON.stringify({
          title: input.title,
          canonicalUrl: input.canonicalUrl,
          siteOrigin: input.siteOrigin,
          pagePath: input.pagePath,
          excerpt: input.excerpt,
          metaDescription: input.metaDescription,
          allowedUrls: [input.canonicalUrl],
        }),
      },
    ],
    { temperature: 0.65, maxTokens: 2500 },
  );
}

export async function generateJapanesePartnerPrWithAi(input: {
  title: string;
  canonicalUrl: string;
  siteOrigin: string;
  pagePath: string;
  excerpt: string;
}): Promise<Record<string, unknown>> {
  return completeJson(
    [
      { role: "system", content: systemPrompt(JA_PARTNER_PR_TASK) },
      {
        role: "user",
        content: JSON.stringify({
          title: input.title,
          canonicalUrl: input.canonicalUrl,
          siteOrigin: input.siteOrigin,
          pagePath: input.pagePath,
          excerpt: input.excerpt,
          allowedUrls: [input.canonicalUrl],
          language: "ja",
          audience:
            "日本のEC事業者・卸売業者・小売事業者・バイヤー・海外商品の仕入れに関心がある事業者",
        }),
      },
    ],
    { temperature: 0.65, maxTokens: 8192 },
  );
}

export function parseIdeaRecords(raw: Record<string, unknown>) {
  const list = Array.isArray(raw.ideas) ? raw.ideas : [];
  return list
    .map((item) => asRecord(item))
    .filter((item) => asString(item.title).trim())
    .slice(0, 12)
    .map((item) => ({
      title: asString(item.title).slice(0, 200),
      topic: asString(item.topic) || null,
      targetKeyword: asString(item.targetKeyword || item.target_keyword) || null,
      searchIntent: asString(item.searchIntent || item.search_intent) || null,
      targetAudience:
        asString(item.targetAudience || item.target_audience) ||
        "overseas manufacturers considering Japan market entry",
      contentType: asString(item.contentType || item.content_type) || "article",
      priority: asPriority(item.priority),
      reasoning: asString(item.reasoning) || null,
    }));
}

export function parseInternalLinks(raw: Record<string, unknown>) {
  const list = Array.isArray(raw.links) ? raw.links : [];
  return list
    .map((item) => asRecord(item))
    .filter(
      (item) =>
        asString(item.sourcePath || item.source_path) &&
        asString(item.targetPath || item.target_path),
    )
    .slice(0, 20)
    .map((item) => ({
      sourcePath: asString(item.sourcePath || item.source_path),
      targetPath: asString(item.targetPath || item.target_path),
      anchor: asString(item.anchor),
      reason: asString(item.reason),
      priority: asPriority(item.priority),
    }));
}

export { asString, asRecord };
