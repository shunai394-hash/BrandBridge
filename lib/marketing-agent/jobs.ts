import { getAiStatus } from "./ai";
import { analyzeCompetitors } from "./competitors";
import { generateArticleDraft, generateOpportunities } from "./content";
import {
  buildGrowthDashboard,
} from "./performance";
import { recommendFromPerformance, recommendScaling } from "./growth";
import {
  discoverPlatformTargets,
  getAgentReachConnection,
  runMarketResearchSearches,
  searchPublicSocialMentions,
} from "./research";
import { fetchSearchConsoleRows, getSearchConsoleConnection } from "./search-console";
import { analyzeExistingPages } from "./seo";
import { attachUtm, repurposeArticle } from "./social";
import {
  earliestPerformanceDate,
  finishRun,
  getContent,
  getOpportunity,
  insertBrandMentions,
  insertCalendarEntry,
  insertContent,
  insertGaps,
  insertGlobalSignals,
  insertOpportunities,
  insertRecommendations,
  insertRun,
  insertSocialPost,
  listBrandMentions,
  listCalendar,
  listContents,
  listGaps,
  listGlobalSignals,
  listOpportunities,
  listPerformance,
  listPlatformTargets,
  listRecentRuns,
  listRecommendations,
  listSocialAccounts,
  listSocialPosts,
  listCompetitors,
  insertPlatformTargets,
  marketingTablesReady,
  updateOpportunityStatus,
  upsertCompetitor,
} from "./store";
import type { JobResult, SocialPlatform } from "./types";

const ALL_PLATFORMS: SocialPlatform[] = [
  "brandbridge_blog",
  "medium",
  "substack",
  "linkedin",
  "x",
  "instagram",
  "tiktok",
  "youtube",
  "reddit",
];

async function startJob(
  runType: Parameters<typeof insertRun>[0]["runType"],
  userId: string | null,
  input?: Record<string, unknown>,
): Promise<{ ok: true; runId: string } | { ok: false; message: string }> {
  const run = await insertRun({ runType, createdBy: userId, input });
  if ("error" in run) {
    return { ok: false, message: run.error };
  }
  return { ok: true, runId: run.id };
}

export async function jobSiteAnalysis(userId: string | null): Promise<JobResult> {
  const started = await startJob("site_analysis", userId);
  if (!started.ok) return started;
  try {
    const snapshots = await analyzeExistingPages(10);
    const missing = snapshots.filter(
      (s) => s.ok && (!s.metaDescription || !s.h1),
    );
    await insertRecommendations(
      missing.map((s) => ({
        runId: started.runId,
        category: "seo" as const,
        title: `SEO不足: ${s.path}`,
        body: `title=${s.title ?? "なし"} / meta=${s.metaDescription ?? "なし"} / h1=${s.h1 ?? "なし"}`,
        priority: "medium" as const,
        relatedUrl: s.path,
      })),
    );
    await finishRun(started.runId, {
      status: "completed",
      summary: `${snapshots.length} ページを確認、SEO不足 ${missing.length} 件`,
      output: { snapshots },
    });
    return { ok: true, message: "サイト分析を保存しました", runId: started.runId };
  } catch (error) {
    await finishRun(started.runId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "site analysis failed",
    });
    return { ok: false, message: "サイト分析に失敗しました", runId: started.runId };
  }
}

export async function jobSearchConsole(userId: string | null): Promise<JobResult> {
  const started = await startJob("search_console", userId);
  if (!started.ok) return started;
  const status = await fetchSearchConsoleRows();
  await finishRun(started.runId, {
    status: "completed",
    summary: status.message,
    output: { status },
  });
  if (status.rows?.length) {
    await insertRecommendations(
      status.rows.slice(0, 5).map((row) => ({
        runId: started.runId,
        category: "keyword" as const,
        title: `GSC: ${row.keys.join(" / ")}`,
        body: `impressions=${row.impressions} clicks=${row.clicks} position=${row.position.toFixed(1)}`,
        priority: row.impressions > 100 ? "high" : "medium",
      })),
    );
  }
  return { ok: true, message: status.message, runId: started.runId };
}

