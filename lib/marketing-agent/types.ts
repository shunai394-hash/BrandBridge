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
  | "competitor_analysis"
  | "platform_discovery"
  | "brand_authority"
  | "performance_analysis"
  | "global_growth"
  | "repurpose"
  | "scaling";

export type MarketingRunStatus = "running" | "completed" | "failed";

export type RecommendationCategory =
  | "seo"
  | "keyword"
  | "content"
  | "geo"
  | "internal_link"
  | "social"
  | "existing_page"
  | "competitor"
  | "market_signal"
  | "differentiation"
  | "growth"
  | "performance"
  | "scaling"
  | "brand_authority";

export type Priority = "high" | "medium" | "low";

export type OpportunityStatus =
  | "idea"
  | "planned"
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "archived";

export type ContentStatus =
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "archived";

export type SocialPlatform =
  | "brandbridge_blog"
  | "medium"
  | "substack"
  | "linkedin"
  | "x"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "reddit";

export type AccountPlatform = SocialPlatform;

export type PostStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "published"
  | "failed"
  | "manual_publish_required";

export type CalendarStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "published"
  | "failed";

export type PublishMode = "official_api" | "manual";

export type GapType =
  | "competitive_gap"
  | "underserved_topic"
  | "underserved_keyword"
  | "content_gap"
  | "keyword_gap"
  | "differentiation"
  | "recommended_action";

export type MentionType =
  | "mention"
  | "backlink"
  | "referral"
  | "social"
  | "branded_search"
  | "registration";

export type CatalogPage = {
  path: string;
  title: string;
  language: "ja" | "en";
  kind: "guide" | "hub" | "product" | "model_case" | "utility";
  keyword?: string;
};

export type SeoSnapshot = {
  path: string;
  url: string;
  ok: boolean;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  h2: string[];
  canonical: string | null;
  robots: string | null;
  internalLinks: string[];
  error?: string;
};

