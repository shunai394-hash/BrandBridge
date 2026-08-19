/**
 * Company / business / brand awareness script. No Case / product required.
 */

import { completeJson, isAiConfigured, MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  AUTO_BUSINESS_PR_VIDEO_SCRIPT_TASK,
  BUSINESS_PR_VIDEO_SCRIPT_TASK,
  systemPrompt,
} from "@/lib/marketing-agent/prompts";
import { directCinematography } from "@/lib/marketing-agent/cinematography";
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
  website?: string;
  businessType?: string;
  country?: string;
  services?: string;
  sellingPoints?: string;
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
  website?: unknown;
  businessType?: unknown;
  country?: unknown;
  services?: unknown;
  sellingPoints?: unknown;
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
    website: presentText(input.website) ?? undefined,
    businessType: presentText(input.businessType) ?? undefined,
    country: presentText(input.country) ?? undefined,
    services: presentText(input.services) ?? undefined,
    sellingPoints: presentText(input.sellingPoints) ?? undefined,
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
    return {
      ...script,
      scenes: directCinematography(
        script.scenes,
        `${brief.companyName}|${brief.mood ?? ""}|${brief.imageHints?.join(",") ?? ""}|${Date.now()}`,
      ),
    };
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
    scenes: directCinematography(scenes, `${brief.companyName}|${brief.businessDescription}|${Date.now()}`),
    totalDurationSeconds: 30,
    cta: "日本市場への進出を考えているなら、BrandBridgeへ。",
  };
}

function attachSearchKeywords(script: PrVideoScript): PrVideoScript {
  return {
    ...script,
    scenes: script.scenes.map((scene, index) => ({
      ...scene,
      sceneId: scene.sceneId ?? `scene-${scene.sceneNumber}`,
      visualPrompt: scene.visualPrompt ?? scene.visual,
      searchKeywords:
        scene.searchKeywords && scene.searchKeywords.length > 0
          ? scene.searchKeywords
          : defaultSearchKeywords(scene, index),
      onScreenText:
        scene.onScreenText.trim() ||
        scene.narrationText.replace(/\s+/g, " ").trim().slice(0, 18),
    })),
  };
}

function defaultSearchKeywords(scene: PrVideoScene, index: number): string[] {
  const text = [scene.location, scene.visual, scene.visualPrompt, scene.action]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/cta|brandbridge|締め|closing/.test(text) || index >= 4) {
    return ["Tokyo skyline", "business handshake", "partnership"];
  }
  if (/office|会議|オフィス|desk|商談/.test(text)) {
    return ["business meeting", "Japanese professionals", "modern office"];
  }
  if (/retail|店|棚|shelf/.test(text)) {
    return ["retail store", "Japanese retailer", "product shelves"];
  }
  if (/trade|出荷|港|container|物流/.test(text)) {
    return ["shipping containers", "international trade", "global business"];
  }
  if (/街|tokyo|都市|night|夜/.test(text)) {
    return ["Tokyo business district", "Japanese city street", "modern office"];
  }
  return ["Tokyo business district", "modern office", "business people"];
}

export async function generateAutoBusinessPrVideoScript(
  brief: BusinessPrBrief,
): Promise<PrVideoScript> {
  if (!isAiConfigured()) {
    return attachSearchKeywords(fallbackAutoBusinessPrScript(brief));
  }

  const payload = {
    companyName: brief.companyName,
    brandName: brief.brandName ?? null,
    website: brief.website ?? null,
    description: brief.businessDescription,
    businessType: brief.businessType ?? null,
    targetAudience: brief.targetAudience,
    country: brief.country ?? brief.japanMarketRelation ?? null,
    services: brief.services ?? brief.businessDescription,
    sellingPoints: brief.sellingPoints ?? brief.mood ?? null,
    cta: brief.videoPurpose,
    language: "ja",
    goal: "company-pr-stock-footage",
  };

  const messages = [
    { role: "system" as const, content: systemPrompt(AUTO_BUSINESS_PR_VIDEO_SCRIPT_TASK) },
    { role: "user" as const, content: JSON.stringify(payload) },
  ];

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const raw =
        attempt === 0
          ? await completeJson(messages, { temperature: 0.3, maxTokens: 2800 })
          : await completeJson(
              [
                ...messages,
                {
                  role: "user",
                  content:
                    "前回の出力は使えません。3〜7シーン、日本語の narrationText / onScreenText、各シーンに英語 searchKeywords を付けて JSON のみ返してください。",
                },
              ],
              { temperature: 0.15, maxTokens: 2800 },
            );
      const script = normalizePrVideoScript(raw);
      if (!script || !scriptIsJapanese(script)) continue;
      const sceneCount = script.scenes.length;
      if (sceneCount < 3 || sceneCount > 7) continue;
      return attachSearchKeywords({
        ...script,
        scenes: directCinematography(
          script.scenes,
          `${brief.companyName}|auto|${Date.now()}`,
        ),
      });
    }
  } catch {
    /* fall through to deterministic script */
  }

  return attachSearchKeywords(fallbackAutoBusinessPrScript(brief));
}

