import type {
  GrowthDashboard,
  NamedScore,
  PerformanceRow,
  PerformanceTotals,
  SocialPost,
} from "./types";

function emptyTotals(): PerformanceTotals {
  return {
    impressions: 0,
    clicks: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    followers: 0,
    engagement: 0,
    referralTraffic: 0,
    leads: 0,
    registrations: 0,
  };
}

function topBy(
  rows: PerformanceRow[],
  key: keyof PerformanceRow,
  score: (row: PerformanceRow) => number,
): NamedScore[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const name = String(row[key] ?? "").trim();
    if (!name) continue;
    map.set(name, (map.get(name) ?? 0) + score(row));
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, score: value }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function impact(row: PerformanceRow): number {
  return (
    row.registrations * 20 +
    row.leads * 8 +
    row.referralTraffic * 3 +
    row.clicks * 2 +
    row.engagement
  );
}

export function buildGrowthDashboard(params: {
  opportunityCount: number;
  scheduledPosts: SocialPost[];
  publishedPosts: SocialPost[];
  accountCount: number;
  mentionCount: number;
  performance: PerformanceRow[];
  earliestPerformance: string | null;
}): GrowthDashboard {
  const totals = params.performance.reduce((acc, row) => {
    acc.impressions += row.impressions;
    acc.clicks += row.clicks;
    acc.likes += row.likes;
    acc.comments += row.comments;
    acc.shares += row.shares;
    acc.followers = Math.max(acc.followers, row.followers);
    acc.engagement += row.engagement;
    acc.referralTraffic += row.referralTraffic;
    acc.leads += row.leads;
    acc.registrations += row.registrations;
    return acc;
  }, emptyTotals());

  const days =
    params.earliestPerformance != null
      ? Math.floor(
          (Date.now() - new Date(params.earliestPerformance).getTime()) /
            86400000,
        )
      : 0;
  const scalingReady = days >= 30 && params.performance.length >= 5;

  return {
    opportunityCount: params.opportunityCount,
    scheduledCount: params.scheduledPosts.length,
    publishedCount: params.publishedPosts.length,
    accountCount: params.accountCount,
    mentionCount: params.mentionCount,
    totals,
    topCountries: topBy(params.performance, "country", impact),
    topPlatforms: topBy(params.performance, "platform", impact),
    topTopics: topBy(params.performance, "topic", impact),
    topKeywords: topBy(params.performance, "keyword", impact),
    topFormats: topBy(params.performance, "format", impact),
    topCtas: topBy(params.performance, "cta", impact),
    topArticles: topBy(params.performance, "contentId", impact),
    topPosts: topBy(params.performance, "postId", impact),
    scalingReady,
    scalingMessage: scalingReady
      ? "約30日以上のデータがあります。勝ち媒体・国・テーマを増やせる候補を提案できます。SNSアカウントの自動作成はしません。"
      : `データ蓄積中（${days}日 / 目安30日）。少数媒体・少量投稿を続けてから配信量を検討してください。`,
  };
}

export function heuristicPerformanceRecs(dashboard: GrowthDashboard): {
  category: "performance" | "growth" | "scaling" | "content";
  title: string;
  body: string;
  priority: "high" | "medium" | "low";
}[] {
  const recs: {
    category: "performance" | "growth" | "scaling" | "content";
    title: string;
    body: string;
    priority: "high" | "medium" | "low";
  }[] = [];

  if (dashboard.topTopics[0]) {
    recs.push({
      category: "content",
      title: `このテーマを増やす: ${dashboard.topTopics[0].name}`,
      body: "流入・リードへの寄与が高いテーマです。同じ意図の英語記事とFAQを追加してください。",
      priority: "high",
    });
  }
  if (dashboard.topPlatforms[0]) {
    recs.push({
      category: "growth",
      title: `この媒体を強化する: ${dashboard.topPlatforms[0].name}`,
      body: "投稿上限を少し上げる前に、承認フローと公式API接続を確認してください。",
      priority: "medium",
    });
  }
  if (dashboard.topCountries[0]) {
    recs.push({
      category: "growth",
      title: `この国向けの記事を増やす: ${dashboard.topCountries[0].name}`,
      body: "初期は英語のまま、国別の事例とパートナー要件を足してください。",
      priority: "medium",
    });
  }
  if (dashboard.topArticles[0]) {
    recs.push({
      category: "content",
      title: "この記事を更新する",
      body: `成績の良い記事 ${dashboard.topArticles[0].name} に最新のFAQ・内部リンク・定義段落を足してください。既存公開ページは上書きせず、差分をCMS下書きとして保存します。`,
      priority: "medium",
    });
  }
  if (!dashboard.scalingReady) {
    recs.push({
      category: "scaling",
      title: "まだ大量展開しない",
      body: dashboard.scalingMessage,
      priority: "high",
    });
  }
  if (dashboard.totals.registrations === 0 && dashboard.publishedCount > 0) {
    recs.push({
      category: "performance",
      title: "投稿数ではなく登録につながるかを見る",
      body: "UTM付きCTA（/en/register/maker または /en/register/partner）を全投稿に付け、手動でリード/登録を記録してください。",
      priority: "high",
    });
  }
  return recs;
}
