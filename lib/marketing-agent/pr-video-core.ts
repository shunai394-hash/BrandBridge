import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
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
    const ext =
      image.contentType.includes("png")
        ? "png"
        : image.contentType.includes("webp")
          ? "webp"
          : "jpg";
    const imagePath = path.join(workDir, `product.${ext}`);
    await writeFile(imagePath, image.bytes);

    let scenes = scaleSceneDurations(input.script.scenes);
    const narration = joinNarration(scenes);
    const audioPath = path.join(workDir, "narration.wav");
    const tts = await synthesizeNarrationWav({ text: narration, outFile: audioPath });

    const visualSum = scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
    if (tts.durationSeconds > visualSum + 0.4) {
      scenes = scaleSceneDurations(scenes, tts.durationSeconds);
    }

    const outFile = path.join(workDir, "pr-video.mp4");
    const rendered = await renderPrVideoMp4({
      workDir,
      imagePath,
      audioPath,
      scenes,
      outFile,
    });

    const { readFile } = await import("node:fs/promises");
    const bytes = await readFile(outFile);
    if (bytes.byteLength < 1024) {
      throw new MarketingAgentError("RENDER_FAILURE", "MP4 output was incomplete.");
    }

    const slug =
      input.productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "product";

    return {
      bytes,
      fileName: `brandbridge-pr-video-${slug}.mp4`,
      durationSeconds: rendered.durationSeconds,
      width: rendered.width,
      height: rendered.height,
      productName: input.productName,
    };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
