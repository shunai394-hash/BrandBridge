import { completeJson } from "@/lib/marketing-agent/ai";
import { systemPrompt } from "@/lib/marketing-agent/prompts";
import { asRecord, asString } from "@/lib/marketing-agent/json";
import { extractPageSignals } from "@/lib/marketing-agent/seo";
import { getSiteUrl } from "@/lib/site";
import { readPublicPage } from "@/lib/marketing-agent/research";
import type {
  CompetitorGapType,
  MarketingPriority,
  MarketSignal,
} from "@/lib/marketing-agent/types";

export const COMPETITOR_ANALYSIS_TASK = `
Analyze public competitor pages vs BrandBridge.
BrandBridge: B2B matching for overseas brands entering Japan with Japanese distributors/retailers/wholesalers. Listings include MOQ, wholesale range, exclusivity, shipping. No goods payment.

Rules:
- Use only provided public evidence. If a field is not visible, set it to null. Do not invent pricing, traction, or features.
- Do not copy competitor articles. Summarize.
- Identify where BrandBridge can win by being more specific (Japanese distributor / retailer / wholesaler search for overseas brands).

Return JSON:
{
  "competitors": [
    {
      "companyName": "",
      "url": "",
      "category": "",
      "targetCustomer": "",
      "targetCountry": "",
      "targetCategory": "",
      "pricingInformation": null,
      "cta": null,
      "registrationFlow": null,
      "keySellingPoints": [],
      "strengths": "",
      "weaknesses": "",
      "seo": {
        "title": null,
        "metaDescription": null,
        "h1": null,
        "h2": [],
        "majorTopics": [],
        "faqPresent": false,
        "inferredKeywords": []
      },
      "contentThemesFrequent": [],
      "contentThemesMissing": [],
      "socialSummary": null
    }
  ],
  "gaps": [
    {
      "gapType": "competitive_gap"|"underserved_topic"|"underserved_keyword"|"content_gap"|"keyword_gap"|"differentiation"|"recommended_action",
      "title": "",
      "description": "",
      "priority": "high"|"medium"|"low",
      "competitorUrl": null,
      "recommendedContent": "",
      "recommendedCta": "",
      "underservedKeyword": null
    }
  ],
  "contentIdeas": [
    {
      "title": "",
      "targetKeyword": "",
      "priority": "high"|"medium"|"low",
      "reasoning": "Rank using search demand + competitor strength + BrandBridge coverage + competitor content gaps + BrandBridge fit."
    }
  ]
}
`.trim();

type PublicPageSnapshot = {
  url: string;
  title: string | null;
  description: string | null;
  h1: string | null;
  h2: string[];
  excerpt: string;
  fetchError?: string;
  via: string;
};

function excerptFromMarkdown(markdown: string): string {
  return markdown.replace(/\s+/g, " ").trim().slice(0, 900);
}

export async function snapshotPublicCompetitorPage(
  url: string,
): Promise<PublicPageSnapshot> {
  const origin = (() => {
    try {
      return new URL(url).origin;
    } catch {
      return getSiteUrl();
    }
  })();
  const page = await readPublicPage(url);
  if (!page.markdown) {
    return {
      url,
      title: null,
      description: null,
      h1: null,
      h2: [],
      excerpt: "",
      fetchError: page.error ?? "empty",
      via: page.via,
    };
  }
  const looksHtml = /<html|<title|<h1/i.test(page.markdown);
  const signals = looksHtml
    ? extractPageSignals(page.markdown, origin)
    : {
        title: page.markdown.split("\n").find((line) => line.trim())?.slice(0, 120) ?? null,
        description: null,
        h1: null,
        h2: [],
        canonical: null,
        robots: null,
        internalLinks: [],
      };
  return {
    url,
    title: signals.title,
    description: signals.description,
    h1: signals.h1,
    h2: signals.h2.slice(0, 10),
    excerpt: excerptFromMarkdown(page.markdown),
    via: page.via,
  };
}

function asPriority(value: unknown): MarketingPriority {
  if (value === "high" || value === "medium" || value === "low") return value;
  return "medium";
}

const GAP_TYPES: CompetitorGapType[] = [
  "competitive_gap",
  "underserved_topic",
  "underserved_keyword",
  "content_gap",
  "keyword_gap",
  "differentiation",
  "recommended_action",
];

function asGapType(value: unknown): CompetitorGapType {
  if (typeof value === "string" && GAP_TYPES.includes(value as CompetitorGapType)) {
    return value as CompetitorGapType;
  }
  return "competitive_gap";
}

