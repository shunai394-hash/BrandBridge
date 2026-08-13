/**
 * Case → short-form PR video script (JSON only).
 * Uses existing completeJson() and Case type. No TTS, video, DB, or image analysis.
 */

import type { Case } from "@/lib/types";
import { completeJson } from "./ai";
import { SYSTEM_MARKETER, prVideoScriptPrompt } from "./prompts";

export type PrVideoScene = {
  sceneNumber: number;
  durationSeconds: number;
  visual: string;
  narrationText: string;
  onScreenText: string;
};

export type PrVideoScript = {
  title: string;
  hook: string;
  scenes: PrVideoScene[];
  totalDurationSeconds: number;
  cta: string;
};

export type PrScriptProductSnapshot = {
  id: string;
  productName: string;
  brandName: string | null;
  category: string;
};

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

const GENERATE_TIMEOUT_MS = 55_000;

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
  facts.hasProductImage = presentText(caseItem.productImageUrl) ? "yes" : "no";
  facts.hasProductVideo = presentText(caseItem.productVideoUrl) ? "yes" : "no";
  return facts;
}

export function productSnapshotFromCase(caseItem: Case): PrScriptProductSnapshot {
  return {
    id: caseItem.id,
    productName: caseItem.productName,
    brandName: presentText(caseItem.brandName),
    category: caseItem.category,
  };
}

function asPositiveInt(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

function asScene(value: unknown, index: number): PrVideoScene | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const durationSeconds = asPositiveInt(
    row.durationSeconds ?? row.duration,
  );
  const visual = presentText(row.visual);
  const narrationText = presentText(row.narrationText ?? row.voiceover);
  const onScreenText = presentText(row.onScreenText ?? row.caption);
  if (!durationSeconds || !visual || !narrationText || !onScreenText) return null;
  return {
    sceneNumber: asPositiveInt(row.sceneNumber) ?? index + 1,
    durationSeconds: Math.min(15, durationSeconds),
    visual,
    narrationText,
    onScreenText,
  };
}

export function normalizePrVideoScript(raw: unknown): PrVideoScript | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const title = presentText(row.title);
  const hook = presentText(row.hook);
  const cta = presentText(row.cta);
  if (!title || !hook || !cta || !Array.isArray(row.scenes)) return null;

  const scenes = row.scenes
    .map((scene, index) => asScene(scene, index))
    .filter((scene): scene is PrVideoScene => scene != null);
  if (scenes.length === 0) return null;

  const summed = scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0);
  const totalDurationSeconds = asPositiveInt(row.totalDurationSeconds) ?? summed;

  return { title, hook, scenes, totalDurationSeconds, cta };
}

function mapGenerateError(error: string): string {
  const lower = error.toLowerCase();
  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("aborted") ||
    lower.includes("abort")
  ) {
    return "AI generation timed out. Please try again.";
  }
  if (lower.includes("invalid json") || lower.includes("incomplete pr script")) {
    return "AI returned invalid JSON. Please try again.";
  }
  return error;
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error("AI generation timed out. Please try again."));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function generatePrVideoScript(
  caseItem: Case,
): Promise<{ ok: true; script: PrVideoScript } | { ok: false; error: string }> {
  const facts = caseFactsForPrScript(caseItem);
  if (!facts.productName && !facts.summary && !facts.description) {
    return { ok: false, error: "This product does not have enough information to generate a script." };
  }

  try {
    const result = await withTimeout(
      completeJson<unknown>(
        [
          { role: "system", content: SYSTEM_MARKETER },
          { role: "user", content: prVideoScriptPrompt(JSON.stringify(facts, null, 2)) },
        ],
        { temperature: 0.35, maxTokens: 2500 },
      ),
      GENERATE_TIMEOUT_MS,
    );

    if (!result.ok) return { ok: false, error: mapGenerateError(result.error) };

    const script = normalizePrVideoScript(result.data);
    if (!script) {
      return { ok: false, error: "AI returned invalid JSON. Please try again." };
    }
    return { ok: true, script };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI request failed";
    return { ok: false, error: mapGenerateError(message) };
  }
}
