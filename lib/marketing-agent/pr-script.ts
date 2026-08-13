/**
 * Case → short-form PR video script (JSON only).
 * Uses existing completeJson() / Case type. No TTS, video, or image analysis.
 */

import type { Case } from "@/lib/types";
import { completeJson } from "./ai";
import { SYSTEM_MARKETER, SYSTEM_PR_VIDEO, prVideoScriptPrompt } from "./prompts";
import type { PrVideoScene, PrVideoScript } from "./types";

const CASE_PR_FIELDS = [
  "productName",
  "brandName",
  "brandOverview",
  "summary",
  "description",
  "productFeatures",
  "productStrengths",
  "suggestedRetailPrice",
  "category",
  "region",
  "makerName",
] as const satisfies readonly (keyof Case)[];

function presentText(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function caseFactsForPrScript(caseItem: Case): Record<string, string> {
  const facts: Record<string, string> = {};
  for (const key of CASE_PR_FIELDS) {
    const text = presentText(caseItem[key]);
    if (text) facts[key] = text;
  }
  return facts;
}

function asScene(value: unknown): PrVideoScene | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const durationRaw = Number(row.duration);
  const duration =
    Number.isFinite(durationRaw) && durationRaw > 0
      ? Math.min(15, Math.round(durationRaw))
      : 0;
  const visual = presentText(row.visual);
  const voiceover = presentText(row.voiceover);
  const caption = presentText(row.caption);
  if (!duration || !visual || !voiceover || !caption) return null;
  return { duration, visual, voiceover, caption };
}

export function normalizePrVideoScript(raw: unknown): PrVideoScript | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const hook = presentText(row.hook);
  const cta = presentText(row.cta);
  if (!hook || !cta || !Array.isArray(row.scenes)) return null;

  const scenes = row.scenes
    .map(asScene)
    .filter((scene): scene is PrVideoScene => scene != null);
  if (scenes.length === 0) return null;

  const narrationText =
    presentText(row.narrationText) ||
    scenes
      .map((scene) => scene.voiceover)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  if (!narrationText) return null;

  return { hook, scenes, narrationText, cta };
}

export async function generatePrVideoScript(
  caseItem: Case,
): Promise<{ ok: true; script: PrVideoScript } | { ok: false; error: string }> {
  const facts = caseFactsForPrScript(caseItem);
  if (!facts.productName && !facts.summary && !facts.description) {
    return { ok: false, error: "Case に台本生成できる商品情報がありません" };
  }

  const result = await completeJson<unknown>(
    [
      { role: "system", content: `${SYSTEM_MARKETER}\n\n${SYSTEM_PR_VIDEO}` },
      { role: "user", content: prVideoScriptPrompt(JSON.stringify(facts, null, 2)) },
    ],
    { temperature: 0.35, maxTokens: 2500 },
  );

  if (!result.ok) return result;

  const script = normalizePrVideoScript(result.data);
  if (!script) {
    return { ok: false, error: "AI returned an incomplete PR script JSON" };
  }
  return { ok: true, script };
}
