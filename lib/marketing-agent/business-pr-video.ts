import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import { normalizePrVideoScript, type PrVideoScript } from "@/lib/marketing-agent/pr-script";
import {
  scaleSceneDurations,
  type PrVideoRenderResult,
} from "@/lib/marketing-agent/pr-video-core";
import { assertFfmpegAvailable } from "@/lib/marketing-agent/pr-video-ffmpeg";
import { renderPrVideoMp4 } from "@/lib/marketing-agent/pr-video-render";
import { synthesizeNarrationWav } from "@/lib/marketing-agent/pr-video-tts";

export const MIN_BUSINESS_PR_IMAGES = 2;
export const MAX_BUSINESS_PR_IMAGES = 16;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

type UploadedImage = { bytes: Buffer; contentType: string };

function extForContentType(contentType: string): "png" | "webp" | "jpg" {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  return "jpg";
}

async function readUploadedImage(
  value: FormDataEntryValue,
): Promise<UploadedImage | null> {
  if (typeof value === "string") return null;
  if (typeof Blob === "undefined" || !(value instanceof Blob) || value.size === 0) {
    return null;
  }
  if (value.size > MAX_IMAGE_BYTES) {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      "画像が大きすぎます。1枚あたり8MBまでです。",
    );
  }
  const name = "name" in value && typeof value.name === "string" ? value.name : "";
  const type = (value.type || "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED_TYPES.has(type) && !/\.(jpe?g|png|webp)$/i.test(name)) {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      "画像は JPEG / PNG / WebP のみ利用できます。",
    );
  }
  const bytes = Buffer.from(await value.arrayBuffer());
  if (bytes.byteLength < 32) {
    throw new MarketingAgentError("INVALID_IMAGE_URL", "画像ファイルが不正です。");
  }
  return { bytes, contentType: ALLOWED_TYPES.has(type) ? type : "image/jpeg" };
}

export async function collectBusinessPrImages(form: FormData): Promise<UploadedImage[]> {
  const images: UploadedImage[] = [];
  for (const value of form.getAll("images")) {
    const image = await readUploadedImage(value);
    if (image) images.push(image);
  }
  if (images.length > MAX_BUSINESS_PR_IMAGES) {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      `画像は最大${MAX_BUSINESS_PR_IMAGES}枚までです。`,
    );
  }
  if (images.length < MIN_BUSINESS_PR_IMAGES) {
    throw new MarketingAgentError(
      "MISSING_IMAGE",
      "画像を2枚以上追加してください。商品画像である必要はありません。",
    );
  }
  return images;
}

/**
 * Uses the current renderer as-is (no FFmpeg/TTS file changes).
 * Multiple images are accepted in the form; scene switching lands in a later pass.
 */
export async function generateBusinessPrVideoFromUploads(input: {
  script: PrVideoScript;
  images: UploadedImage[];
  companyName: string;
}): Promise<PrVideoRenderResult> {
  await assertFfmpegAvailable();
  const script = normalizePrVideoScript(input.script);
  if (!script) {
    throw new MarketingAgentError(
      "INVALID_AI_RESPONSE",
      "台本が不正です。先に日本語で台本を作成してください。",
    );
  }
  const first = input.images[0];
  if (!first) {
    throw new MarketingAgentError(
      "MISSING_IMAGE",
      "画像を2枚以上追加してください。商品画像である必要はありません。",
    );
  }

  const workDir = await mkdtemp(path.join(tmpdir(), "bb-biz-pr-ui-"));
  try {
    const ext = extForContentType(first.contentType);
    const imagePath = path.join(workDir, `still.${ext}`);
    await writeFile(imagePath, first.bytes);

    let scenes = scaleSceneDurations(script.scenes);
    const narration = scenes
      .map((scene) => scene.narrationText.trim())
      .filter(Boolean)
      .join(" ");
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
      input.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "business";
    return {
      bytes,
      fileName: `brandbridge-pr-video-${slug}.mp4`,
      durationSeconds: rendered.durationSeconds,
      width: rendered.width,
      height: rendered.height,
      productName: input.companyName,
    };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