export async function jobMarketResearch(userId: string | null): Promise<JobResult> {
  const started = await startJob("market_research", userId);
  if (!started.ok) return started;
  try {
    const signals = await runMarketResearchSearches();
    await insertGlobalSignals(
      signals.slice(0, 30).map((s) => ({
        country: s.country || "global",
        language: s.language || "en",
        topic: s.signalType,
        demand: s.summary,
        contentOpportunity: s.contentOpportunity,
        traffic: 0,
        leads: s.potentialLead ? 1 : 0,
        registrations: 0,
        source: s.source,
        sourceUrl: s.url,
        relevance: s.relevance,
      })),
    );
    await insertRecommendations(
      signals.slice(0, 5).map((s) => ({
        runId: started.runId,
        category: "market_signal" as const,
        title: s.companyPerson.slice(0, 80),
        body: s.summary,
        priority: s.relevance === "high" ? "high" : "medium",
        relatedUrl: s.url,
      })),
    );
    await finishRun(started.runId, {
      status: "completed",
      summary: `市場シグナル ${signals.length} 件`,
      output: { count: signals.length },
    });
    return {
      ok: true,
      message: `市場リサーチ ${signals.length} 件を保存しました`,
      runId: started.runId,
    };
  } catch (error) {
    await finishRun(started.runId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "research failed",
    });
    return { ok: false, message: "市場リサーチに失敗しました", runId: started.runId };
  }
}

export async function jobCompetitorAnalysis(
  userId: string | null,
): Promise<JobResult> {
  const started = await startJob("competitor_analysis", userId);
  if (!started.ok) return started;
  try {
    const analyzed = await analyzeCompetitors();
    const ids: string[] = [];
    for (const c of analyzed.competitors) {
      const id = await upsertCompetitor(c);
      if (id) ids.push(id);
    }
    const firstId = ids[0] ?? null;
    await insertGaps(
      analyzed.gaps.map((g) => ({ ...g, competitorId: firstId })),
    );
    await insertRecommendations(
      analyzed.gaps.slice(0, 6).map((g) => ({
        runId: started.runId,
        category:
          g.gapType === "differentiation" ? "differentiation" : "competitor",
        title: g.title,
        body: g.detail || g.title,
        priority: g.priority,
      })),
    );
    await finishRun(started.runId, {
      status: "completed",
      summary: `競合 ${analyzed.competitors.length} / ギャップ ${analyzed.gaps.length}`,
      output: { competitors: analyzed.competitors.length },
    });
    return {
      ok: true,
      message: "Competitor Analysis を保存しました",
      runId: started.runId,
    };
  } catch (error) {
    await finishRun(started.runId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "competitor failed",
    });
    return {
      ok: false,
      message: "Competitor Analysis に失敗しました",
      runId: started.runId,
    };
  }
}

export async function jobDiscoverOpportunities(
  userId: string | null,
): Promise<JobResult> {
  const started = await startJob("content_opportunities", userId);
  if (!started.ok) return started;
  try {
    const [gaps, signalsRows, snapshots, gsc] = await Promise.all([
      listGaps(),
      listGlobalSignals(),
      analyzeExistingPages(8),
      fetchSearchConsoleRows(),
    ]);
    const signals = signalsRows.map((s) => ({
      source: s.source || "global_signal",
      url: s.sourceUrl || "",
      date: s.createdAt.slice(0, 10),
      companyPerson: s.topic,
      signalType: s.topic,
      summary: s.demand || s.topic,
      relevance: s.relevance || "medium",
      potentialLead: s.leads > 0,
      contentOpportunity: s.contentOpportunity || s.topic,
      country: s.country,
      language: s.language,
    }));
    const ideas = await generateOpportunities({
      gaps,
      signals,
      snapshots,
      gsc,
    });
    const saved = await insertOpportunities(ideas);
    await insertRecommendations(
      saved.slice(0, 6).map((o) => ({
        runId: started.runId,
        category: "content" as const,
        title: o.title,
        body: o.reason || o.topic || "",
        priority: o.priority,
      })),
    );
    await finishRun(started.runId, {
      status: "completed",
      summary: `機会 ${saved.length} 件`,
      output: { count: saved.length },
    });
    return {
      ok: true,
      message: `今書くべき記事を ${saved.length} 件提案しました`,
      runId: started.runId,
    };
  } catch (error) {
    await finishRun(started.runId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "opportunities failed",
    });
    return { ok: false, message: "機会発見に失敗しました", runId: started.runId };
  }
}

