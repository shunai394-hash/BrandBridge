import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  analyzeSiteWithAi,
  discoverOpportunitiesWithAi,
  generateJapanesePartnerPrWithAi,
  mapRecommendationItems,
  parseIdeaRecords,
  parseInternalLinks,
  proposeGeoWithAi,
  proposeInternalLinksWithAi,
} from "@/lib/marketing-agent/analysis";
import { generateArticleDraftWithAi } from "@/lib/marketing-agent/content";
import { crawlPublicPages, heuristicSeoFlags } from "@/lib/marketing-agent/seo";
import {
  fetchSearchConsolePerformance,
} from "@/lib/marketing-agent/search-console";
import {
  getDraftById,
  getIdeaById,
  getLatestRun,
  insertCompetitors,
  insertCompetitorGaps,
  insertDraft,
  insertIdeas,
  insertRecommendations,
  insertRun,
  listCompetitorGaps,
  listRecommendations,
  updateRun,
} from "@/lib/marketing-agent/store";
import type {
  AnalyzedPage,
  SearchConsoleResult,
} from "@/lib/marketing-agent/types";
import { asRecord, asString } from "@/lib/marketing-agent/json";
import { getSiteUrl } from "@/lib/site";
import {
  PUBLIC_URL_MISSING,
  JA_PUBLIC_URL_MISSING,
  assertPublishedUrlLive,
  listSocialTargetPages,
  resolvePublishedPageOrThrow,
  sanitizeSocialPayload,
  usableFetchedPageText,
} from "@/lib/marketing-agent/published-urls";
import {
  buildVerifiedSocialPack,
  pickSocialTheme,
  type PastSocialTheme,
} from "@/lib/marketing-agent/social-pack";
import { socialInsertsFromPack } from "@/lib/social/from-pack";
import { insertSocialPosts } from "@/lib/social/store";

function errorMessage(error: unknown): string {
  if (error instanceof MarketingAgentError) return error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}

async function persistGeneratedSocialPosts(
  posts: Record<string, unknown>,
  recommendationId?: string,
) {
  try {
    const rows = await socialInsertsFromPack(posts);
    await insertSocialPosts(
      rows.map((item) => ({
        ...item,
        recommendationId: recommendationId ?? null,
      })),
    );
  } catch (persistError) {
    console.error("[social_posts] persist", persistError);
  }
}

function gscFromLatest(
  run: Awaited<ReturnType<typeof getLatestRun>>,
): SearchConsoleResult | null {
  if (!run) return null;
  const result = asRecord(run.result);
  if (result.configured === false && !Array.isArray(result.rows)) {
    return {
      configured: false,
      siteUrl: typeof result.siteUrl === "string" ? result.siteUrl : null,
      startDate: typeof result.startDate === "string" ? result.startDate : null,
      endDate: typeof result.endDate === "string" ? result.endDate : null,
      rows: [],
      error: typeof result.error === "string" ? result.error : "Search Console未接続",
    };
  }
  const rows = Array.isArray(result.rows) ? result.rows : [];
  return {
    configured: result.configured === true,
    siteUrl: typeof result.siteUrl === "string" ? result.siteUrl : null,
    startDate: typeof result.startDate === "string" ? result.startDate : null,
    endDate: typeof result.endDate === "string" ? result.endDate : null,
    rows: rows.map((row) => {
      const item = asRecord(row);
      return {
        query: String(item.query ?? ""),
        page: String(item.page ?? ""),
        clicks: Number(item.clicks ?? 0),
        impressions: Number(item.impressions ?? 0),
        ctr: Number(item.ctr ?? 0),
        position: Number(item.position ?? 0),
      };
    }),
    error: typeof result.error === "string" ? result.error : undefined,
  };
}

function pagesFromRun(
  run: Awaited<ReturnType<typeof getLatestRun>>,
): AnalyzedPage[] {
  if (!run) return [];
  const pages = asRecord(run.result).pages;
  if (!Array.isArray(pages)) return [];
  return pages as AnalyzedPage[];
}

async function resolvePages(): Promise<AnalyzedPage[]> {
  const latest = await getLatestRun("site_analysis");
  const cached = pagesFromRun(latest);
  if (cached.length > 0) return cached;
  return crawlPublicPages();
}

async function resolveGsc(): Promise<SearchConsoleResult | null> {
  const latest = await getLatestRun("search_console");
  const fromRun = gscFromLatest(latest);
  if (fromRun) return fromRun;
  return fetchSearchConsolePerformance();
}

