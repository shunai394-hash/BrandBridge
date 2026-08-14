/**
 * Case 竊・short-form PR video script (JSON only).
 * Uses existing completeJson(). No TTS, video, DB save, or jobs.ts.
 */

import type { Case } from "@/lib/types";
import { completeJson, MarketingAgentError } from "@/lib/marketing-agent/ai";
import { asRecord } from "@/lib/marketing-agent/json";
import { PR_VIDEO_SCRIPT_TASK, systemPrompt } from "@/lib/marketing-agent/prompts";

export type PrVideoCamera =
  | "wide"
  | "medium"
  | "close"
  | "zoom_in"
  | "zoom_out"
  | "pan_left"
  | "pan_right"
  | "tracking"
  | "over_shoulder";

export type PrVideoTransition =
  | "cut"
  | "fade"
  | "dissolve"
  | "slide_left"
  | "slide_right"
  | "wipe"
  | "zoom";
export type PrVideoScene = {
  sceneNumber: number;
  durationSeconds: number;
  location: string;
  character: string;
  action: string;
  camera: PrVideoCamera;
  transition: PrVideoTransition;
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
  const row = asRecord(value);

  const durationSeconds = asPositiveInt(
    row.durationSeconds ?? row.duration,
  );

  const location = presentText(row.location);
  const character = presentText(row.character);
  const action = presentText(row.action);
  const visual = presentText(row.visual);
  const narrationText = presentText(row.narrationText ?? row.voiceover);

  const cameraValue = presentText(row.camera);
  const transitionValue = presentText(row.transition);

  const allowedCameras: PrVideoCamera[] = [
    "wide",
    "medium",
    "close",
    "zoom_in",
    "zoom_out",
    "pan_left",
    "pan_right",
    "tracking",
    "over_shoulder",
  ];

  const allowedTransitions: PrVideoTransition[] = [
    "cut",
    "fade",
    "dissolve",
    "slide_left",
    "slide_right",
    "wipe",
    "zoom",
  ];

  const camera = cameraValue as PrVideoCamera | null;
  const transition = transitionValue as PrVideoTransition | null;

  if (
    !durationSeconds ||
    !location ||
    !character ||
    !action ||
    !visual ||
    !narrationText ||
    !camera ||
    !allowedCameras.includes(camera) ||
    !transition ||
    !allowedTransitions.includes(transition)
  ) {
    return null;
  }

  return {
    sceneNumber: asPositiveInt(row.sceneNumber) ?? index + 1,
    durationSeconds: Math.min(15, durationSeconds),
    location,
    character,
    action,
    camera,
    transition,
    visual,
    narrationText,

    // 字幕なし
    onScreenText: "",
  };
}

export function normalizePrVideoScript(raw: unknown): PrVideoScript | null {
  const row = asRecord(raw);
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

export async function generatePrVideoScript(
  caseItem: Case,
): Promise<PrVideoScript> {
  const facts = caseFactsForPrScript(caseItem);
  if (!facts.productName && !facts.summary && !facts.description) {
    throw new MarketingAgentError(
      "INVALID_CASE",
      "This product does not have enough information to generate a script.",
    );
  }

  const raw = await completeJson(
    [
      { role: "system", content: systemPrompt(PR_VIDEO_SCRIPT_TASK) },
      {
        role: "user",
        content: JSON.stringify({ case: facts }),
      },
    ],
    { temperature: 0.35, maxTokens: 2500 },
  );

  const script = normalizePrVideoScript(raw);
  if (!script) {
    throw new MarketingAgentError(
      "INVALID_AI_RESPONSE",
      "AI returned invalid JSON. Please try again.",
    );
  }
  return script;
}