export async function jobGenerateArticle(
  userId: string | null,
  opportunityId: string,
): Promise<JobResult & { contentId?: string }> {
  const started = await startJob("article_draft", userId, { opportunityId });
  if (!started.ok) return started;
  const opportunity = await getOpportunity(opportunityId);
  if (!opportunity) {
    await finishRun(started.runId, {
      status: "failed",
      errorMessage: "opportunity not found",
    });
    return { ok: false, message: "機会が見つかりません", runId: started.runId };
  }
  try {
    const draft = await generateArticleDraft(opportunity);
    draft.createdBy = userId;
    const saved = await insertContent(draft);
    if ("error" in saved) {
      await finishRun(started.runId, {
        status: "failed",
        errorMessage: saved.error,
      });
      return { ok: false, message: saved.error, runId: started.runId };
    }
    await updateOpportunityStatus(opportunityId, "draft");
    await finishRun(started.runId, {
      status: "completed",
      summary: saved.title,
      output: { contentId: saved.id },
    });
    return {
      ok: true,
      message: "記事下書きを作成しました（既存公開ページは未変更）",
      runId: started.runId,
      contentId: saved.id,
    };
  } catch (error) {
    await finishRun(started.runId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "draft failed",
    });
    return { ok: false, message: "記事生成に失敗しました", runId: started.runId };
  }
}

export async function jobRepurpose(
  userId: string | null,
  contentId: string,
): Promise<JobResult> {
  const started = await startJob("repurpose", userId, { contentId });
  if (!started.ok) return started;
  const article = await getContent(contentId);
  if (!article) {
    await finishRun(started.runId, {
      status: "failed",
      errorMessage: "content not found",
    });
    return { ok: false, message: "記事が見つかりません", runId: started.runId };
  }
  const accounts = await listSocialAccounts();
  let created = 0;
  for (const platform of ALL_PLATFORMS) {
    const variant = await repurposeArticle(article, platform);
    const utm = attachUtm(platform, article.slug || "brandbridge", article.slug);
    const account = accounts.find(
      (a) => a.platform === platform && a.status === "active",
    );
    const saved = await insertSocialPost({
      contentId: article.id,
      socialAccountId: account?.id ?? null,
      platform,
      format: variant.format,
      title: variant.title,
      body: variant.body,
      hook: variant.hook,
      narration: variant.narration,
      caption: variant.caption,
      hashtags: variant.hashtags,
      cta: variant.cta,
      targetCountry: article.targetCountry,
      targetAudience: article.targetAudience,
      language: article.language,
      status: "draft",
      publishMode: "manual",
      scheduledAt: null,
      publishedAt: null,
      errorMessage: null,
      createdBy: userId,
      ...utm,
    });
    if (!("error" in saved)) {
      created += 1;
      const day = new Date().toISOString().slice(0, 10);
      await insertCalendarEntry({
        calendarDate: day,
        scheduledTime: null,
        platform,
        contentId: article.id,
        postId: saved.id,
        title: variant.title,
        status: "draft",
        targetCountry: article.targetCountry,
        targetAudience: article.targetAudience,
        cta: variant.cta,
      });
    }
  }
  await finishRun(started.runId, {
    status: "completed",
    summary: `${created} 媒体に再構成`,
    output: { created },
  });
  return {
    ok: true,
    message: `各媒体向け原稿を ${created} 件作成しました（同一文章のコピーではありません）`,
    runId: started.runId,
  };
}

export async function jobPlatformDiscovery(
  userId: string | null,
): Promise<JobResult> {
  const started = await startJob("platform_discovery", userId);
  if (!started.ok) return started;
  const targets = await discoverPlatformTargets();
  await insertPlatformTargets(targets);
  const avoid = targets.filter((t) => t.doNotPromote).length;
  await finishRun(started.runId, {
    status: "completed",
    summary: `候補 ${targets.length}（宣伝すべきでない ${avoid}）`,
    output: { count: targets.length, avoid },
  });
  return {
    ok: true,
    message: `コミュニティ候補 ${targets.length} 件（do_not_promote ${avoid}）`,
    runId: started.runId,
  };
}

export async function jobBrandAuthority(userId: string | null): Promise<JobResult> {
  const started = await startJob("brand_authority", userId);
  if (!started.ok) return started;
  const mentions = await searchPublicSocialMentions();
  await insertBrandMentions(
    mentions.slice(0, 20).map((m) => ({
      source: m.source,
      url: m.url,
      snippet: m.summary,
      mentionType: "mention" as const,
      country: m.country || null,
      language: m.language || "en",
      sentiment: "unknown",
    })),
  );
  await insertRecommendations([
    {
      runId: started.runId,
      category: "brand_authority",
      title: "認知は投稿数ではなく流入・登録で評価する",
      body: "Brand mentions と UTM 経由の referral / leads / registrations をセットで見てください。",
      priority: "medium",
    },
  ]);
  await finishRun(started.runId, {
    status: "completed",
    summary: `メンション ${mentions.length} 件`,
    output: { count: mentions.length },
  });
  return {
    ok: true,
    message: `Brand mentions ${mentions.length} 件を保存しました`,
    runId: started.runId,
  };
}