export async function jobFetchSearchConsole(input?: {
  startDate?: string;
  endDate?: string;
}) {
  const run = await insertRun({
    runType: "search_console",
    input: { startDate: input?.startDate ?? null, endDate: input?.endDate ?? null },
  });

  try {
    const result = await fetchSearchConsolePerformance(input);
    const failed = Boolean(result.error && result.configured);
    await updateRun(run.id, {
      status: failed ? "failed" : "succeeded",
      result: { ...result },
    });
    return { runId: run.id, result };
  } catch (error) {
    const message = errorMessage(error);
    await updateRun(run.id, {
      status: "failed",
      result: { error: message },
    });
    throw error;
  }
}

export async function jobRunSiteAnalysis(input?: { includeGsc?: boolean }) {
  const run = await insertRun({
    runType: "site_analysis",
    input: { includeGsc: input?.includeGsc !== false },
  });

  try {
    const pages = await crawlPublicPages();
    const heuristic = heuristicSeoFlags(pages);
    const searchConsole =
      input?.includeGsc === false ? null : await resolveGsc();

    let analysis: Record<string, unknown> = {
      note: "AI analysis skipped",
    };
    try {
      analysis = await analyzeSiteWithAi({
        pages,
        searchConsole,
        heuristic,
      });
    } catch (error) {
      analysis = {
        error: errorMessage(error),
        heuristic,
      };
    }

    const recs = mapRecommendationItems(analysis);
    const savedRecs = await insertRecommendations(
      recs.map((item) => ({
        category: item.category,
        title: item.title,
        description: item.description,
        priority: item.priority,
        data: item.data,
      })),
    );

    await updateRun(run.id, {
      status: "succeeded",
      result: {
        pageCount: pages.length,
        pages,
        heuristic,
        searchConsole,
        analysis,
        recommendationIds: savedRecs.map((item) => item.id),
      },
    });

    return { runId: run.id, pageCount: pages.length };
  } catch (error) {
    await updateRun(run.id, {
      status: "failed",
      result: { error: errorMessage(error) },
    });
    throw error;
  }
}

export async function jobDiscoverOpportunities() {
  const run = await insertRun({ runType: "content_opportunities" });

  try {
    const pages = await resolvePages();
    const searchConsole = await resolveGsc();
    const latestSeo = await getLatestRun("site_analysis");
    const latestMarket = await getLatestRun("market_research");
    const latestSeoAnalysis = latestSeo
      ? asRecord(asRecord(latestSeo.result).analysis)
      : null;
    const marketSignals = Array.isArray(asRecord(latestMarket?.result).signals)
      ? (asRecord(latestMarket?.result).signals as unknown[])
      : [];
    const analysis = await discoverOpportunitiesWithAi({
      pages,
      searchConsole,
      latestSeo: latestSeoAnalysis,
      competitorGaps: (await listCompetitorGaps(40).catch(() => [])).map(
        (gap) => ({
          title: gap.title,
          gapType: gap.gapType,
          description: gap.description,
          priority: gap.priority,
        }),
      ),
      marketSignals: marketSignals.slice(0, 20).map((item) => {
        const row = asRecord(item);
        return {
          query: typeof row.query === "string" ? row.query : undefined,
          summary: String(row.summary ?? ""),
          signalType: String(row.signalType ?? "other"),
        };
      }),
    });
    const ideas = parseIdeaRecords(analysis);
    if (ideas.length === 0) {
      throw new Error("AI がコンテンツ案を返しませんでした。");
    }
    const saved = await insertIdeas(ideas);
    await insertRecommendations(
      saved.slice(0, 8).map((idea) => ({
        category: "content" as const,
        title: idea.title,
        description: idea.reasoning,
        priority: idea.priority,
        data: {
          ideaId: idea.id,
          targetKeyword: idea.targetKeyword,
          searchIntent: idea.searchIntent,
        },
      })),
    );

    await updateRun(run.id, {
      status: "succeeded",
      result: { ideaIds: saved.map((idea) => idea.id), analysis },
    });
    return { runId: run.id, count: saved.length };
  } catch (error) {
    await updateRun(run.id, {
      status: "failed",
      result: { error: errorMessage(error) },
    });
    throw error;
  }
}