export function fallbackAutoBusinessPrScript(brief: BusinessPrBrief): PrVideoScript {
  const name = brief.companyName;
  const scenes: PrVideoScene[] = [
    {
      sceneNumber: 1,
      sceneId: "intro",
      durationSeconds: 6,
      location: "東京のビジネス街",
      character: "ナレーター",
      action: "都市の風景を見せる",
      camera: "parallax",
      transition: "cut",
      visual: "東京のオフィス街。会社の世界観。",
      visualPrompt: "Tokyo business district aerial and street",
      searchKeywords: ["Tokyo business district", "Japanese business people", "modern office"],
      narrationText: `${name}は、日本市場への橋になります。`,
      onScreenText: name.slice(0, 18),
    },
    {
      sceneNumber: 2,
      sceneId: "service",
      durationSeconds: 6,
      location: "会議室",
      character: "ビジネスパーソン",
      action: "打ち合わせをする",
      camera: "orbit",
      transition: "dissolve",
      visual: "B2Bの商談。サービス内容。",
      visualPrompt: "business meeting Japanese professionals",
      searchKeywords: ["business meeting", "Japanese professionals", "B2B negotiation"],
      narrationText:
        brief.businessDescription.replace(/\s+/g, " ").slice(0, 28) ||
        "事業の強みを、現場でつなぎます。",
      onScreenText: "サービス",
    },
    {
      sceneNumber: 3,
      sceneId: "usecase",
      durationSeconds: 6,
      location: "店舗または現場",
      character: "販売パートナー",
      action: "現場を歩く",
      camera: "tracking",
      transition: "slide_left",
      visual: "利用シーンとメリット。",
      visualPrompt: "Japanese retail store product shelves",
      searchKeywords: ["retail store", "Japanese retailer", "product shelves"],
      narrationText: `${brief.targetAudience.replace(/\s+/g, " ").slice(0, 22)}へ。`,
      onScreenText: "利用シーン",
    },
    {
      sceneNumber: 4,
      sceneId: "market",
      durationSeconds: 6,
      location: "港と物流",
      character: "担当者",
      action: "国際取引の流れを示す",
      camera: "pan_right",
      transition: "wipe",
      visual: "日本市場と海外市場の接点。",
      visualPrompt: "shipping containers international trade",
      searchKeywords: ["international trade", "shipping containers", "global business"],
      narrationText:
        brief.japanMarketRelation?.replace(/\s+/g, " ").slice(0, 28) ||
        "海外と日本をつなぐ現場です。",
      onScreenText: "市場との接点",
    },
    {
      sceneNumber: 5,
      sceneId: "cta",
      durationSeconds: 6,
      location: "クロージング",
      character: "ナレーター",
      action: "BrandBridgeへ案内する",
      camera: "dolly_in",
      transition: "fade",
      visual: "握手と都市の空。CTA。",
      visualPrompt: "Tokyo skyline business handshake",
      searchKeywords: ["Tokyo skyline", "business partnership", "handshake"],
      narrationText: "詳しくはBrandBridgeをご覧ください。",
      onScreenText: "BrandBridgeへ",
    },
  ];
  return {
    title: `${name}の会社紹介`,
    hook: `${name}の事業を、30秒で紹介します。`,
    scenes: directCinematography(scenes, `${name}|auto-fallback|${Date.now()}`),
    totalDurationSeconds: 30,
    cta: brief.videoPurpose || "日本市場への進出を考えているなら、BrandBridgeへ。",
  };
}