export async function jobPerformanceAnalysis(
  userId: string | null,
): Promise<JobResult> {
  const started = await startJob("performance_analysis", userId);
  if (!started.ok) return started;
  const dashboard = await loadGrowthDashboard();
  const recs = await recommendFromPerformance(dashboard);
  await insertRecommendations(
    recs.recommendations.map((r) => ({
      runId: started.runId,
      category: r.category,
      title: r.title,
      body: r.body,
      priority: r.priority,
    })),
  );
  await finishRun(started.runId, {
    status: "completed",
    summary: recs.summary,
    output: { dashboard },
  });
  return { ok: true, message: recs.summary, runId: started.runId };
}

export async function jobScaling(userId: string | null): Promise<JobResult> {
  const started = await startJob("scaling", userId);
  if (!started.ok) return started;
  const dashboard = await loadGrowthDashboard();
  const recs = await recommendScaling(dashboard);
  await insertRecommendations(
    recs.recommendations.map((r) => ({
      runId: started.runId,
      category: r.category,
      title: r.title,
      body: r.body,
      priority: r.priority,
    })),
  );
  await finishRun(started.runId, {
    status: "completed",
    summary: recs.summary,
    output: { scalingReady: dashboard.scalingReady },
  });
  return { ok: true, message: recs.summary, runId: started.runId };
}

export async function runWeeklyMarketingPipeline(
  userId: string | null,
): Promise<JobResult> {
  const started = await startJob("weekly_pipeline", userId);
  if (!started.ok) return started;
  const steps = [
    await jobSiteAnalysis(userId),
    await jobSearchConsole(userId),
    await jobMarketResearch(userId),
    await jobCompetitorAnalysis(userId),
    await jobDiscoverOpportunities(userId),
    await jobPlatformDiscovery(userId),
    await jobBrandAuthority(userId),
    await jobPerformanceAnalysis(userId),
    await jobScaling(userId),
  ];
  const ok = steps.filter((s) => s.ok).length;
  await finishRun(started.runId, {
    status: "completed",
    summary: `週次パイプライン ${ok}/${steps.length} 成功（自動投稿なし）`,
    output: { steps: steps.map((s) => s.message) },
  });
  return {
    ok: true,
    message: `週次パイプライン完了 ${ok}/${steps.length}（投稿は自動実行しません）`,
    runId: started.runId,
  };
}

export async function loadGrowthDashboard() {
  const [
    opportunities,
    scheduled,
    published,
    accounts,
    mentions,
    performance,
    earliest,
  ] = await Promise.all([
    listOpportunities(),
    listSocialPosts({ status: "scheduled", limit: 50 }),
    listSocialPosts({ status: "published", limit: 50 }),
    listSocialAccounts(),
    listBrandMentions(),
    listPerformance(),
    earliestPerformanceDate(),
  ]);
  return buildGrowthDashboard({
    opportunityCount: opportunities.length,
    scheduledPosts: scheduled,
    publishedPosts: published,
    accountCount: accounts.length,
    mentionCount: mentions.length,
    performance,
    earliestPerformance: earliest,
  });
}

export async function loadMarketingConsole() {
  const [
    ai,
    gsc,
    agentReach,
    runs,
    recommendations,
    opportunities,
    contents,
    competitors,
    gaps,
    accounts,
    posts,
    calendar,
    performance,
    signals,
    targets,
    mentions,
    growth,
    tables,
  ] = await Promise.all([
    Promise.resolve(getAiStatus()),
    Promise.resolve(getSearchConsoleConnection()),
    Promise.resolve(getAgentReachConnection()),
    listRecentRuns(),
    listRecommendations("open"),
    listOpportunities(),
    listContents(),
    listCompetitors(),
    listGaps(20),
    listSocialAccounts(),
    listSocialPosts({ limit: 40 }),
    listCalendar(),
    listPerformance(),
    listGlobalSignals(),
    listPlatformTargets(),
    listBrandMentions(),
    loadGrowthDashboard(),
    marketingTablesReady(),
  ]);

  return {
    ai,
    gsc,
    agentReach,
    runs,
    recommendations,
    opportunities,
    contents,
    competitors,
    gaps,
    accounts,
    posts,
    calendar,
    performance,
    signals,
    targets,
    mentions,
    growth,
    tablesReady: tables.ok,
    tablesMessage: tables.message,
  };
}

export type MarketingConsoleData = Awaited<ReturnType<typeof loadMarketingConsole>>;