export async function analyzeCompetitorsWithAi(input: {
  snapshots: PublicPageSnapshot[];
  socialHits: Array<{ query: string; title: string; url: string; snippet: string }>;
  socialNote: string;
  brandBridgePages: Array<{ path: string; title: string | null }>;
  marketSignals: MarketSignal[];
}): Promise<Record<string, unknown>> {
  return completeJson(
    [
      { role: "system", content: systemPrompt(COMPETITOR_ANALYSIS_TASK) },
      {
        role: "user",
        content: JSON.stringify({
          brandBridge: {
            site: getSiteUrl(),
            pages: input.brandBridgePages,
            positioning:
              "Overseas brands finding Japanese distributors, retailers, wholesalers, importers, e-commerce partners with commercial terms.",
          },
          publicCompetitorPages: input.snapshots,
          publicSocialIndex: {
            note: input.socialNote,
            hits: input.socialHits,
          },
          marketSignals: input.marketSignals.slice(0, 20).map((item) => ({
            url: item.url,
            query: item.query,
            summary: item.summary,
            signalType: item.signalType,
            potentialLead: item.potentialLead,
          })),
        }),
      },
    ],
    { temperature: 0.35, maxTokens: 4500, timeoutMs: 70_000 },
  );
}

export function parseCompetitorRecords(raw: Record<string, unknown>) {
  const list = Array.isArray(raw.competitors) ? raw.competitors : [];
  return list
    .map((item) => asRecord(item))
    .filter((item) => asString(item.companyName || item.company_name).trim())
    .slice(0, 10)
    .map((item) => {
      const seo = asRecord(item.seo);
      const name = asString(item.companyName || item.company_name).slice(0, 160);
      const url = asString(item.url) || null;
      return {
        companyName: name,
        url,
        category: asString(item.category) || null,
        targetCustomer: asString(item.targetCustomer || item.target_customer) || null,
        serviceSummary:
          asString(item.serviceSummary) ||
          (Array.isArray(item.keySellingPoints)
            ? (item.keySellingPoints as unknown[])
                .map((point) => String(point))
                .filter(Boolean)
                .slice(0, 6)
                .join("; ") || null
            : null),
        strengths: asString(item.strengths) || null,
        weaknesses: asString(item.weaknesses) || null,
        seoSummary: [
          seo.title ? `title: ${asString(seo.title)}` : "",
          seo.h1 ? `h1: ${asString(seo.h1)}` : "",
          Array.isArray(seo.inferredKeywords)
            ? `keywords: ${(seo.inferredKeywords as unknown[]).slice(0, 8).join(", ")}`
            : "",
        ]
          .filter(Boolean)
          .join(" · ") || null,
        socialSummary: asString(item.socialSummary) || null,
        sourceData: {
          evidenceOnly: true,
          copiedContent: false,
          pricingInformation: item.pricingInformation ?? null,
          cta: item.cta ?? null,
          registrationFlow: item.registrationFlow ?? null,
          seo,
          contentThemesFrequent: item.contentThemesFrequent ?? null,
          contentThemesMissing: item.contentThemesMissing ?? null,
        } as Record<string, unknown>,
      };
    });
}

export function parseGapRecords(raw: Record<string, unknown>) {
  const list = Array.isArray(raw.gaps) ? raw.gaps : [];
  return list
    .map((item) => asRecord(item))
    .filter((item) => asString(item.title).trim())
    .slice(0, 20)
    .map((item) => ({
      gapType: asGapType(item.gapType || item.gap_type),
      title: asString(item.title).slice(0, 200),
      description: asString(item.description) || null,
      priority: asPriority(item.priority),
      competitorUrl: asString(item.competitorUrl) || null,
      data: {
        recommendedContent: asString(item.recommendedContent) || null,
        recommendedCta: asString(item.recommendedCta) || null,
        underservedKeyword: asString(item.underservedKeyword) || null,
      } as Record<string, unknown>,
    }));
}

export function parseCompetitorIdeaRecords(raw: Record<string, unknown>) {
  const list = Array.isArray(raw.contentIdeas) ? raw.contentIdeas : [];
  return list
    .map((item) => asRecord(item))
    .filter((item) => asString(item.title).trim())
    .slice(0, 8)
    .map((item) => ({
      title: asString(item.title).slice(0, 200),
      topic: "competitor-informed",
      targetKeyword: asString(item.targetKeyword) || null,
      searchIntent: "informational",
      targetAudience: "overseas manufacturers considering Japan market entry",
      contentType: "article",
      priority: asPriority(item.priority),
      reasoning: asString(item.reasoning) || null,
    }));
}