export async function jobGenerateArticle(ideaId: string) {
  const idea = await getIdeaById(ideaId);
  if (!idea) throw new Error("記事案が見つかりません。");

  const run = await insertRun({
    runType: "article_draft",
    input: { ideaId },
  });

  try {
    const draftPayload = await generateArticleDraftWithAi({ idea });
    const draft = await insertDraft({
      ideaId: idea.id,
      title: draftPayload.title,
      slug: draftPayload.slug,
      metaTitle: draftPayload.metaTitle,
      metaDescription: draftPayload.metaDescription,
      content: draftPayload.content,
      language: "en",
      seoNotes: draftPayload.seoNotes,
      geoNotes: draftPayload.geoNotes,
    });
    await updateRun(run.id, {
      status: "succeeded",
      result: { draftId: draft.id, extras: draftPayload.extras },
    });
    return { runId: run.id, draftId: draft.id };
  } catch (error) {
    await updateRun(run.id, {
      status: "failed",
      result: { error: errorMessage(error), ideaId },
    });
    throw error;
  }
}

export async function jobProposeGeo(draftId?: string) {
  const run = await insertRun({
    runType: "geo",
    input: { draftId: draftId ?? null },
  });

  try {
    const pages = await resolvePages();
    const draft = draftId ? await getDraftById(draftId) : null;
    const analysis = await proposeGeoWithAi({
      pages,
      draftTitle: draft?.title ?? null,
      draftExcerpt: draft?.content.slice(0, 2500) ?? null,
    });
    const recs = mapRecommendationItems(analysis).map((item) => ({
      ...item,
      category: "geo" as const,
    }));
    const saved = await insertRecommendations(recs);
    await updateRun(run.id, {
      status: "succeeded",
      result: { analysis, recommendationIds: saved.map((item) => item.id) },
    });
    return { runId: run.id, count: saved.length };
  } catch (error) {
    await updateRun(run.id, {
      status: "failed",
      result: { error: errorMessage(error) },
    });
    throw error;
  }
}

export async function jobProposeInternalLinks() {
  const run = await insertRun({ runType: "internal_links" });

  try {
    const pages = await resolvePages();
    const analysis = await proposeInternalLinksWithAi({ pages });
    const links = parseInternalLinks(analysis);
    const saved = await insertRecommendations(
      links.map((link) => ({
        category: "internal_link" as const,
        title: `${link.sourcePath} → ${link.targetPath}`,
        description: `${link.anchor ? `Anchor: “${link.anchor}”. ` : ""}${link.reason}`,
        priority: link.priority,
        data: link,
      })),
    );
    await updateRun(run.id, {
      status: "succeeded",
      result: { links, recommendationIds: saved.map((item) => item.id) },
    });
    return { runId: run.id, count: saved.length };
  } catch (error) {
    await updateRun(run.id, {
      status: "failed",
      result: { error: errorMessage(error) },
    });
    throw error;
  }
}

export async function jobGenerateSocial(input?: {
  pagePath?: string;
  draftId?: string;
}) {
  const origin = getSiteUrl();
  const catalog = listSocialTargetPages("en");
  if (catalog.length === 0) {
    throw new Error(PUBLIC_URL_MISSING);
  }

  const pastRecs = (await listRecommendations(80).catch(() => [])).filter(
    (item) =>
      item.category === "social" &&
      asString(item.data.kind) !== "ja_partner_pr",
  );
  const pastThemes: PastSocialTheme[] = pastRecs.map((item) => ({
    theme: asString(item.data.theme) || item.title,
    angle: asString(item.data.angle) || undefined,
  }));

  const theme = await pickSocialTheme({
    pastThemes,
    catalog,
    siteOrigin: origin,
  });
  if (input?.pagePath) {
    const hinted = resolvePublishedPageOrThrow(input.pagePath);
    theme.relatedPagePath = hinted.path;
  }

  const run = await insertRun({
    runType: "social",
    input: {
      theme: theme.theme,
      angle: theme.angle,
      autoPost: false,
    },
  });

  try {
    const pack = await buildVerifiedSocialPack({ theme });
    const saved = await insertRecommendations([
      {
        category: "social",
        title: `Social: ${pack.theme.theme}`,
        description: `${pack.theme.angle}\n公開URL: ${pack.page.url}`,
        priority: "medium",
        data: {
          kind: "en_social",
          theme: pack.theme.theme,
          angle: pack.theme.angle,
          whyNow: pack.theme.whyNow,
          pagePath: pack.page.path,
          publishedUrl: pack.page.url,
          posts: pack.posts,
          autoPost: false,
        },
      },
    ]);
    await persistGeneratedSocialPosts(pack.posts, saved[0]?.id);
    await updateRun(run.id, {
      status: "succeeded",
      result: {
        theme: pack.theme,
        posts: pack.posts,
        publishedUrl: pack.page.url,
        recommendationIds: saved.map((item) => item.id),
        autoPost: false,
      },
    });
    return { runId: run.id };
  } catch (error) {
    await updateRun(run.id, {
      status: "failed",
      result: { error: errorMessage(error) },
    });
    throw error;
  }
}

