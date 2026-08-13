import { createClient } from "@/lib/supabase/server";
import type {
  MarketingAgentOverview,
  MarketingAgentRun,
  MarketingCompetitor,
  MarketingCompetitorGap,
  MarketingContentDraft,
  MarketingContentIdea,
  MarketingDraftStatus,
  MarketingIdeaStatus,
  MarketingPriority,
  MarketingRecommendation,
  MarketingRecommendationCategory,
  MarketingRecommendationStatus,
  MarketingRunStatus,
  MarketingRunType,
  CompetitorGapType,
  CompetitorStatus,
} from "@/lib/marketing-agent/types";
import { asRecord } from "@/lib/marketing-agent/json";
import { getAiConnection } from "@/lib/marketing-agent/ai";
import { getSearchConsoleConnection } from "@/lib/marketing-agent/search-console";
import { getAgentReachConnection } from "@/lib/marketing-agent/research";

type RunRow = {
  id: string;
  run_type: MarketingRunType;
  status: MarketingRunStatus;
  input: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type IdeaRow = {
  id: string;
  title: string;
  topic: string | null;
  target_keyword: string | null;
  search_intent: string | null;
  target_audience: string | null;
  content_type: string | null;
  priority: MarketingPriority;
  reasoning: string | null;
  status: MarketingIdeaStatus;
  created_at: string;
  updated_at: string;
};

type DraftRow = {
  id: string;
  idea_id: string | null;
  title: string;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  content: string;
  language: string;
  seo_notes: string | null;
  geo_notes: string | null;
  status: MarketingDraftStatus;
  created_at: string;
  updated_at: string;
};

type RecRow = {
  id: string;
  category: MarketingRecommendationCategory;
  title: string;
  description: string | null;
  priority: MarketingPriority;
  data: Record<string, unknown> | null;
  status: MarketingRecommendationStatus;
  created_at: string;
  updated_at: string;
};

export function isMissingRelationError(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

function mapRun(row: RunRow): MarketingAgentRun {
  return {
    id: row.id,
    runType: row.run_type,
    status: row.status,
    input: row.input ?? {},
    result: row.result ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapIdea(row: IdeaRow): MarketingContentIdea {
  return {
    id: row.id,
    title: row.title,
    topic: row.topic,
    targetKeyword: row.target_keyword,
    searchIntent: row.search_intent,
    targetAudience: row.target_audience,
    contentType: row.content_type,
    priority: row.priority,
    reasoning: row.reasoning,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDraft(row: DraftRow): MarketingContentDraft {
  return {
    id: row.id,
    ideaId: row.idea_id,
    title: row.title,
    slug: row.slug,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    content: row.content,
    language: row.language,
    seoNotes: row.seo_notes,
    geoNotes: row.geo_notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRec(row: RecRow): MarketingRecommendation {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    priority: row.priority,
    data: row.data ?? {},
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function insertRun(input: {
  runType: MarketingRunType;
  status?: MarketingRunStatus;
  input?: Record<string, unknown>;
}): Promise<MarketingAgentRun> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_agent_runs")
    .insert({
      run_type: input.runType,
      status: input.status ?? "running",
      input: input.input ?? {},
      result: {},
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create marketing run");
  }
  return mapRun(data as RunRow);
}

export async function updateRun(
  id: string,
  patch: {
    status?: MarketingRunStatus;
    result?: Record<string, unknown>;
    input?: Record<string, unknown>;
  },
): Promise<void> {
  const supabase = await createClient();
  const payload: Record<string, unknown> = {};
  if (patch.status) payload.status = patch.status;
  if (patch.result) payload.result = patch.result;
  if (patch.input) payload.input = patch.input;
  const { error } = await supabase
    .from("marketing_agent_runs")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listRuns(limit = 20): Promise<MarketingAgentRun[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_agent_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as RunRow[]).map(mapRun);
}

export async function getLatestRun(
  runType: MarketingRunType,
): Promise<MarketingAgentRun | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_agent_runs")
    .select("*")
    .eq("run_type", runType)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRun(data as RunRow) : null;
}

export async function insertIdeas(
  ideas: Array<{
    title: string;
    topic?: string | null;
    targetKeyword?: string | null;
    searchIntent?: string | null;
    targetAudience?: string | null;
    contentType?: string | null;
    priority?: MarketingPriority;
    reasoning?: string | null;
  }>,
): Promise<MarketingContentIdea[]> {
  if (ideas.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_content_ideas")
    .insert(
      ideas.map((idea) => ({
        title: idea.title,
        topic: idea.topic ?? null,
        target_keyword: idea.targetKeyword ?? null,
        search_intent: idea.searchIntent ?? null,
        target_audience: idea.targetAudience ?? null,
        content_type: idea.contentType ?? null,
        priority: idea.priority ?? "medium",
        reasoning: idea.reasoning ?? null,
        status: "proposed",
      })),
    )
    .select("*");
  if (error) throw new Error(error.message);
  return ((data ?? []) as IdeaRow[]).map(mapIdea);
}

export async function listIdeas(limit = 40): Promise<MarketingContentIdea[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_content_ideas")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as IdeaRow[]).map(mapIdea);
}

export async function getIdeaById(id: string): Promise<MarketingContentIdea | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_content_ideas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapIdea(data as IdeaRow) : null;
}

export async function updateIdeaStatus(
  id: string,
  status: MarketingIdeaStatus,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("marketing_content_ideas")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function insertDraft(input: {
  ideaId?: string | null;
  title: string;
  slug?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  content: string;
  language?: string;
  seoNotes?: string | null;
  geoNotes?: string | null;
}): Promise<MarketingContentDraft> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_content_drafts")
    .insert({
      idea_id: input.ideaId ?? null,
      title: input.title,
      slug: input.slug ?? null,
      meta_title: input.metaTitle ?? null,
      meta_description: input.metaDescription ?? null,
      content: input.content,
      language: input.language ?? "en",
      seo_notes: input.seoNotes ?? null,
      geo_notes: input.geoNotes ?? null,
      status: "draft",
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to save draft");
  return mapDraft(data as DraftRow);
}

export async function listDrafts(limit = 30): Promise<MarketingContentDraft[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_content_drafts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as DraftRow[]).map(mapDraft);
}

export async function getDraftById(
  id: string,
): Promise<MarketingContentDraft | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_content_drafts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapDraft(data as DraftRow) : null;
}

export async function updateDraftStatus(
  id: string,
  status: MarketingDraftStatus,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("marketing_content_drafts")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function insertRecommendations(
  items: Array<{
    category: MarketingRecommendationCategory;
    title: string;
    description?: string | null;
    priority?: MarketingPriority;
    data?: Record<string, unknown>;
  }>,
): Promise<MarketingRecommendation[]> {
  if (items.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_recommendations")
    .insert(
      items.map((item) => ({
        category: item.category,
        title: item.title,
        description: item.description ?? null,
        priority: item.priority ?? "medium",
        data: item.data ?? {},
        status: "open",
      })),
    )
    .select("*");
  if (error) throw new Error(error.message);
  return ((data ?? []) as RecRow[]).map(mapRec);
}

export async function listRecommendations(
  limit = 80,
): Promise<MarketingRecommendation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_recommendations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as RecRow[]).map(mapRec);
}

export async function updateRecommendationStatus(
  id: string,
  status: MarketingRecommendationStatus,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("marketing_recommendations")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function loadMarketingAgentPageData(): Promise<{
  overview: MarketingAgentOverview;
  runs: MarketingAgentRun[];
  ideas: MarketingContentIdea[];
  drafts: MarketingContentDraft[];
  recommendations: MarketingRecommendation[];
  competitors: MarketingCompetitor[];
  gaps: MarketingCompetitorGap[];
}> {
  const connections = {
    ai: getAiConnection(),
    searchConsole: getSearchConsoleConnection(),
    agentReach: getAgentReachConnection(),
  };

  try {
    const [runs, ideas, drafts, recommendations, lastAnalysis, competitors, gaps] =
      await Promise.all([
        listRuns(25),
        listIdeas(40),
        listDrafts(30),
        listRecommendations(80),
        getLatestRun("site_analysis"),
        listCompetitors(40).catch(() => [] as MarketingCompetitor[]),
        listCompetitorGaps(80).catch(() => [] as MarketingCompetitorGap[]),
      ]);

    return {
      overview: {
        connections,
        lastAnalysisAt: lastAnalysis?.createdAt ?? null,
        lastAnalysisStatus: lastAnalysis?.status ?? null,
        opportunityCount: ideas.filter((idea) => idea.status === "proposed")
          .length,
        draftCount: drafts.filter((draft) => draft.status === "draft").length,
        seoRecommendationCount: recommendations.filter(
          (item) =>
            item.status === "open" &&
            (item.category === "seo" || item.category === "keyword"),
        ).length,
        geoRecommendationCount: recommendations.filter(
          (item) => item.status === "open" && item.category === "geo",
        ).length,
        competitorCount: competitors.filter((item) => item.status !== "dismissed")
          .length,
        gapCount: gaps.filter((item) => item.status === "open").length,
      },
      runs,
      ideas,
      drafts,
      recommendations,
      competitors,
      gaps,
    };
  } catch (error) {
    const err = error as { message?: string; code?: string };
    const migrationError = isMissingRelationError(err)
      ? "Supabase で migration 052_marketing_agent.sql / 053_marketing_competitors.sql を実行してください。"
      : err.message ?? "Marketing Agent データの取得に失敗しました。";

    return {
      overview: {
        connections,
        lastAnalysisAt: null,
        lastAnalysisStatus: null,
        opportunityCount: 0,
        draftCount: 0,
        seoRecommendationCount: 0,
        geoRecommendationCount: 0,
        competitorCount: 0,
        gapCount: 0,
        migrationError,
      },
      runs: [],
      ideas: [],
      drafts: [],
      recommendations: [],
      competitors: [],
      gaps: [],
    };
  }
}

export function gscRowsFromRun(
  run: MarketingAgentRun | null,
): Record<string, unknown> {
  return asRecord(run?.result);
}

type CompetitorRow = {
  id: string;
  company_name: string;
  url: string | null;
  category: string | null;
  target_customer: string | null;
  service_summary: string | null;
  strengths: string | null;
  weaknesses: string | null;
  seo_summary: string | null;
  social_summary: string | null;
  source_data: Record<string, unknown> | null;
  status: CompetitorStatus;
  created_at: string;
  updated_at: string;
};

type GapRow = {
  id: string;
  competitor_id: string | null;
  gap_type: CompetitorGapType;
  title: string;
  description: string | null;
  priority: MarketingPriority;
  data: Record<string, unknown> | null;
  status: MarketingRecommendationStatus;
  created_at: string;
  updated_at: string;
};

function mapCompetitor(row: CompetitorRow): MarketingCompetitor {
  return {
    id: row.id,
    companyName: row.company_name,
    url: row.url,
    category: row.category,
    targetCustomer: row.target_customer,
    serviceSummary: row.service_summary,
    strengths: row.strengths,
    weaknesses: row.weaknesses,
    seoSummary: row.seo_summary,
    socialSummary: row.social_summary,
    sourceData: row.source_data ?? {},
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGap(row: GapRow): MarketingCompetitorGap {
  return {
    id: row.id,
    competitorId: row.competitor_id,
    gapType: row.gap_type,
    title: row.title,
    description: row.description,
    priority: row.priority,
    data: row.data ?? {},
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function insertCompetitors(
  items: Array<{
    companyName: string;
    url?: string | null;
    category?: string | null;
    targetCustomer?: string | null;
    serviceSummary?: string | null;
    strengths?: string | null;
    weaknesses?: string | null;
    seoSummary?: string | null;
    socialSummary?: string | null;
    sourceData?: Record<string, unknown>;
  }>,
): Promise<MarketingCompetitor[]> {
  if (items.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_competitors")
    .insert(
      items.map((item) => ({
        company_name: item.companyName,
        url: item.url ?? null,
        category: item.category ?? null,
        target_customer: item.targetCustomer ?? null,
        service_summary: item.serviceSummary ?? null,
        strengths: item.strengths ?? null,
        weaknesses: item.weaknesses ?? null,
        seo_summary: item.seoSummary ?? null,
        social_summary: item.socialSummary ?? null,
        source_data: item.sourceData ?? {},
        status: "candidate",
      })),
    )
    .select("*");
  if (error) throw new Error(error.message);
  return ((data ?? []) as CompetitorRow[]).map(mapCompetitor);
}

export async function listCompetitors(
  limit = 40,
): Promise<MarketingCompetitor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_competitors")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as CompetitorRow[]).map(mapCompetitor);
}

export async function getCompetitorById(
  id: string,
): Promise<MarketingCompetitor | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_competitors")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCompetitor(data as CompetitorRow) : null;
}

export async function updateCompetitorStatus(
  id: string,
  status: CompetitorStatus,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("marketing_competitors")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function insertCompetitorGaps(
  items: Array<{
    competitorId?: string | null;
    gapType: CompetitorGapType;
    title: string;
    description?: string | null;
    priority?: MarketingPriority;
    data?: Record<string, unknown>;
  }>,
): Promise<MarketingCompetitorGap[]> {
  if (items.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_competitor_gaps")
    .insert(
      items.map((item) => ({
        competitor_id: item.competitorId ?? null,
        gap_type: item.gapType,
        title: item.title,
        description: item.description ?? null,
        priority: item.priority ?? "medium",
        data: item.data ?? {},
        status: "open",
      })),
    )
    .select("*");
  if (error) throw new Error(error.message);
  return ((data ?? []) as GapRow[]).map(mapGap);
}

export async function listCompetitorGaps(
  limit = 80,
): Promise<MarketingCompetitorGap[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_competitor_gaps")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as GapRow[]).map(mapGap);
}

export async function listGapsForCompetitor(
  competitorId: string,
): Promise<MarketingCompetitorGap[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_competitor_gaps")
    .select("*")
    .eq("competitor_id", competitorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as GapRow[]).map(mapGap);
}

export async function updateCompetitorGapStatus(
  id: string,
  status: MarketingRecommendationStatus,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("marketing_competitor_gaps")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
