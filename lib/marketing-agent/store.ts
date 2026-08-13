import { createClient } from "@/lib/supabase/server";
import { asRecord, asStringArray, textOrNull } from "./json";
import { officialApiConnected } from "./secrets";
import type {
  BrandMention,
  CalendarEntry,
  CalendarStatus,
  ContentOpportunity,
  ContentStatus,
  GlobalSignal,
  MarketingAgentRun,
  MarketingCompetitor,
  MarketingCompetitorGap,
  MarketingContent,
  MarketingRecommendation,
  MarketingRunType,
  MentionType,
  OpportunityStatus,
  PerformanceRow,
  PlatformTarget,
  PostStatus,
  Priority,
  RecommendationCategory,
  SocialAccount,
  SocialPlatform,
  SocialPost,
} from "./types";

type Json = Record<string, unknown>;

function isMissingTable(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  return (
    msg.includes("does not exist") ||
    msg.includes("42p01") ||
    msg.includes("schema cache")
  );
}

export async function requireMarketingClient() {
  return createClient();
}

function mapRun(row: Json): MarketingAgentRun {
  return {
    id: String(row.id),
    runType: row.run_type as MarketingRunType,
    status: row.status as MarketingAgentRun["status"],
    summary: textOrNull(row.summary),
    input: asRecord(row.input),
    output: asRecord(row.output),
    errorMessage: textOrNull(row.error_message),
    startedAt: String(row.started_at),
    finishedAt: textOrNull(row.finished_at),
    createdBy: textOrNull(row.created_by),
    createdAt: String(row.created_at),
  };
}