export async function jobGenerateJapanesePartnerPr(pagePath: string) {
  const page = resolvePublishedPageOrThrow(pagePath);
  if (page.language !== "ja") {
    throw new Error(JA_PUBLIC_URL_MISSING);
  }
  const live = await assertPublishedUrlLive(page.url);
  const origin = getSiteUrl();
  const pageTitle =
    usableFetchedPageText(live.title) ||
    usableFetchedPageText(live.h1) ||
    page.label;
  const pageExcerpt = usableFetchedPageText(live.description) || page.label;

  const run = await insertRun({
    runType: "social",
    input: {
      kind: "ja_partner_pr",
      pagePath: page.path,
      canonicalUrl: page.url,
      autoPost: false,
    },
  });

  try {
    const rawPosts = await generateJapanesePartnerPrWithAi({
      title: pageTitle,
      canonicalUrl: page.url,
      siteOrigin: origin,
      pagePath: page.path,
      excerpt: pageExcerpt,
    });
    const posts = sanitizeSocialPayload(rawPosts, page.url, origin);
    const saved = await insertRecommendations([
      {
        category: "social",
        title: `日本語PR: ${page.label}`,
        description: `日本語SNS広報（販売パートナー向け・自動投稿なし）\n公開URL: ${page.url}`,
        priority: "medium",
        data: {
          kind: "ja_partner_pr",
          pagePath: page.path,
          publishedUrl: page.url,
          posts,
          autoPost: false,
        },
      },
    ]);
    await persistGeneratedSocialPosts(posts, saved[0]?.id);
    await updateRun(run.id, {
      status: "succeeded",
      result: {
        posts,
        publishedUrl: page.url,
        recommendationIds: saved.map((item) => item.id),
        autoPost: false,
      },
    });
    return { runId: run.id };
  } catch (error) {
    await updateRun(run.id, {
      status: "failed",
      result: { error: errorMessage(error) },
    });
    throw error;
  }
}

