/**
 * Company / business / brand awareness video script.
 * Does not require a Case or product facts. Japanese narration only.
 */

import { completeJson, MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  isNaturalJapaneseNarration,
  japaneseNarrationIssues,
} from "@/lib/marketing-agent/japanese-narration";
import {
  BUSINESS_PR_VIDEO_SCRIPT_TASK,
  systemPrompt,
} from "@/lib/marketing-agent/prompts";
import {
  assignSceneImageIndexes,
  normalizePrVideoScript,
  type PrVideoScene,
  type PrVideoScript,
} from "@/lib/marketing-agent/pr-script";

export type BusinessPrBrief = {
  companyName: string;
  brandName?: string;
  businessDescription: string;
  targetAudience: string;
  videoPurpose: string;
  japanMarketRelation?: string;
  mood?: string;
  imageCount: number;
  imageHints?: string[];
};

function presentText(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseBusinessPrBrief(input: {
  companyName?: unknown;
  brandName?: unknown;
  businessDescription?: unknown;
  targetAudience?: unknown;
  videoPurpose?: unknown;
  japanMarketRelation?: unknown;
  mood?: unknown;
  imageCount?: unknown;
  imageHints?: unknown;
}): BusinessPrBrief {
  const companyName = presentText(input.companyName);
  const businessDescription = presentText(input.businessDescription);
  const targetAudience = presentText(input.targetAudience);
  const videoPurpose = presentText(input.videoPurpose);
  if (!companyName || !businessDescription || !targetAudience || !videoPurpose) {
    throw new MarketingAgentError(
      "INVALID_CASE",
      "会社・ブランド名、事業内容、ターゲット、動画の目的を入力してください。",
    );
  }

  const hints = Array.isArray(input.imageHints)
    ? input.imageHints
        .map((item) => presentText(item))
        .filter((item): item is string => item != null)
    : [];

  const rawCount = Number(input.imageCount);
  const imageCount = Number.isFinite(rawCount)
    ? Math.max(hints.length, Math.round(rawCount))
    : hints.length;

  return {
    companyName,
    brandName: presentText(input.brandName) ?? undefined,
    businessDescription,
    targetAudience,
    videoPurpose,
    japanMarketRelation: presentText(input.japanMarketRelation) ?? undefined,
    mood: presentText(input.mood) ?? undefined,
    imageCount,
    imageHints: hints.length > 0 ? hints : undefined,
  };
}

function joinNarration(script: PrVideoScript): string {
  return script.scenes
    .map((scene) => scene.narrationText)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function scriptIsJapanese(script: PrVideoScript): boolean {
  const spoken = [script.title, script.hook, script.cta, joinNarration(script)]
    .filter(Boolean)
    .join(" ");
  const screens = script.scenes.map((scene) => scene.onScreenText).join(" ");
  return (
    isNaturalJapaneseNarration(spoken) &&
    japaneseNarrationIssues(`${spoken} ${screens}`).every(
      (issue) => issue !== "repeated-foreign" && issue !== "language-dump",
    )
  );
}

function narrationIsSpeakableLength(script: PrVideoScript): boolean {
  const spoken = joinNarration(script).replace(/\s+/g, "");
  return Array.from(spoken).length <= 140;
}

function applyImageIndexes(script: PrVideoScript, imageCount: number): PrVideoScript {
  const scenes = assignSceneImageIndexes(
    script.scenes,
    Math.max(1, imageCount),
  );
  return { ...script, scenes };
}

export function fallbackBusinessPrScript(brief: BusinessPrBrief): PrVideoScript {
  const n = Math.max(1, brief.imageCount || 3);
  const scenes: PrVideoScene[] = [
    {
      sceneNumber: 1,
      durationSeconds: 5,
      visual: "夜の都市や日本の街並み。ブランドの世界観。",
      cameraMotion: "zoom-in",
      imageIndex: 0 % n,
      narrationText: "日本市場に挑戦したい海外ブランドへ。",
      onScreenText: "日本市場へ",
    },
    {
      sceneNumber: 2,
      durationSeconds: 6,
      visual: "ビジネスの現場、対話やオフィスのイメージ。",
      cameraMotion: "pan-right",
      imageIndex: 1 % n,
      narrationText: "日本では、商品を売るだけではありません。",
      onScreenText: "売るだけではない",
    },
    {
      sceneNumber: 3,
      durationSeconds: 6,
      visual: "パートナーや人と人がつながるイメージ。",
      cameraMotion: "track",
      imageIndex: 2 % n,
      narrationText: "現地のパートナーとつながることが大切です。",
      onScreenText: "パートナーとつながる",
    },
    {
      sceneNumber: 4,
      durationSeconds: 6,
      visual: "事業やサービスの雰囲気が伝わるブランドイメージ。",
      cameraMotion: "zoom-out",
      imageIndex: 0 % n,
      narrationText: `${brief.companyName}が、その橋になります。`,
      onScreenText: brief.companyName.slice(0, 16),
    },
    {
      sceneNumber: 5,
      durationSeconds: 7,
      visual: "BrandBridge へのアクセスを促すクロージング。",
      cameraMotion: "zoom-in",
      imageIndex: 1 % n,
      narrationText: "詳しくはBrandBridgeをご覧ください。",
      onScreenText: "BrandBridgeへ",
    },
  ];
  return {
    title: `${brief.companyName}の事業紹介`,
    hook: "日本市場に挑戦したい海外ブランドへ。",
    scenes,
    totalDurationSeconds: 30,
    cta: "日本市場への進出を考えているなら、BrandBridgeへ。",
  };
}

export async function generateBusinessPrVideoScript(
  brief: BusinessPrBrief,
): Promise<PrVideoScript> {
  const payload = {
    companyName: brief.companyName,
    brandName: brief.brandName ?? null,
    businessDescription: brief.businessDescription,
    targetAudience: brief.targetAudience,
    videoPurpose: brief.videoPurpose,
    japanMarketRelation: brief.japanMarketRelation ?? null,
    mood: brief.mood ?? null,
    imageCount: Math.max(0, brief.imageCount),
    images: (brief.imageHints ?? []).map((label, index) => ({
      index,
      label,
    })),
    language: "ja",
    goal: "awareness-and-access",
  };

  const messages = [
    { role: "system" as const, content: systemPrompt(BUSINESS_PR_VIDEO_SCRIPT_TASK) },
    { role: "user" as const, content: JSON.stringify(payload) },
  ];

  let lastError = "AI returned invalid JSON. Please try again.";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const raw =
      attempt === 0
        ? await completeJson(messages, { temperature: 0.3, maxTokens: 2500 })
        : await completeJson(
            [
              ...messages,
              {
                role: "user",
                content:
                  "前回の出力は使えません。title / hook / narrationText / onScreenText / cta をすべて自然な短い日本語にしてください。各シーンのナレーションは一文だけ。全体で120文字以内。英語の繰り返しや Chinese などの単語の羅列は禁止です。JSONのみ返してください。",
              },
            ],
            { temperature: 0.15, maxTokens: 2500 },
          );

    const script = normalizePrVideoScript(raw);
    if (!script) {
      lastError = "AI returned invalid JSON. Please try again.";
      continue;
    }
    if (!scriptIsJapanese(script)) {
      lastError =
        "ナレーションが自然な日本語ではありません。もう一度生成してください。";
      continue;
    }
    if (!narrationIsSpeakableLength(script)) {
      lastError =
        "ナレーションが長すぎます。各シーンを短い日本語の一文にしてください。";
      continue;
    }
    return applyImageIndexes(script, Math.max(1, brief.imageCount));
  }

  throw new MarketingAgentError("INVALID_AI_RESPONSE", lastError);
}
