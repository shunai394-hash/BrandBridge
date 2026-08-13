import { chatCompletion } from "./ai";
import { parseJsonFromAi } from "./json";
import { performancePrompt, scalingPrompt, SYSTEM_MARKETER } from "./prompts";
import { heuristicPerformanceRecs } from "./performance";
import type { GrowthDashboard, Priority, RecommendationCategory } from "./types";

export type EngineRecommendation = {
  category: RecommendationCategory;
  title: string;
  body: string;
  priority: Priority;
};

export async function recommendFromPerformance(
  dashboard: GrowthDashboard,
): Promise<{ summary: string; recommendations: EngineRecommendation[] }> {
  const fallback = heuristicPerformanceRecs(dashboard);
  const ai = await chatCompletion(
    [
      { role: "system", content: SYSTEM_MARKETER },
      {
        role: "user",
        content: performancePrompt(JSON.stringify(dashboard).slice(0, 8000)),
      },
    ],
    { temperature: 0.3, maxTokens: 1600 },
  );
  if (ai.ok) {
    const parsed = parseJsonFromAi<{
      summary?: string;
      recommendations?: EngineRecommendation[];
    }>(ai.text);
    if (parsed?.recommendations?.length) {
      return {
        summary: parsed.summary || "Performance analysis complete",
        recommendations: parsed.recommendations,
      };
    }
  }
  return {
    summary: dashboard.scalingMessage,
    recommendations: fallback,
  };
}

export async function recommendScaling(
  dashboard: GrowthDashboard,
): Promise<{ summary: string; recommendations: EngineRecommendation[] }> {
  if (!dashboard.scalingReady) {
    return {
      summary: dashboard.scalingMessage,
      recommendations: [
        {
          category: "scaling",
          title: "少数媒体・少量投稿を継続",
          body: "30日程度のデータが揃うまで dailyLimit / weeklyLimit を上げないでください。AIはSNSアカウントを作成しません。",
          priority: "high",
        },
      ],
    };
  }
  const ai = await chatCompletion(
    [
      { role: "system", content: SYSTEM_MARKETER },
      {
        role: "user",
        content: scalingPrompt(JSON.stringify(dashboard).slice(0, 8000)),
      },
    ],
    { temperature: 0.2, maxTokens: 1200 },
  );
  if (ai.ok) {
    const parsed = parseJsonFromAi<{
      summary?: string;
      recommendations?: EngineRecommendation[];
    }>(ai.text);
    if (parsed?.recommendations?.length) {
      return {
        summary: parsed.summary || "Scaling candidates ready",
        recommendations: parsed.recommendations,
      };
    }
  }
  const top = dashboard.topPlatforms[0]?.name || "x";
  return {
    summary: "勝ち筋候補を提案します（自動では増やしません）",
    recommendations: [
      {
        category: "scaling",
        title: `${top} の週次上限を +1 する候補`,
        body: "管理者が承認した場合のみ weeklyLimit を1増やしてください。新しいSNSアカウントは人間が作成・接続します。",
        priority: "medium",
      },
    ],
  };
}