function mapRecommendation(row: Json): MarketingRecommendation {
  return {
    id: String(row.id),
    runId: textOrNull(row.run_id),
    category: row.category as RecommendationCategory,
    title: String(row.title),
    body: String(row.body),
    priority: row.priority as Priority,
    status: row.status as MarketingRecommendation["status"],
    relatedUrl: textOrNull(row.related_url),
    metadata: asRecord(row.metadata),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapCompetitor(row: Json): MarketingCompetitor {
  return {
    id: String(row.id),
    name: String(row.name),
    url: textOrNull(row.url),
    country: textOrNull(row.country),
    language: textOrNull(row.language),
    summary: textOrNull(row.summary),
    positioning: textOrNull(row.positioning),
    strengths: asStringArray(row.strengths),
    weaknesses: asStringArray(row.weaknesses),
    contentTopics: asStringArray(row.content_topics),
    keywords: asStringArray(row.keywords),
    source: textOrNull(row.source),
    sourceUrl: textOrNull(row.source_url),
    lastAnalyzedAt: textOrNull(row.last_analyzed_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapGap(row: Json): MarketingCompetitorGap {
  return {
    id: String(row.id),
    competitorId: textOrNull(row.competitor_id),
    gapType: row.gap_type as MarketingCompetitorGap["gapType"],
    title: String(row.title),
    detail: textOrNull(row.detail),
    keyword: textOrNull(row.keyword),
    topic: textOrNull(row.topic),
    priority: row.priority as Priority,
    createdAt: String(row.created_at),
  };
}

function mapOpportunity(row: Json): ContentOpportunity {
  return {
    id: String(row.id),
    title: String(row.title),
    topic: textOrNull(row.topic),
    keyword: textOrNull(row.keyword),
    searchIntent: textOrNull(row.search_intent),
    targetAudience: textOrNull(row.target_audience),
    targetCountry: textOrNull(row.target_country),
    language: String(row.language ?? "en"),
    platform: String(row.platform ?? "brandbridge_blog"),
    priority: (row.priority as Priority) || "medium",
    reason: textOrNull(row.reason),
    source: textOrNull(row.source),
    sourceUrl: textOrNull(row.source_url),
    status: row.status as OpportunityStatus,
    competitorGapId: textOrNull(row.competitor_gap_id),
    metadata: asRecord(row.metadata),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapContent(row: Json): MarketingContent {
  const links = Array.isArray(row.internal_links) ? row.internal_links : [];
  const faq = Array.isArray(row.faq) ? row.faq : [];
  const citations = Array.isArray(row.citations) ? row.citations : [];
  return {
    id: String(row.id),
    opportunityId: textOrNull(row.opportunity_id),
    title: String(row.title),
    metaTitle: textOrNull(row.meta_title),
    metaDescription: textOrNull(row.meta_description),
    slug: textOrNull(row.slug),
    h1: textOrNull(row.h1),
    h2: asStringArray(row.h2),
    body: String(row.body ?? ""),
    targetKeyword: textOrNull(row.target_keyword),
    searchIntent: textOrNull(row.search_intent),
    targetCountry: textOrNull(row.target_country),
    targetAudience: textOrNull(row.target_audience),
    internalLinks: links
      .map((item) => {
        const rec = asRecord(item);
        return {
          path: String(rec.path ?? ""),
          anchor: String(rec.anchor ?? ""),
          reason: textOrNull(rec.reason) ?? undefined,
        };
      })
      .filter((item) => item.path && item.anchor),
    cta: textOrNull(row.cta),
    faq: faq
      .map((item) => {
        const rec = asRecord(item);
        return {
          question: String(rec.question ?? ""),
          answer: String(rec.answer ?? ""),
        };
      })
      .filter((item) => item.question && item.answer),
    language: String(row.language ?? "en"),
    definition: textOrNull(row.definition),
    authorOrgInfo: textOrNull(row.author_org_info),
    citations: citations
      .map((item) => {
        const rec = asRecord(item);
        return {
          title: String(rec.title ?? ""),
          url: String(rec.url ?? ""),
        };
      })
      .filter((item) => item.title && item.url),
    status: row.status as ContentStatus,
    publishedPath: textOrNull(row.published_path),
    createdBy: textOrNull(row.created_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapAccount(row: Json): SocialAccount {
  const platform = row.platform as SocialPlatform;
  return {
    id: String(row.id),
    platform,
    accountName: String(row.account_name),
    country: textOrNull(row.country),
    language: String(row.language ?? "en"),
    targetAudience: textOrNull(row.target_audience),
    profileUrl: textOrNull(row.profile_url),
    status: row.status as SocialAccount["status"],
    postingEnabled: row.posting_enabled !== false,
    autoPublishEnabled: row.auto_publish_enabled === true,
    dailyLimit: Number(row.daily_limit ?? 1),
    weeklyLimit: Number(row.weekly_limit ?? 3),
    oauthSecretRef: textOrNull(row.oauth_secret_ref),
    officialApiConnected: officialApiConnected(
      platform,
      textOrNull(row.oauth_secret_ref),
    ),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapPost(row: Json): SocialPost {
  return {
    id: String(row.id),
    contentId: textOrNull(row.content_id),
    socialAccountId: textOrNull(row.social_account_id),
    platform: row.platform as SocialPlatform,
    format: textOrNull(row.format),
    title: textOrNull(row.title),
    body: String(row.body ?? ""),
    cta: textOrNull(row.cta),
    targetCountry: textOrNull(row.target_country),
    targetAudience: textOrNull(row.target_audience),
    language: String(row.language ?? "en"),
    status: row.status as PostStatus,
    publishMode: (row.publish_mode as SocialPost["publishMode"]) || "manual",
    scheduledAt: textOrNull(row.scheduled_at),
    publishedAt: textOrNull(row.published_at),
    destinationUrl: textOrNull(row.destination_url),
    utmSource: textOrNull(row.utm_source),
    utmMedium: textOrNull(row.utm_medium),
    utmCampaign: textOrNull(row.utm_campaign),
    utmContent: textOrNull(row.utm_content),
    errorMessage: textOrNull(row.error_message),
    createdBy: textOrNull(row.created_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapCalendar(row: Json): CalendarEntry {
  return {
    id: String(row.id),
    calendarDate: String(row.calendar_date),
    scheduledTime: textOrNull(row.scheduled_time),
    platform: String(row.platform),
    contentId: textOrNull(row.content_id),
    postId: textOrNull(row.post_id),
    title: textOrNull(row.title),
    status: row.status as CalendarStatus,
    targetCountry: textOrNull(row.target_country),
    targetAudience: textOrNull(row.target_audience),
    cta: textOrNull(row.cta),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapPerformance(row: Json): PerformanceRow {
  return {
    id: String(row.id),
    contentId: textOrNull(row.content_id),
    postId: textOrNull(row.post_id),
    platform: textOrNull(row.platform),
    country: textOrNull(row.country),
    topic: textOrNull(row.topic),
    keyword: textOrNull(row.keyword),
    format: textOrNull(row.format),
    cta: textOrNull(row.cta),
    impressions: Number(row.impressions ?? 0),
    clicks: Number(row.clicks ?? 0),
    likes: Number(row.likes ?? 0),
    comments: Number(row.comments ?? 0),
    shares: Number(row.shares ?? 0),
    followers: Number(row.followers ?? 0),
    engagement: Number(row.engagement ?? 0),
    referralTraffic: Number(row.referral_traffic ?? 0),
    leads: Number(row.leads ?? 0),
    registrations: Number(row.registrations ?? 0),
    recordedAt: String(row.recorded_at),
    createdAt: String(row.created_at),
  };
}

function mapSignal(row: Json): GlobalSignal {
  return {
    id: String(row.id),
    country: String(row.country),
    language: String(row.language ?? "en"),
    topic: String(row.topic),
    demand: textOrNull(row.demand),
    contentOpportunity: textOrNull(row.content_opportunity),
    traffic: Number(row.traffic ?? 0),
    leads: Number(row.leads ?? 0),
    registrations: Number(row.registrations ?? 0),
    source: textOrNull(row.source),
    sourceUrl: textOrNull(row.source_url),
    relevance: textOrNull(row.relevance),
    createdAt: String(row.created_at),
  };
}

function mapTarget(row: Json): PlatformTarget {
  return {
    id: String(row.id),
    platform: String(row.platform),
    url: textOrNull(row.url),
    country: textOrNull(row.country),
    language: textOrNull(row.language),
    topic: textOrNull(row.topic),
    relevance: textOrNull(row.relevance),
    recommendedAction: textOrNull(row.recommended_action),
    reason: textOrNull(row.reason),
    doNotPromote: row.do_not_promote === true,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapMention(row: Json): BrandMention {
  return {
    id: String(row.id),
    source: textOrNull(row.source),
    url: textOrNull(row.url),
    snippet: textOrNull(row.snippet),
    mentionType: (row.mention_type as MentionType | null) ?? null,
    country: textOrNull(row.country),
    language: textOrNull(row.language),
    sentiment: textOrNull(row.sentiment),
    createdAt: String(row.created_at),
  };
}

export async function marketingTablesReady(): Promise<{
  ok: boolean;
  message: string;
}> {
  const supabase = await requireMarketingClient();
  const { error } = await supabase
    .from("marketing_agent_runs")
    .select("id", { count: "exact", head: true });
  if (!error) {
    return { ok: true, message: "marketing tables ready" };
  }
  if (isMissingTable(error)) {
    return {
      ok: false,
      message:
        "052_marketing_engine.sql が未適用です。Supabase SQL Editor で実行してください。",
    };
  }
  return { ok: false, message: error.message };
}

export async function insertRun(params: {
  runType: MarketingRunType;
  createdBy: string | null;
  input?: Record<string, unknown>;
}): Promise<MarketingAgentRun | { error: string }> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_agent_runs")
    .insert({
      run_type: params.runType,
      status: "running",
      created_by: params.createdBy,
      input: params.input ?? {},
    })
    .select("*")
    .single();
  if (error || !data) {
    return {
      error: isMissingTable(error)
        ? "marketing tables missing — run supabase/migrations/052_marketing_engine.sql"
        : error?.message || "failed to insert run",
    };
  }
  return mapRun(data as Json);
}

export async function finishRun(
  id: string,
  patch: {
    status: "completed" | "failed";
    summary?: string;
    output?: Record<string, unknown>;
    errorMessage?: string;
  },
): Promise<void> {
  const supabase = await requireMarketingClient();
  await supabase
    .from("marketing_agent_runs")
    .update({
      status: patch.status,
      summary: patch.summary ?? null,
      output: patch.output ?? {},
      error_message: patch.errorMessage ?? null,
      finished_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function listRecentRuns(limit = 20): Promise<MarketingAgentRun[]> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_agent_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((row) => mapRun(row as Json));
}

export async function insertRecommendations(
  rows: {
    runId?: string | null;
    category: RecommendationCategory;
    title: string;
    body: string;
    priority?: Priority;
    relatedUrl?: string | null;
    metadata?: Record<string, unknown>;
  }[],
): Promise<void> {
  if (rows.length === 0) return;
  const supabase = await requireMarketingClient();
  await supabase.from("marketing_recommendations").insert(
    rows.map((row) => ({
      run_id: row.runId ?? null,
      category: row.category,
      title: row.title,
      body: row.body,
      priority: row.priority ?? "medium",
      related_url: row.relatedUrl ?? null,
      metadata: row.metadata ?? {},
    })),
  );
}

export async function listRecommendations(
  status: "open" | "accepted" | "dismissed" | "all" = "open",
): Promise<MarketingRecommendation[]> {
  const supabase = await requireMarketingClient();
  let q = supabase
    .from("marketing_recommendations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(80);
  if (status !== "all") q = q.eq("status", status);
  const { data, error } = await q;
  if (error || !data) return [];
  return data.map((row) => mapRecommendation(row as Json));
}

export async function setRecommendationStatus(
  id: string,
  status: "open" | "accepted" | "dismissed",
): Promise<void> {
  const supabase = await requireMarketingClient();
  await supabase.from("marketing_recommendations").update({ status }).eq("id", id);
}

export async function listCompetitors(): Promise<MarketingCompetitor[]> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_competitors")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((row) => mapCompetitor(row as Json));
}

export async function getCompetitor(
  id: string,
): Promise<{ competitor: MarketingCompetitor; gaps: MarketingCompetitorGap[] } | null> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_competitors")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const { data: gaps } = await supabase
    .from("marketing_competitor_gaps")
    .select("*")
    .eq("competitor_id", id)
    .order("created_at", { ascending: false });
  return {
    competitor: mapCompetitor(data as Json),
    gaps: (gaps ?? []).map((row) => mapGap(row as Json)),
  };
}

export async function upsertCompetitor(input: {
  name: string;
  url?: string | null;
  country?: string | null;
  language?: string | null;
  summary?: string | null;
  positioning?: string | null;
  strengths?: string[];
  weaknesses?: string[];
  contentTopics?: string[];
  keywords?: string[];
  source?: string | null;
  sourceUrl?: string | null;
}): Promise<string | null> {
  const supabase = await requireMarketingClient();
  if (input.url) {
    const { data: existing } = await supabase
      .from("marketing_competitors")
      .select("id")
      .eq("url", input.url)
      .maybeSingle();
    if (existing?.id) {
      await supabase
        .from("marketing_competitors")
        .update({
          name: input.name,
          country: input.country ?? null,
          language: input.language ?? null,
          summary: input.summary ?? null,
          positioning: input.positioning ?? null,
          strengths: input.strengths ?? [],
          weaknesses: input.weaknesses ?? [],
          content_topics: input.contentTopics ?? [],
          keywords: input.keywords ?? [],
          source: input.source ?? null,
          source_url: input.sourceUrl ?? null,
          last_analyzed_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      return String(existing.id);
    }
  }
  const { data, error } = await supabase
    .from("marketing_competitors")
    .insert({
      name: input.name,
      url: input.url ?? null,
      country: input.country ?? null,
      language: input.language ?? null,
      summary: input.summary ?? null,
      positioning: input.positioning ?? null,
      strengths: input.strengths ?? [],
      weaknesses: input.weaknesses ?? [],
      content_topics: input.contentTopics ?? [],
      keywords: input.keywords ?? [],
      source: input.source ?? null,
      source_url: input.sourceUrl ?? null,
      last_analyzed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !data) return null;
  return String(data.id);
}

export async function insertGaps(
  rows: {
    competitorId?: string | null;
    gapType: MarketingCompetitorGap["gapType"];
    title: string;
    detail?: string | null;
    keyword?: string | null;
    topic?: string | null;
    priority?: Priority;
  }[],
): Promise<MarketingCompetitorGap[]> {
  if (rows.length === 0) return [];
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_competitor_gaps")
    .insert(
      rows.map((row) => ({
        competitor_id: row.competitorId ?? null,
        gap_type: row.gapType,
        title: row.title,
        detail: row.detail ?? null,
        keyword: row.keyword ?? null,
        topic: row.topic ?? null,
        priority: row.priority ?? "medium",
      })),
    )
    .select("*");
  if (error || !data) return [];
  return data.map((row) => mapGap(row as Json));
}

export async function listGaps(limit = 40): Promise<MarketingCompetitorGap[]> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_competitor_gaps")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((row) => mapGap(row as Json));
}

export async function insertOpportunities(
  rows: Omit<ContentOpportunity, "id" | "createdAt" | "updatedAt">[],
): Promise<ContentOpportunity[]> {
  if (rows.length === 0) return [];
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_content_opportunities")
    .insert(
      rows.map((row) => ({
        title: row.title,
        topic: row.topic,
        keyword: row.keyword,
        search_intent: row.searchIntent,
        target_audience: row.targetAudience,
        target_country: row.targetCountry,
        language: row.language,
        platform: row.platform,
        priority: row.priority,
        reason: row.reason,
        source: row.source,
        source_url: row.sourceUrl,
        status: row.status,
        competitor_gap_id: row.competitorGapId,
        metadata: row.metadata ?? {},
      })),
    )
    .select("*");
  if (error || !data) return [];
  return data.map((row) => mapOpportunity(row as Json));
}

export async function listOpportunities(): Promise<ContentOpportunity[]> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_content_opportunities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(80);
  if (error || !data) return [];
  return data.map((row) => mapOpportunity(row as Json));
}

export async function getOpportunity(id: string): Promise<ContentOpportunity | null> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_content_opportunities")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapOpportunity(data as Json);
}

export async function updateOpportunityStatus(
  id: string,
  status: OpportunityStatus,
): Promise<void> {
  const supabase = await requireMarketingClient();
  await supabase
    .from("marketing_content_opportunities")
    .update({ status })
    .eq("id", id);
}

export async function insertContent(
  row: Omit<MarketingContent, "id" | "createdAt" | "updatedAt">,
): Promise<MarketingContent | { error: string }> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_contents")
    .insert({
      opportunity_id: row.opportunityId,
      title: row.title,
      meta_title: row.metaTitle,
      meta_description: row.metaDescription,
      slug: row.slug,
      h1: row.h1,
      h2: row.h2,
      body: row.body,
      target_keyword: row.targetKeyword,
      search_intent: row.searchIntent,
      target_country: row.targetCountry,
      target_audience: row.targetAudience,
      internal_links: row.internalLinks,
      cta: row.cta,
      faq: row.faq,
      language: row.language,
      definition: row.definition,
      author_org_info: row.authorOrgInfo,
      citations: row.citations,
      status: row.status,
      published_path: row.publishedPath,
      created_by: row.createdBy,
    })
    .select("*")
    .single();
  if (error || !data) return { error: error?.message || "insert content failed" };
  return mapContent(data as Json);
}

export async function listContents(): Promise<MarketingContent[]> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_contents")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((row) => mapContent(row as Json));
}

export async function getContent(id: string): Promise<MarketingContent | null> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_contents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapContent(data as Json);
}

export async function updateContent(
  id: string,
  patch: Partial<{
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
    cta: string | null;
    language: string;
    definition: string | null;
    authorOrgInfo: string | null;
    status: ContentStatus;
  }>,
): Promise<void> {
  const supabase = await requireMarketingClient();
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.metaTitle !== undefined) row.meta_title = patch.metaTitle;
  if (patch.metaDescription !== undefined) row.meta_description = patch.metaDescription;
  if (patch.slug !== undefined) row.slug = patch.slug;
  if (patch.h1 !== undefined) row.h1 = patch.h1;
  if (patch.h2 !== undefined) row.h2 = patch.h2;
  if (patch.body !== undefined) row.body = patch.body;
  if (patch.targetKeyword !== undefined) row.target_keyword = patch.targetKeyword;
  if (patch.searchIntent !== undefined) row.search_intent = patch.searchIntent;
  if (patch.targetCountry !== undefined) row.target_country = patch.targetCountry;
  if (patch.targetAudience !== undefined) row.target_audience = patch.targetAudience;
  if (patch.cta !== undefined) row.cta = patch.cta;
  if (patch.language !== undefined) row.language = patch.language;
  if (patch.definition !== undefined) row.definition = patch.definition;
  if (patch.authorOrgInfo !== undefined) row.author_org_info = patch.authorOrgInfo;
  if (patch.status !== undefined) row.status = patch.status;
  if (Object.keys(row).length === 0) return;
  await supabase.from("marketing_contents").update(row).eq("id", id);
}

export async function insertSocialAccount(input: {
  platform: SocialPlatform;
  accountName: string;
  country?: string | null;
  language?: string;
  targetAudience?: string | null;
  profileUrl?: string | null;
  postingEnabled?: boolean;
  autoPublishEnabled?: boolean;
  dailyLimit: number;
  weeklyLimit: number;
  oauthSecretRef?: string | null;
}): Promise<SocialAccount | { error: string }> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_social_accounts")
    .insert({
      platform: input.platform,
      account_name: input.accountName,
      country: input.country ?? null,
      language: input.language ?? "en",
      target_audience: input.targetAudience ?? null,
      profile_url: input.profileUrl ?? null,
      posting_enabled: input.postingEnabled !== false,
      auto_publish_enabled: input.autoPublishEnabled === true,
      daily_limit: input.dailyLimit,
      weekly_limit: input.weeklyLimit,
      oauth_secret_ref: input.oauthSecretRef ?? null,
    })
    .select("*")
    .single();
  if (error || !data) return { error: error?.message || "insert account failed" };
  return mapAccount(data as Json);
}

export async function listSocialAccounts(): Promise<SocialAccount[]> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_social_accounts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => mapAccount(row as Json));
}

export async function updateSocialAccount(
  id: string,
  patch: Partial<{
    accountName: string;
    country: string | null;
    language: string;
    targetAudience: string | null;
    profileUrl: string | null;
    status: SocialAccount["status"];
    postingEnabled: boolean;
    autoPublishEnabled: boolean;
    dailyLimit: number;
    weeklyLimit: number;
    oauthSecretRef: string | null;
  }>,
): Promise<{ error?: string }> {
  const supabase = await requireMarketingClient();
  const row: Record<string, unknown> = {};
  if (patch.accountName !== undefined) row.account_name = patch.accountName;
  if (patch.country !== undefined) row.country = patch.country;
  if (patch.language !== undefined) row.language = patch.language;
  if (patch.targetAudience !== undefined) row.target_audience = patch.targetAudience;
  if (patch.profileUrl !== undefined) row.profile_url = patch.profileUrl;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.postingEnabled !== undefined) row.posting_enabled = patch.postingEnabled;
  if (patch.autoPublishEnabled !== undefined) {
    row.auto_publish_enabled = patch.autoPublishEnabled;
  }
  if (patch.dailyLimit !== undefined) row.daily_limit = patch.dailyLimit;
  if (patch.weeklyLimit !== undefined) row.weekly_limit = patch.weeklyLimit;
  if (patch.oauthSecretRef !== undefined) row.oauth_secret_ref = patch.oauthSecretRef;
  const { error } = await supabase
    .from("marketing_social_accounts")
    .update(row)
    .eq("id", id);
  return error ? { error: error.message } : {};
}

export async function insertSocialPost(
  row: Omit<SocialPost, "id" | "createdAt" | "updatedAt">,
): Promise<SocialPost | { error: string }> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_social_posts")
    .insert({
      content_id: row.contentId,
      social_account_id: row.socialAccountId,
      platform: row.platform,
      format: row.format,
      title: row.title,
      body: row.body,
      cta: row.cta,
      target_country: row.targetCountry,
      target_audience: row.targetAudience,
      language: row.language,
      status: row.status,
      publish_mode: row.publishMode,
      scheduled_at: row.scheduledAt,
      published_at: row.publishedAt,
      destination_url: row.destinationUrl,
      utm_source: row.utmSource,
      utm_medium: row.utmMedium,
      utm_campaign: row.utmCampaign,
      utm_content: row.utmContent,
      error_message: row.errorMessage,
      created_by: row.createdBy,
    })
    .select("*")
    .single();
  if (error || !data) return { error: error?.message || "insert post failed" };
  return mapPost(data as Json);
}

export async function listSocialPosts(filter?: {
  status?: PostStatus;
  limit?: number;
}): Promise<SocialPost[]> {
  const supabase = await requireMarketingClient();
  let q = supabase
    .from("marketing_social_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filter?.limit ?? 80);
  if (filter?.status) q = q.eq("status", filter.status);
  const { data, error } = await q;
  if (error || !data) return [];
  return data.map((row) => mapPost(row as Json));
}

export async function getSocialPost(id: string): Promise<SocialPost | null> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_social_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapPost(data as Json);
}

export async function updateSocialPost(
  id: string,
  patch: Partial<{
    status: PostStatus;
    body: string;
    title: string | null;
    scheduledAt: string | null;
    publishedAt: string | null;
    publishMode: SocialPost["publishMode"];
    errorMessage: string | null;
    destinationUrl: string | null;
  }>,
): Promise<void> {
  const supabase = await requireMarketingClient();
  const row: Record<string, unknown> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.body !== undefined) row.body = patch.body;
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.scheduledAt !== undefined) row.scheduled_at = patch.scheduledAt;
  if (patch.publishedAt !== undefined) row.published_at = patch.publishedAt;
  if (patch.publishMode !== undefined) row.publish_mode = patch.publishMode;
  if (patch.errorMessage !== undefined) row.error_message = patch.errorMessage;
  if (patch.destinationUrl !== undefined) row.destination_url = patch.destinationUrl;
  await supabase.from("marketing_social_posts").update(row).eq("id", id);
}

export async function countRecentPosts(
  accountId: string,
  sinceIso: string,
): Promise<number> {
  const supabase = await requireMarketingClient();
  const { count } = await supabase
    .from("marketing_social_posts")
    .select("id", { count: "exact", head: true })
    .eq("social_account_id", accountId)
    .in("status", ["scheduled", "published"])
    .gte("created_at", sinceIso);
  return count ?? 0;
}

export async function insertCalendarEntry(
  row: Omit<CalendarEntry, "id" | "createdAt" | "updatedAt">,
): Promise<void> {
  const supabase = await requireMarketingClient();
  await supabase.from("marketing_content_calendar").insert({
    calendar_date: row.calendarDate,
    scheduled_time: row.scheduledTime,
    platform: row.platform,
    content_id: row.contentId,
    post_id: row.postId,
    title: row.title,
    status: row.status,
    target_country: row.targetCountry,
    target_audience: row.targetAudience,
    cta: row.cta,
  });
}

export async function listCalendar(limit = 60): Promise<CalendarEntry[]> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_content_calendar")
    .select("*")
    .order("calendar_date", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((row) => mapCalendar(row as Json));
}

export async function updateCalendarForPost(
  postId: string,
  status: CalendarStatus,
  scheduledTime?: string | null,
): Promise<void> {
  const supabase = await requireMarketingClient();
  const patch: Record<string, unknown> = { status };
  if (scheduledTime !== undefined) patch.scheduled_time = scheduledTime;
  await supabase
    .from("marketing_content_calendar")
    .update(patch)
    .eq("post_id", postId);
}

export async function insertPerformance(
  row: Omit<PerformanceRow, "id" | "createdAt">,
): Promise<void> {
  const supabase = await requireMarketingClient();
  await supabase.from("marketing_content_performance").insert({
    content_id: row.contentId,
    post_id: row.postId,
    platform: row.platform,
    country: row.country,
    topic: row.topic,
    keyword: row.keyword,
    format: row.format,
    cta: row.cta,
    impressions: row.impressions,
    clicks: row.clicks,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    followers: row.followers,
    engagement: row.engagement,
    referral_traffic: row.referralTraffic,
    leads: row.leads,
    registrations: row.registrations,
    recorded_at: row.recordedAt,
  });
}

export async function listPerformance(limit = 100): Promise<PerformanceRow[]> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_content_performance")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((row) => mapPerformance(row as Json));
}

export async function insertGlobalSignals(
  rows: Omit<GlobalSignal, "id" | "createdAt">[],
): Promise<void> {
  if (rows.length === 0) return;
  const supabase = await requireMarketingClient();
  await supabase.from("marketing_global_signals").insert(
    rows.map((row) => ({
      country: row.country,
      language: row.language,
      topic: row.topic,
      demand: row.demand,
      content_opportunity: row.contentOpportunity,
      traffic: row.traffic,
      leads: row.leads,
      registrations: row.registrations,
      source: row.source,
      source_url: row.sourceUrl,
      relevance: row.relevance,
    })),
  );
}

export async function listGlobalSignals(): Promise<GlobalSignal[]> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_global_signals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(80);
  if (error || !data) return [];
  return data.map((row) => mapSignal(row as Json));
}

export async function insertPlatformTargets(
  rows: Omit<PlatformTarget, "id" | "createdAt" | "updatedAt">[],
): Promise<void> {
  if (rows.length === 0) return;
  const supabase = await requireMarketingClient();
  await supabase.from("marketing_platform_targets").insert(
    rows.map((row) => ({
      platform: row.platform,
      url: row.url,
      country: row.country,
      language: row.language,
      topic: row.topic,
      relevance: row.relevance,
      recommended_action: row.recommendedAction,
      reason: row.reason,
      do_not_promote: row.doNotPromote,
    })),
  );
}

export async function listPlatformTargets(): Promise<PlatformTarget[]> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_platform_targets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(80);
  if (error || !data) return [];
  return data.map((row) => mapTarget(row as Json));
}

export async function insertBrandMentions(
  rows: Omit<BrandMention, "id" | "createdAt">[],
): Promise<void> {
  if (rows.length === 0) return;
  const supabase = await requireMarketingClient();
  await supabase.from("marketing_brand_mentions").insert(
    rows.map((row) => ({
      source: row.source,
      url: row.url,
      snippet: row.snippet,
      mention_type: row.mentionType,
      country: row.country,
      language: row.language,
      sentiment: row.sentiment,
    })),
  );
}

export async function listBrandMentions(): Promise<BrandMention[]> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_brand_mentions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((row) => mapMention(row as Json));
}

export async function earliestPerformanceDate(): Promise<string | null> {
  const supabase = await requireMarketingClient();
  const { data, error } = await supabase
    .from("marketing_content_performance")
    .select("recorded_at")
    .order("recorded_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return textOrNull((data as Json).recorded_at);
}
