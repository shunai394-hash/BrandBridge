import { chatCompletion } from "./ai";
import { parseJsonFromAi, asStringArray, textOrNull } from "./json";
import { articlePrompt, opportunitiesPrompt, SYSTEM_MARKETER } from "./prompts";
import { listCatalogPages } from "./site-catalog";
import type {
  ContentOpportunity,
  FaqItem,
  InternalLink,
  MarketingContent,
  Priority,
  SearchConsoleStatus,
  SeoSnapshot,
} from "./types";
import type { MarketingCompetitorGap } from "./types";
import type { MarketSignal } from "./types";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const DEFAULT_AUTHOR =
  "BrandBridge is a B2B matching platform that connects overseas brands entering Japan with Japanese distributors, retailers, importers, and wholesale partners. We do not replace your commercial negotiation; we structure the first discussion.";

function fallbackOpportunities(params: {
  gaps: MarketingCompetitorGap[];
  signals: MarketSignal[];
  pages: { path: string; title: string; keyword?: string }[];
  gsc: SearchConsoleStatus;
}): Omit<ContentOpportunity, "id" | "createdAt" | "updatedAt">[] {
  const ideas: Omit<ContentOpportunity, "id" | "createdAt" | "updatedAt">[] = [];
  const existing = new Set(
    params.pages.map((p) => (p.keyword || p.title).toLowerCase()),
  );

  const fromGaps = params.gaps.slice(0, 4).map((gap) => ({
    title: gap.title,
    topic: gap.topic,
    keyword: gap.keyword,
    searchIntent: "informational",
    targetAudience: "Overseas brand founders entering Japan",
    targetCountry: "global",
    language: "en",
    platform: "brandbridge_blog",
    priority: gap.priority,
    reason: gap.detail || "Competitor / content gap",
    source: "competitor_analysis",
    sourceUrl: null,
    status: "idea" as const,
    competitorGapId: gap.id,
    metadata: { gapType: gap.gapType },
  }));
  ideas.push(...fromGaps);

  for (const signal of params.signals.slice(0, 4)) {
    ideas.push({
      title: signal.contentOpportunity || signal.summary.slice(0, 80),
      topic: signal.signalType,
      keyword: "Japan market entry",
      searchIntent: "commercial",
      targetAudience: "Overseas brands seeking Japanese partners",
      targetCountry: signal.country || "global",
      language: signal.language || "en",
      platform: "brandbridge_blog",
      priority: signal.relevance === "high" ? "high" : "medium",
      reason: signal.summary.slice(0, 280),
      source: "agent_reach",
      sourceUrl: signal.url,
      status: "idea",
      competitorGapId: null,
      metadata: {},
    });
  }

  if (params.gsc.rows) {
    for (const row of params.gsc.rows.slice(0, 3)) {
      const keyword = row.keys[0] || "";
      if (!keyword || existing.has(keyword.toLowerCase())) continue;
      ideas.push({
        title: `Practical guide: ${keyword}`,
        topic: keyword,
        keyword,
        searchIntent: "informational",
        targetAudience: "Overseas brands",
        targetCountry: row.keys[1] || "global",
        language: "en",
        platform: "brandbridge_blog",
        priority: row.impressions > 50 ? "high" : "medium",
        reason: `Search Console: ${row.impressions} impressions, ${row.clicks} clicks, position ${row.position.toFixed(1)}`,
        source: "search_console",
        sourceUrl: null,
        status: "idea",
        competitorGapId: null,
        metadata: { impressions: row.impressions, clicks: row.clicks },
      });
    }
  }

  const missing = [
    {
      title: "Japan wholesale terms overseas brands should prepare before outreach",
      keyword: "Japan wholesale",
    },
    {
      title: "How to import branded goods to Japan without a local office",
      keyword: "import to Japan",
    },
    {
      title: "What Japanese retailers look for in a first brand meeting",
      keyword: "Japanese retailer",
    },
  ];
  for (const item of missing) {
    if (existing.has(item.keyword.toLowerCase())) continue;
    ideas.push({
      title: item.title,
      topic: item.keyword,
      keyword: item.keyword,
      searchIntent: "informational",
      targetAudience: "Overseas brand operators",
      targetCountry: "global",
      language: "en",
      platform: "brandbridge_blog",
      priority: "medium",
      reason: "Content gap vs existing BrandBridge guides",
      source: "existing_pages",
      sourceUrl: null,
      status: "idea",
      competitorGapId: null,
      metadata: {},
    });
  }

  return ideas.slice(0, 10);
}

