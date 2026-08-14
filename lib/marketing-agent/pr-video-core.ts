import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import { isNaturalJapaneseNarration } from "@/lib/marketing-agent/japanese-narration";
import {
  assignSceneImageIndexes,
  normalizePrVideoScript,
  type PrVideoScene,
  type PrVideoScript,
} from "@/lib/marketing-agent/pr-script";
import {
  assertSafeProductImageUrl,
  readSafeProductImage,
} from "@/lib/marketing-agent/pr-video-image";
import { assertFfmpegAvailable } from "@/lib/marketing-agent/pr-video-ffmpeg";
import { renderPrVideoMp4 } from "@/lib/marketing-agent/pr-video-render";
import { synthesizeNarrationWav } from "@/lib/marketing-agent/pr-video-tts";

const TARGET_MIN = 25;
const TARGET_MAX = 35;
const TARGET = 30;

function joinNarration(scenes: PrVideoScene[]): string {
  return scenes
    .map((scene) => scene.narrationText.trim())
    .filter((text) => text.length > 0)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function scaleSceneDurations(
  scenes: PrVideoScene[],
  targetSeconds = TARGET,
): PrVideoScene[] {
  if (scenes.length === 0) return scenes;
  const sum = scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
  const safeTarget = Math.min(TARGET_MAX, Math.max(TARGET_MIN, targetSeconds));
  if (sum >= TARGET_MIN && sum <= TARGET_MAX && targetSeconds === TARGET) {
    return scenes;
  }
  const factor = safeTarget / (sum || safeTarget);
  const scaled = scenes.map((scene) => ({
    ...scene,
    durationSeconds: Math.max(1.2, Math.round(scene.durationSeconds * factor * 10) / 10),
  }));
  const nextSum = scaled.reduce((total, scene) => total + scene.durationSeconds, 0);
  const drift = safeTarget - nextSum;
  const last = scaled[scaled.length - 1];
  if (last) last.durationSeconds = Math.max(1.2, last.durationSeconds + drift);
  return scaled;
}

export type PrVideoRenderResult = {
  bytes: Buffer;
  fileName: string;
  durationSeconds: number;
  width: number;
  height: number;
  productName: string;
};

export type BusinessPrImageBytes = {
  bytes: Buffer;
  contentType: string;
};

function extForContentType(contentType: string): "png" | "webp" | "jpg" {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  return "jpg";
}

function fileSlug(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || fallback;
}

async function renderScenesToMp4(input: {
  script: PrVideoScript;
  imagePaths: string[];
  workDir: string;
  fileSlug: string;
  displayName: string;
  ttsVoice?: "ja" | "en";
  requireJapanese?: boolean;
}): Promise<PrVideoRenderResult> {
  let scenes = assignSceneImageIndexes(
    scaleSceneDurations(input.script.scenes),
    input.imagePaths.length,
  );
  const narration = joinNarration(scenes);
  if (input.requireJapanese && !isNaturalJapaneseNarration(narration)) {
    throw new MarketingAgentError(
      "INVALID_AI_RESPONSE",
      "ナレーションが自然な日本語ではありません。台本を作り直してください。",
    );
  }

  const audioPath = path.join(input.workDir, "narration.wav");
  const tts = await synthesizeNarrationWav({
    text: narration,
    outFile: audioPath,
    voice: input.ttsVoice,
  });

  const visualSum = scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
  if (tts.durationSeconds > visualSum + 0.4) {
    scenes = scaleSceneDurations(scenes, tts.durationSeconds);
  }

  const outFile = path.join(input.workDir, "pr-video.mp4");
  const rendered = await renderPrVideoMp4({
    workDir: input.workDir,
    images: input.imagePaths,
    audioPath,
    scenes,
    outFile,
  });

  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile(outFile);
  if (bytes.byteLength < 1024) {
    throw new MarketingAgentError("RENDER_FAILURE", "MP4 output was incomplete.");
  }

  return {
    bytes,
    fileName: `brandbridge-pr-video-${input.fileSlug}.mp4`,
    durationSeconds: rendered.durationSeconds,
    width: rendered.width,
    height: rendered.height,
    productName: input.displayName,
  };
}

export async function generatePrVideoFromRemote(input: {
  caseId: string;
  script: PrVideoScript;
  imageUrl: string;
  productName?: string;
}): Promise<PrVideoRenderResult> {
  await assertFfmpegAvailable();

  const script = normalizePrVideoScript(input.script);
  if (!script) {
    throw new MarketingAgentError(
      "INVALID_AI_RESPONSE",
      "Invalid PR script. Generate the script again before creating a video.",
    );
  }

  const safeImage = assertSafeProductImageUrl(input.imageUrl);
  if (safeImage.kind !== "remote") {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      "Only HTTPS product-images URLs can be rendered on the video worker.",
    );
  }

  return renderPrVideoWithImage({
    script,
    safeImage,
    productName: input.productName || input.caseId,
  });
}

export async function renderPrVideoWithImage(input: {
  script: PrVideoScript;
  safeImage: ReturnType<typeof assertSafeProductImageUrl>;
  productName: string;
}): Promise<PrVideoRenderResult> {
  const workDir = await mkdtemp(path.join(tmpdir(), "bb-pr-video-"));
  try {
    const image = await readSafeProductImage(input.safeImage);
    const ext = extForContentType(image.contentType);
    const imagePath = path.join(workDir, `product.${ext}`);
    await writeFile(imagePath, image.bytes);

    return await renderScenesToMp4({
      script: input.script,
      imagePaths: [imagePath],
      workDir,
      fileSlug: fileSlug(input.productName, "product"),
      displayName: input.productName,
    });
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

export async function generateBusinessPrVideo(input: {
  script: PrVideoScript;
  images: BusinessPrImageBytes[];
  companyName: string;
}): Promise<PrVideoRenderResult> {
  await assertFfmpegAvailable();

  const script = normalizePrVideoScript(input.script);
  if (!script) {
    throw new MarketingAgentError(
      "INVALID_AI_RESPONSE",
      "台本が不正です。先に事業PRの台本を生成してください。",
    );
  }
  if (input.images.length < 2) {
    throw new MarketingAgentError(
      "MISSING_IMAGE",
      "事業PR動画には画像を2枚以上追加してください。商品画像である必要はありません。",
    );
  }

  const workDir = await mkdtemp(path.join(tmpdir(), "bb-biz-pr-video-"));
  try {
    const imagePaths: string[] = [];
    for (let i = 0; i < input.images.length; i += 1) {
      const image = input.images[i];
      if (!image) continue;
      const ext = extForContentType(image.contentType);
      const imagePath = path.join(workDir, `still-${i}.${ext}`);
      await writeFile(imagePath, image.bytes);
      imagePaths.push(imagePath);
    }

    return await renderScenesToMp4({
      script,
      imagePaths,
      workDir,
      fileSlug: fileSlug(input.companyName, "business"),
      displayName: input.companyName,
      ttsVoice: "ja",
      requireJapanese: true,
    });
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