export type SearchConsoleStatus = {
  connected: boolean;
  message: string;
  rows?: {
    keys: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
};

export type AgentReachStatus = {
  connected: boolean;
  mode: "jina" | "disabled" | "unavailable";
  message: string;
};

export type MarketSignal = {
  source: string;
  url: string;
  date: string;
  companyPerson: string;
  signalType: string;
  summary: string;
  relevance: string;
  potentialLead: boolean;
  contentOpportunity: string;
  country?: string;
  language?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type InternalLink = {
  path: string;
  anchor: string;
  reason?: string;
};

export type Citation = {
  title: string;
  url: string;
};

export type MarketingAgentRun = {
  id: string;
  runType: MarketingRunType;
  status: MarketingRunStatus;
  summary: string | null;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
  createdBy: string | null;
  createdAt: string;
};

export type MarketingRecommendation = {
  id: string;
  runId: string | null;
  category: RecommendationCategory;
  title: string;
  body: string;
  priority: Priority;
  status: "open" | "accepted" | "dismissed";
  relatedUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type MarketingCompetitor = {
  id: string;
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
  source: string | null;
  sourceUrl: string | null;
  lastAnalyzedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarketingCompetitorGap = {
  id: string;
  competitorId: string | null;
  gapType: GapType;
  title: string;
  detail: string | null;
  keyword: string | null;
  topic: string | null;
  priority: Priority;
  createdAt: string;
};

export type ContentOpportunity = {
  id: string;
  title: string;
  topic: string | null;
  keyword: string | null;
  searchIntent: string | null;
  targetAudience: string | null;
  targetCountry: string | null;
  language: string;
  platform: string;
  priority: Priority;
  reason: string | null;
  source: string | null;
  sourceUrl: string | null;
  status: OpportunityStatus;
  competitorGapId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type MarketingContent = {
  id: string;
  opportunityId: string | null;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  slug: string | null;
  h1: string | null;
  h2: string[];
  body: string;
  targetKeyword: string | null;
  searchIntent: string | null;
  targetCountry: string | null;
  targetAudience: string | null;
  internalLinks: InternalLink[];
  cta: string | null;
  faq: FaqItem[];
  language: string;
  definition: string | null;
  authorOrgInfo: string | null;
  citations: Citation[];
  status: ContentStatus;
  publishedPath: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SocialAccount = {
  id: string;
  platform: AccountPlatform;
  accountName: string;
  country: string | null;
  targetCountry: string | null;
  language: string;
  targetAudience: string | null;
  profileUrl: string | null;
  status: "active" | "paused" | "disconnected";
  postingEnabled: boolean;
  autoPublishEnabled: boolean;
  dailyLimit: number;
  weeklyLimit: number;
  oauthSecretRef: string | null;
  officialApiConnected: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SocialPost = {
  id: string;
  contentId: string | null;
  socialAccountId: string | null;
  platform: SocialPlatform;
  format: string | null;
  title: string | null;
  body: string;
  hook: string | null;
  narration: string | null;
  caption: string | null;
  hashtags: string[];
  cta: string | null;
  targetCountry: string | null;
  targetAudience: string | null;
  language: string;
  status: PostStatus;
  publishMode: PublishMode;
  scheduledAt: string | null;
  publishedAt: string | null;
  destinationUrl: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  errorMessage: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CalendarEntry = {
  id: string;
  calendarDate: string;
  scheduledTime: string | null;
  platform: string;
  contentId: string | null;
  postId: string | null;
  title: string | null;
  status: CalendarStatus;
  targetCountry: string | null;
  targetAudience: string | null;
  cta: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PerformanceRow = {
  id: string;
  contentId: string | null;
  postId: string | null;
  platform: string | null;
  country: string | null;
  topic: string | null;
  keyword: string | null;
  format: string | null;
  cta: string | null;
  impressions: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  followers: number;
  engagement: number;
  referralTraffic: number;
  leads: number;
  registrations: number;
  recordedAt: string;
  createdAt: string;
};

export type GlobalSignal = {
  id: string;
  country: string;
  language: string;
  topic: string;
  demand: string | null;
  contentOpportunity: string | null;
  traffic: number;
  leads: number;
  registrations: number;
  source: string | null;
  sourceUrl: string | null;
  relevance: string | null;
  createdAt: string;
};

export type PlatformTarget = {
  id: string;
  platform: string;
  url: string | null;
  country: string | null;
  language: string | null;
  topic: string | null;
  relevance: string | null;
  recommendedAction: string | null;
  reason: string | null;
  doNotPromote: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BrandMention = {
  id: string;
  source: string | null;
  url: string | null;
  snippet: string | null;
  mentionType: MentionType | null;
  country: string | null;
  language: string | null;
  sentiment: string | null;
  createdAt: string;
};

export type PerformanceTotals = {
  impressions: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  followers: number;
  engagement: number;
  referralTraffic: number;
  leads: number;
  registrations: number;
};

export type NamedScore = {
  name: string;
  score: number;
};

export type GrowthDashboard = {
  opportunityCount: number;
  scheduledCount: number;
  publishedCount: number;
  accountCount: number;
  mentionCount: number;
  totals: PerformanceTotals;
  topCountries: NamedScore[];
  topPlatforms: NamedScore[];
  topTopics: NamedScore[];
  topKeywords: NamedScore[];
  topFormats: NamedScore[];
  topCtas: NamedScore[];
  topArticles: NamedScore[];
  topPosts: NamedScore[];
  scalingReady: boolean;
  scalingMessage: string;
};

export type JobResult = {
  ok: boolean;
  message: string;
  runId?: string;
};

export type PrVideoScene = {
  duration: number;
  visual: string;
  voiceover: string;
  caption: string;
};

export type PrVideoScript = {
  hook: string;
  scenes: PrVideoScene[];
  narrationText: string;
  cta: string;
};

export const DEFAULT_PLATFORM_LIMITS: Record<
  AccountPlatform,
  { daily: number; weekly: number }
> = {
  x: { daily: 1, weekly: 7 },
  linkedin: { daily: 1, weekly: 3 },
  instagram: { daily: 1, weekly: 2 },
  tiktok: { daily: 1, weekly: 3 },
  reddit: { daily: 0, weekly: 1 },
  youtube: { daily: 0, weekly: 1 },
  medium: { daily: 0, weekly: 2 },
  substack: { daily: 0, weekly: 1 },
  brandbridge_blog: { daily: 1, weekly: 3 },
};

export const PRIMARY_DISTRIBUTION_PLATFORMS: SocialPlatform[] = [
  "instagram",
  "tiktok",
  "linkedin",
];

export const OFFICIAL_API_PLATFORMS: SocialPlatform[] = [
  "x",
  "linkedin",
  "instagram",
  "tiktok",
  "youtube",
  "reddit",
];

export const ALWAYS_MANUAL_PLATFORMS: SocialPlatform[] = [
  "brandbridge_blog",
  "medium",
  "substack",
];