export async function generateOpportunities(params: {
  gaps: MarketingCompetitorGap[];
  signals: MarketSignal[];
  snapshots: SeoSnapshot[];
  gsc: SearchConsoleStatus;
}): Promise<Omit<ContentOpportunity, "id" | "createdAt" | "updatedAt">[]> {
  const pages = listCatalogPages();
  const context = JSON.stringify(
    {
      existingPages: pages.map((p) => ({
        path: p.path,
        title: p.title,
        keyword: p.keyword,
      })),
      seo: params.snapshots.map((s) => ({
        path: s.path,
        title: s.title,
        h1: s.h1,
        meta: s.metaDescription,
      })),
      gaps: params.gaps.slice(0, 12),
      signals: params.signals.slice(0, 12),
      searchConsole: params.gsc.connected ? params.gsc.rows : "not_connected",
    },
    null,
    2,
  ).slice(0, 12000);

  const ai = await chatCompletion(
    [
      { role: "system", content: SYSTEM_MARKETER },
      { role: "user", content: opportunitiesPrompt(context) },
    ],
    { temperature: 0.3, maxTokens: 2500 },
  );

  if (ai.ok) {
    const parsed = parseJsonFromAi<{
      opportunities?: Record<string, unknown>[];
    }>(ai.text);
    const list = parsed?.opportunities;
    if (Array.isArray(list) && list.length > 0) {
      return list.slice(0, 10).map((item) => ({
        title: String(item.title || "Untitled opportunity"),
        topic: textOrNull(item.topic),
        keyword: textOrNull(item.keyword),
        searchIntent: textOrNull(item.searchIntent),
        targetAudience: textOrNull(item.targetAudience),
        targetCountry: textOrNull(item.targetCountry) || "global",
        language: String(item.language || "en"),
        platform: String(item.platform || "brandbridge_blog"),
        priority: (["high", "medium", "low"].includes(String(item.priority))
          ? item.priority
          : "medium") as Priority,
        reason: textOrNull(item.reason),
        source: textOrNull(item.source) || "content_opportunity_engine",
        sourceUrl: textOrNull(item.sourceUrl),
        status: "idea",
        competitorGapId: null,
        metadata: {},
      }));
    }
  }

  return fallbackOpportunities({
    gaps: params.gaps,
    signals: params.signals,
    pages,
    gsc: params.gsc,
  });
}

function fallbackArticle(opportunity: ContentOpportunity): Omit<
  MarketingContent,
  "id" | "createdAt" | "updatedAt"
> {
  const keyword = opportunity.keyword || opportunity.topic || "Japan market entry";
  const title = opportunity.title;
  const slug = slugify(title);
  const definition = `${keyword} means the practical process overseas brands use to find Japanese distributors, retailers, importers, or wholesale partners and start a commercial discussion. BrandBridge is a matching platform that structures that first conversation.`;
  const h2 = [
    `What is ${keyword}?`,
    "What do Japanese partners usually need before a first meeting?",
    "How can an overseas brand prepare wholesale terms?",
    "Where BrandBridge helps — and where it does not",
    "Frequently asked questions",
  ];
  const faq: FaqItem[] = [
    {
      question: `What is ${keyword}?`,
      answer: definition,
    },
    {
      question: "Does BrandBridge sell products on behalf of brands?",
      answer:
        "No. BrandBridge matches overseas brands with Japanese sales partners and supports structured negotiation. Commercial terms remain between the parties.",
    },
    {
      question: "Who should register first?",
      answer:
        "Overseas brands register as product companies. Japanese distributors, retailers, importers, and wholesalers register as sales partners.",
    },
  ];
  const internalLinks: InternalLink[] = [
    {
      path: "/en/japan-market-entry",
      anchor: "Japan market entry hub",
      reason: "Parent guide",
    },
    {
      path: "/en/register/maker",
      anchor: "Register your brand",
      reason: "Primary CTA",
    },
  ];
  const body = [
    `# ${title}`,
    "",
    "## Definition",
    definition,
    "",
    `## What is ${keyword}?`,
    `Overseas brands searching for ${keyword} usually need a Japanese partner who can discuss MOQ, wholesale price, exclusivity, and logistics — not only a directory listing.`,
    "",
    "## What do Japanese partners usually need before a first meeting?",
    "A clear product summary, target channel, and workable first-lot terms reduce wasted outreach.",
    "",
    "## How can an overseas brand prepare wholesale terms?",
    "Prepare MOQ, Incoterms, sample policy, and whether exclusivity is on the table before requesting introductions.",
    "",
    "## Where BrandBridge helps — and where it does not",
    "BrandBridge helps qualified brands and partners start a structured discussion. It does not replace import licenses, regulatory filings, or the commercial contract itself.",
    "",
    "## Call to action",
    opportunity.targetAudience?.includes("partner")
      ? "Japanese partners can register at /en/register/partner."
      : "Overseas brands can register at /en/register/maker.",
  ].join("\n");

  return {
    opportunityId: opportunity.id,
    title,
    metaTitle: `${title} | BrandBridge`.slice(0, 60),
    metaDescription: definition.slice(0, 155),
    slug,
    h1: title,
    h2,
    body,
    targetKeyword: keyword,
    searchIntent: opportunity.searchIntent,
    targetCountry: opportunity.targetCountry,
    targetAudience: opportunity.targetAudience,
    internalLinks,
    cta: "Register on BrandBridge to start a structured Japan-market discussion.",
    faq,
    language: opportunity.language || "en",
    definition,
    authorOrgInfo: DEFAULT_AUTHOR,
    citations: [
      {
        title: "BrandBridge Japan market entry hub",
        url: "https://brandbridge.jp/en/japan-market-entry",
      },
    ],
    status: "draft",
    publishedPath: null,
    createdBy: null,
  };
}

