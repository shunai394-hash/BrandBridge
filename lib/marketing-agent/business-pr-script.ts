/**
 * Company / business / brand awareness script. No Case / product required.
 */

import { completeJson, MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  BUSINESS_PR_VIDEO_SCRIPT_TASK,
  systemPrompt,
} from "@/lib/marketing-agent/prompts";
import {
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
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function hasHiragana(text: string): boolean {
  return Array.from(text).some((char) => {
    const c = char.codePointAt(0) ?? 0;
    return c >= 0x3040 && c <= 0x309f;
  });
}

function isLanguageDump(text: string): boolean {
  return /\b(Chinese|English|Spanish|French|Korean|Language)\b(?:[\s,、.。]+\b(?:Chinese|English|Spanish|French|Korean|Language)\b)/i.test(
    text,
  );
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
  const spoken = [script.title, script.hook, script.cta, joinNarration(script)].join(" ");
  return hasHiragana(spoken) && !isLanguageDump(spoken);
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
    images: (brief.imageHints ?? []).map((label, index) => ({ index, label })),
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
                  "前回の出力は使えません。title / hook / narrationText / cta / location / character / action / visual をすべて短い自然な日本語にしてください。商品の売り・価格・購入CTAは禁止。Chinese などの単語の羅列も禁止。JSONのみ。",
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
      lastError = "ナレーションが自然な日本語ではありません。もう一度生成してください。";
      continue;
    }
    return script;
  }

  throw new MarketingAgentError("INVALID_AI_RESPONSE", lastError);
}

export function fallbackBusinessPrScript(brief: BusinessPrBrief): PrVideoScript {
  const scenes: PrVideoScene[] = [
    {
      sceneNumber: 1,
      durationSeconds: 5,
      location: "日本の夜の街",
      character: "海外ブランドの担当者",
      action: "カメラに向かって話す",
      camera: "zoom_in",
      transition: "cut",
      visual: "夜の都市。ブランドの世界観。",
      narrationText: "日本市場に挑戦したい海外ブランドへ。",
      onScreenText: "",
    },
    {
      sceneNumber: 2,
      durationSeconds: 6,
      location: "オフィス",
      character: "ビジネスパーソン",
      action: "対話する",
      camera: "pan_right",
      transition: "dissolve",
      visual: "ビジネスの現場。",
      narrationText: "日本では、商品を売るだけではありません。",
      onScreenText: "",
    },
    {
      sceneNumber: 3,
      durationSeconds: 6,
      location: "打ち合わせスペース",
      character: "パートナー候補",
      action: "握手する",
      camera: "tracking",
      transition: "cut",
      visual: "人と人がつながるイメージ。",
      narrationText: "現地のパートナーとつながることが大切です。",
      onScreenText: "",
    },
    {
      sceneNumber: 4,
      durationSeconds: 6,
      location: "ブランドの空間",
      character: brief.companyName,
      action: "サービスを紹介する",
      camera: "zoom_out",
      transition: "fade",
      visual: "事業の雰囲気。",
      narrationText: `${brief.companyName}が、その橋になります。`,
      onScreenText: "",
    },
    {
      sceneNumber: 5,
      durationSeconds: 7,
      location: "クロージング",
      character: "ナレーター",
      action: "BrandBridgeへ案内する",
      camera: "close",
      transition: "cut",
      visual: "BrandBridge へのアクセス。",
      narrationText: "詳しくはBrandBridgeをご覧ください。",
      onScreenText: "",
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