export async function jobMarketResearch() {
  const run = await insertRun({ runType: "market_research" });
  try {
    const { runMarketResearchSearches } = await import(
      "@/lib/marketing-agent/research"
    );
    const result = await runMarketResearchSearches();
    await insertRecommendations(
      result.signals.slice(0, 15).map((signal) => ({
        category: "market_signal" as const,
        title: signal.contentOpportunity || signal.summary.slice(0, 80),
        description: [
          signal.summary,
          signal.potentialLead ? "潜在リード候補（公開情報のみ。自動連絡しない）" : "",
          signal.query ? `query: ${signal.query}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        priority: signal.relevance,
        data: { ...signal },
      })),
    );
    await updateRun(run.id, {
      status: "succeeded",
      result: {
        agentReach: result.agentReach,
        searches: result.searches,
        signals: result.signals,
        autoOutreach: false,
      },
    });
    return { runId: run.id, count: result.signals.length };
  } catch (error) {
    await updateRun(run.id, {
      status: "failed",
      result: { error: errorMessage(error) },
    });
    throw error;
  }
}

export async function jobCompetitorAnalysis() {
  const run = await insertRun({ runType: "competitor_analysis" });
  try {
    const {
      discoverCompetitorUrls,
      searchPublicSocialMentions,
    } = await import("@/lib/marketing-agent/research");
    const {
      analyzeCompetitorsWithAi,
      parseCompetitorRecords,
      parseGapRecords,
      parseCompetitorIdeaRecords,
      snapshotPublicCompetitorPage,
    } = await import("@/lib/marketing-agent/competitors");
    const { listPublicCatalogPages } = await import(
      "@/lib/marketing-agent/site-catalog"
    );

    const discovered = await discoverCompetitorUrls();
    const snapshots = [];
    for (const hit of discovered.urls.slice(0, 8)) {
      snapshots.push(await snapshotPublicCompetitorPage(hit.url));
    }
    const social = await searchPublicSocialMentions();
    const latestMarket = await getLatestRun("market_research");
    const marketSignals = Array.isArray(asRecord(latestMarket?.result).signals)
      ? (asRecord(latestMarket?.result).signals as unknown[])
      : [];

    const analysis = await analyzeCompetitorsWithAi({
      snapshots,
      socialHits: social.hits,
      socialNote: social.note,
      brandBridgePages: listPublicCatalogPages()
        .filter((page) => page.seoImportance === "high")
        .map((page) => ({ path: page.path || "/", title: page.label })),
      marketSignals: marketSignals.slice(0, 20).map((item) => {
        const row = asRecord(item);
        return {
          source: String(row.source ?? "jina"),
          url: String(row.url ?? ""),
          date: typeof row.date === "string" ? row.date : null,
          companyPerson:
            typeof row.companyPerson === "string" ? row.companyPerson : null,
          signalType:
            row.signalType === "demand" ||
            row.signalType === "competitor" ||
            row.signalType === "content" ||
            row.signalType === "partner_search"
              ? row.signalType
              : "other",
          summary: String(row.summary ?? ""),
          relevance:
            row.relevance === "high" || row.relevance === "low"
              ? row.relevance
              : "medium",
          potentialLead: row.potentialLead === true,
          contentOpportunity:
            typeof row.contentOpportunity === "string"
              ? row.contentOpportunity
              : null,
          query: typeof row.query === "string" ? row.query : undefined,
        };
      }),
    });

    const parsed = parseCompetitorRecords(analysis);
    const savedCompetitors = await insertCompetitors(parsed);
    const urlToId = new Map(
      savedCompetitors.map((item) => [(item.url || "").toLowerCase(), item.id]),
    );
    const gaps = parseGapRecords(analysis).map((gap) => ({
      ...gap,
      competitorId: gap.competitorUrl
        ? urlToId.get(gap.competitorUrl.toLowerCase()) ?? null
        : null,
    }));
    const savedGaps = await insertCompetitorGaps(gaps);
    const ideas = parseCompetitorIdeaRecords(analysis);
    if (ideas.length > 0) {
      await insertIdeas(ideas);
    }
    await insertRecommendations(
      savedGaps.slice(0, 12).map((gap) => ({
        category:
          gap.gapType === "differentiation" || gap.gapType === "competitive_gap"
            ? ("differentiation" as const)
            : ("competitor" as const),
        title: gap.title,
        description: gap.description,
        priority: gap.priority,
        data: { gapId: gap.id, gapType: gap.gapType, ...gap.data },
      })),
    );

    await updateRun(run.id, {
      status: "succeeded",
      result: {
        discoveryErrors: discovered.errors,
        snapshotCount: snapshots.length,
        social: { available: social.available, note: social.note, hitCount: social.hits.length },
        competitorIds: savedCompetitors.map((item) => item.id),
        gapIds: savedGaps.map((item) => item.id),
        autoOutreach: false,
        copiedCompetitorContent: false,
      },
    });
    return {
      runId: run.id,
      competitors: savedCompetitors.length,
      gaps: savedGaps.length,
    };
  } catch (error) {
    await updateRun(run.id, {
      status: "failed",
      result: { error: errorMessage(error) },
    });
    throw error;
  }
}

/**
 * Future cron entrypoint. v1 does not schedule this.
 * Weekly: GSC fetch → site/SEO analysis → content opportunities.
 * Never publishes or sends posts.
 */
export async function runWeeklyMarketingPipeline(): Promise<{
  searchConsoleRunId: string;
  analysisRunId: string;
  opportunitiesRunId: string;
}> {
  const gsc = await jobFetchSearchConsole();
  const analysis = await jobRunSiteAnalysis({ includeGsc: true });
  const opportunities = await jobDiscoverOpportunities();
  const pipeline = await insertRun({
    runType: "weekly_pipeline",
    status: "succeeded",
    input: { automated: false },
  });
  await updateRun(pipeline.id, {
    status: "succeeded",
    result: {
      searchConsoleRunId: gsc.runId,
      analysisRunId: analysis.runId,
      opportunitiesRunId: opportunities.runId,
    },
  });
  return {
    searchConsoleRunId: gsc.runId,
    analysisRunId: analysis.runId,
    opportunitiesRunId: opportunities.runId,
  };
}
