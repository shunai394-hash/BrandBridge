import { chatCompletion } from "./ai";
import { parseJsonFromAi, asStringArray, textOrNull } from "./json";
import { competitorPrompt, SYSTEM_MARKETER } from "./prompts";
import { discoverCompetitorUrls, readPublicPage } from "./research";
import type { GapType, Priority } from "./types";

export type AnalyzedCompetitor = {
  name: string;
  url: string | null;
  country: string | null;
  language: string | null;
  summary: string | null;
  positioning: string | null;
  strengths: string[];
  weaknesses: string[];
  contentTopics: string[];
  keywords: string[];
  source: string;
  sourceUrl: string | null;
};

export type AnalyzedGap = {
  competitorId?: string | null;
  gapType: GapType;
  title: string;
  detail: string | null;
  keyword: string | null;
  topic: string | null;
  priority: Priority;
};

const GAP_TYPES: GapType[] = [
  "competitive_gap",
  "underserved_topic",
  "underserved_keyword",
  "content_gap",
  "keyword_gap",
  "differentiation",
  "recommended_action",
];

export async function analyzeCompetitors(): Promise<{
  competitors: AnalyzedCompetitor[];
  gaps: AnalyzedGap[];
}> {
  const discovered = await discoverCompetitorUrls();
  const snippets: { name: string; url: string; snippet: string }[] = [];
  for (const item of discovered.slice(0, 5)) {
    const page = await readPublicPage(item.url);
    snippets.push({
      name: item.name,
      url: item.url,
      snippet: (page || item.snippet).slice(0, 1800),
    });
  }

  const ai = await chatCompletion(
    [
      { role: "system", content: SYSTEM_MARKETER },
      {
        role: "user",
        content: competitorPrompt(JSON.stringify(snippets).slice(0, 10000)),
      },
    ],
    { temperature: 0.2, maxTokens: 2500 },
  );

  if (ai.ok) {
    const parsed = parseJsonFromAi<{
      competitors?: Record<string, unknown>[];
      gaps?: Record<string, unknown>[];
    }>(ai.text);
    if (parsed?.competitors?.length) {
      return {
        competitors: parsed.competitors.map((item, idx) => ({
          name: String(item.name || snippets[idx]?.name || "Unknown"),
          url: textOrNull(item.url) || snippets[idx]?.url || null,
          country: textOrNull(item.country),
          language: textOrNull(item.language) || "en",
          summary: textOrNull(item.summary),
          positioning: textOrNull(item.positioning),
          strengths: asStringArray(item.strengths),
          weaknesses: asStringArray(item.weaknesses),
          contentTopics: asStringArray(item.contentTopics),
          keywords: asStringArray(item.keywords),
          source: "public_web",
          sourceUrl: textOrNull(item.url) || snippets[idx]?.url || null,
        })),
        gaps: (parsed.gaps ?? []).map((item) => ({
          gapType: GAP_TYPES.includes(item.gapType as GapType)
            ? (item.gapType as GapType)
            : "content_gap",
          title: String(item.title || "Gap"),
          detail: textOrNull(item.detail),
          keyword: textOrNull(item.keyword),
          topic: textOrNull(item.topic),
          priority: (["high", "medium", "low"].includes(String(item.priority))
            ? item.priority
            : "medium") as Priority,
        })),
      };
    }
  }

  const competitors: AnalyzedCompetitor[] = snippets.map((item) => ({
    name: item.name.slice(0, 120),
    url: item.url,
    country: "global",
    language: "en",
    summary: item.snippet.slice(0, 400),
    positioning: "Public Japan-entry / distributor-matching adjacent service",
    strengths: ["Visible on public search for Japan market entry queries"],
    weaknesses: ["May not structure MOQ / wholesale / exclusivity before intro"],
    contentTopics: ["Japan market entry", "distributor search"],
    keywords: ["Japanese distributor", "Japan market entry"],
    source: "public_web",
    sourceUrl: item.url,
  }));

  const gaps: AnalyzedGap[] = [
    {
      gapType: "differentiation",
      title: "Structured commercial terms before introduction",
      detail:
        "BrandBridge can emphasize MOQ, wholesale price, exclusivity, and logistics as discussion-ready fields — not a directory dump.",
      keyword: "Japan wholesale",
      topic: "deal-ready matching",
      priority: "high",
    },
    {
      gapType: "content_gap",
      title: "English GEO guide: what a Japanese distributor actually needs",
      detail: "Question-form headings + FAQ for AI search engines.",
      keyword: "Japanese distributor",
      topic: "distributor briefing",
      priority: "high",
    },
    {
      gapType: "underserved_keyword",
      title: "import to Japan without a local entity",
      detail: "Practical explanation of partner-led import vs opening an office.",
      keyword: "import to Japan",
      topic: "market entry models",
      priority: "medium",
    },
  ];

  return { competitors, gaps };
}