export async function generateArticleDraft(
  opportunity: ContentOpportunity,
  extraContext?: string,
): Promise<Omit<MarketingContent, "id" | "createdAt" | "updatedAt">> {
  const pages = listCatalogPages()
    .map((p) => `${p.path} — ${p.title}`)
    .join("\n");
  const context = [
    `Opportunity: ${JSON.stringify(opportunity)}`,
    `Existing BrandBridge pages (do not overwrite):\n${pages}`,
    extraContext ?? "",
  ].join("\n\n");

  const ai = await chatCompletion(
    [
      { role: "system", content: SYSTEM_MARKETER },
      { role: "user", content: articlePrompt(context) },
    ],
    { temperature: 0.45, maxTokens: 4000 },
  );

  if (ai.ok) {
    const parsed = parseJsonFromAi<Record<string, unknown>>(ai.text);
    if (parsed && parsed.title && parsed.body) {
      const faqRaw = Array.isArray(parsed.faq) ? parsed.faq : [];
      const linksRaw = Array.isArray(parsed.internalLinks)
        ? parsed.internalLinks
        : [];
      const citesRaw = Array.isArray(parsed.citations) ? parsed.citations : [];
      return {
        opportunityId: opportunity.id,
        title: String(parsed.title),
        metaTitle: textOrNull(parsed.metaTitle),
        metaDescription: textOrNull(parsed.metaDescription),
        slug: textOrNull(parsed.slug) || slugify(String(parsed.title)),
        h1: textOrNull(parsed.h1) || String(parsed.title),
        h2: asStringArray(parsed.h2),
        body: String(parsed.body),
        targetKeyword: textOrNull(parsed.targetKeyword) || opportunity.keyword,
        searchIntent: textOrNull(parsed.searchIntent) || opportunity.searchIntent,
        targetCountry:
          textOrNull(parsed.targetCountry) || opportunity.targetCountry,
        targetAudience:
          textOrNull(parsed.targetAudience) || opportunity.targetAudience,
        internalLinks: linksRaw
          .map((item) => {
            const rec = item as Record<string, unknown>;
            return {
              path: String(rec.path ?? ""),
              anchor: String(rec.anchor ?? ""),
              reason: textOrNull(rec.reason) ?? undefined,
            };
          })
          .filter((item) => item.path && item.anchor),
        cta: textOrNull(parsed.cta),
        faq: faqRaw
          .map((item) => {
            const rec = item as Record<string, unknown>;
            return {
              question: String(rec.question ?? ""),
              answer: String(rec.answer ?? ""),
            };
          })
          .filter((item) => item.question && item.answer),
        language: String(parsed.language || opportunity.language || "en"),
        definition: textOrNull(parsed.definition),
        authorOrgInfo: textOrNull(parsed.authorOrgInfo) || DEFAULT_AUTHOR,
        citations: citesRaw
          .map((item) => {
            const rec = item as Record<string, unknown>;
            return {
              title: String(rec.title ?? ""),
              url: String(rec.url ?? ""),
            };
          })
          .filter((item) => item.title && item.url),
        status: "draft",
        publishedPath: null,
        createdBy: null,
      };
    }
  }

  return fallbackArticle(opportunity);
}
