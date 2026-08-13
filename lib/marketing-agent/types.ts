export type MarketingRunType =
  | "site_analysis"
  | "search_console"
  | "seo_analysis"
  | "keyword_analysis"
  | "content_opportunities"
  | "article_draft"
  | "geo"
  | "internal_links"
  | "social"
  | "weekly_pipeline"
  | "market_research"
  | "competitor_analysis";

export type MarketingRunStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed";

export type MarketingPriority = "high" | "medium" | "low";

export type MarketingIdeaStatus =
  | "proposed"
  | "accepted"
  | "rejected"
  | "archived";

export type MarketingDraftStatus = "draft" | "accepted" | "rejected";

export type MarketingRecommendationStatus = "open" | "accepted" | "dismissed";

export type MarketingRecommendationCategory =
  | "seo"
  | "keyword"
  | "content"
  | "geo"
  | "internal_link"
  | "social"
  | "existing_page"
  | "competitor"
  | "market_signal"
  | "differentiation";

export type MarketingAgentRun = {
  id: string;
  runType: MarketingRunType;
  status: MarketingRunStatus;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type MarketingContentIdea = {
  id: string;
  title: string;
  topic: string | null;
  targetKeyword: string | null;
  searchIntent: string | null;
  targetAudience: string | null;
  contentType: string | null;
  priority: MarketingPriority;
  reasoning: string | null;
  status: MarketingIdeaStatus;
  createdAt: string;
  updatedAt: string;
};

export type MarketingContentDraft = {
  id: string;
  ideaId: string | null;
  title: string;
  slug: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  content: string;
  language: string;
  seoNotes: string | null;
  geoNotes: string | null;
  status: MarketingDraftStatus;
  createdAt: string;
  updatedAt: string;
};

export type MarketingRecommendation = {
  id: string;
  category: MarketingRecommendationCategory;
  title: string;
  description: string | null;
  priority: MarketingPriority;
  data: Record<string, unknown>;
  status: MarketingRecommendationStatus;
  createdAt: string;
  updatedAt: string;
};

export type SitePageType =
  | "home"
  | "listing"
  | "guide"
  | "register"
  | "pricing"
  | "legal"
  | "company"
  | "showcase"
  | "model_case"
  | "contact"
  | "utility";

export type CatalogPage = {
  path: string;
  language: "ja" | "en";
  pageType: SitePageType;
  seoImportance: "high" | "medium" | "low";
  published: boolean;
  fetchLive: boolean;
  label: string;
};

export type AnalyzedPage = CatalogPage & {
  url: string;
  title: string | null;
  description: string | null;
  h1: string | null;
  h2: string[];
  canonical: string | null;
  robots: string | null;
  internalLinks: string[];
  fetchError?: string;
  issues: string[];
};

export type SearchConsoleRow = {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchConsoleResult = {
  configured: boolean;
  siteUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  rows: SearchConsoleRow[];
  error?: string;
};

export type AiConnectionStatus = {
  configured: boolean;
  model: string | null;
};

export type GscConnectionStatus = {
  configured: boolean;
  siteUrl: string | null;
};

export type AgentReachConnectionStatus = {
  /** Public web reader (Jina) — Agent Reach zero-config channel */
  webReader: boolean;
  /** Local CLI in user home venv; never required in production */
  cliAvailable: boolean;
  note: string;
};

export type MarketingAgentConnections = {
  ai: AiConnectionStatus;
  searchConsole: GscConnectionStatus;
  agentReach: AgentReachConnectionStatus;
};

export type MarketingAgentOverview = {
  connections: MarketingAgentConnections;
  lastAnalysisAt: string | null;
  lastAnalysisStatus: MarketingRunStatus | null;
  opportunityCount: number;
  draftCount: number;
  seoRecommendationCount: number;
  geoRecommendationCount: number;
  competitorCount: number;
  gapCount: number;
  migrationError?: string;
};

export type MarketSignal = {
  source: string;
  url: string;
  date: string | null;
  companyPerson: string | null;
  signalType:
    | "demand"
    | "competitor"
    | "content"
    | "partner_search"
    | "other";
  summary: string;
  relevance: MarketingPriority;
  potentialLead: boolean;
  contentOpportunity: string | null;
  query?: string;
};

export type CompetitorStatus = "candidate" | "reviewed" | "watch" | "dismissed";

export type MarketingCompetitor = {
  id: string;
  companyName: string;
  url: string | null;
  category: string | null;
  targetCustomer: string | null;
  serviceSummary: string | null;
  strengths: string | null;
  weaknesses: string | null;
  seoSummary: string | null;
  socialSummary: string | null;
  sourceData: Record<string, unknown>;
  status: CompetitorStatus;
  createdAt: string;
  updatedAt: string;
};

export type CompetitorGapType =
  | "competitive_gap"
  | "underserved_topic"
  | "underserved_keyword"
  | "content_gap"
  | "keyword_gap"
  | "differentiation"
  | "recommended_action";

export type MarketingCompetitorGap = {
  id: string;
  competitorId: string | null;
  gapType: CompetitorGapType;
  title: string;
  description: string | null;
  priority: MarketingPriority;
  data: Record<string, unknown>;
  status: MarketingRecommendationStatus;
  createdAt: string;
  updatedAt: string;
};
