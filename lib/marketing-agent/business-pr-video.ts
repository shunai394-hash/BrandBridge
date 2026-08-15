import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  normalizePrVideoScript,
  type PrVideoScript,
} from "@/lib/marketing-agent/pr-script";
import {
  fitNarrationDuration,
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

export type UploadedImage = {
  bytes: Buffer;
  contentType: string;
};

export function toBusinessPrWorkerImages(
  images: UploadedImage[],
): Array<{ contentType: string; bytes: string }> {
  return images.map((image) => ({
    contentType: image.contentType,
    bytes: image.bytes.toString("base64"),
  }));
}

export function parseBusinessPrWorkerImages(
  raw: unknown,
): UploadedImage[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const images: UploadedImage[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as {
      contentType?: unknown;
      bytes?: unknown;
    };
    const encoded = String(record.bytes ?? "").trim();

    if (!encoded) {
      continue;
    }

    const contentType = (String(record.contentType ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase() || "image/jpeg");
    const bytes = Buffer.from(encoded, "base64");

    if (bytes.byteLength < 32) {
      continue;
    }

    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      throw new MarketingAgentError(
        "INVALID_IMAGE_URL",
        "画像サイズが大きすぎます。1枚8MBまでです。",
      );
    }

    images.push({
      bytes,
      contentType: ALLOWED_TYPES.has(contentType)
        ? contentType
        : "image/jpeg",
    });
  }

  return images;
}

function extForContentType(
  contentType: string,
): "png" | "webp" | "jpg" {
  if (contentType.includes("png")) {
    return "png";
  }

  if (contentType.includes("webp")) {
    return "webp";
  }

  return "jpg";
}

async function readUploadedImage(
  value: FormDataEntryValue,
): Promise<UploadedImage | null> {
  if (typeof value === "string") {
    return null;
  }

  if (
    typeof Blob === "undefined" ||
    !(value instanceof Blob) ||
    value.size === 0
  ) {
    return null;
  }

  if (value.size > MAX_IMAGE_BYTES) {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      "画像サイズが大きすぎます。1枚8MBまでです。",
    );
  }

  const name =
    "name" in value &&
    typeof value.name === "string"
      ? value.name
      : "";

  const type =
    (value.type || "")
      .split(";")[0]
      .trim()
      .toLowerCase();

  if (
    !ALLOWED_TYPES.has(type) &&
    !/\.(jpe?g|png|webp)$/i.test(name)
  ) {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      "画像はJPEG / PNG / WebPのみ利用できます。",
    );
  }

  const bytes = Buffer.from(
    await value.arrayBuffer(),
  );

  if (bytes.byteLength < 32) {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      "画像ファイルが不正です。",
    );
  }

  return {
    bytes,
    contentType:
      ALLOWED_TYPES.has(type)
        ? type
        : "image/jpeg",
  };
}

export async function collectBusinessPrImages(
  form: FormData,
): Promise<UploadedImage[]> {
  const images: UploadedImage[] = [];

  for (const value of form.getAll("images")) {
    const image =
      await readUploadedImage(value);

    if (image) {
      images.push(image);
    }
  }

  if (
    images.length >
    MAX_BUSINESS_PR_IMAGES
  ) {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      `画像は最大${MAX_BUSINESS_PR_IMAGES}枚までです。`,
    );
  }

  if (
    images.length <
    MIN_BUSINESS_PR_IMAGES
  ) {
    throw new MarketingAgentError(
      "MISSING_IMAGE",
      "画像を2枚以上追加してください。",
    );
  }

  return images;
}

export async function generateBusinessPrVideoFromUploads(
  input: {
    script: PrVideoScript;
    images: UploadedImage[];
    companyName: string;
    bgmEnabled?: boolean;
  },
): Promise<PrVideoRenderResult> {
  await assertFfmpegAvailable();

  const script =
    normalizePrVideoScript(input.script);

  if (!script) {
    throw new MarketingAgentError(
      "INVALID_AI_RESPONSE",
      "台本が不正です。日本語で台本を作り直してください。",
    );
  }

  if (
    input.images.length <
    MIN_BUSINESS_PR_IMAGES
  ) {
    throw new MarketingAgentError(
      "MISSING_IMAGE",
      "画像を2枚以上追加してください。",
    );
  }

  const workDir =
    await mkdtemp(
      path.join(
        tmpdir(),
        "bb-biz-pr-ui-",
      ),
    );

  try {
    const imagePaths: string[] = [];

    for (
      let index = 0;
      index < input.images.length;
      index += 1
    ) {
      const image =
        input.images[index];

      if (!image) {
        continue;
      }

      const ext =
        extForContentType(
          image.contentType,
        );

      const imagePath =
        path.join(
          workDir,
          `still-${index}.${ext}`,
        );

      await writeFile(
        imagePath,
        image.bytes,
      );

      imagePaths.push(imagePath);
    }

    if (
      imagePaths.length <
      MIN_BUSINESS_PR_IMAGES
    ) {
      throw new MarketingAgentError(
        "MISSING_IMAGE",
        "画像を2枚以上追加してください。",
      );
    }

    let scenes =
      scaleSceneDurations(
        script.scenes,
      );

    const narration =
      scenes
        .map((scene) =>
          scene.narrationText.trim(),
        )
        .filter(Boolean)
        .join(" ");

    const audioPath =
      path.join(
        workDir,
        "narration.wav",
      );

    const tts =
      await synthesizeNarrationWav({
        text: narration,
        outFile: audioPath,
      });
    const narrationDuration =
      await fitNarrationDuration(
        audioPath,
        tts.durationSeconds,
      );

    const visualSum =
      scenes.reduce(
        (total, scene) =>
          total +
          scene.durationSeconds,
        0,
      );

    if (
      narrationDuration >
      visualSum + 0.4
    ) {
      scenes =
        scaleSceneDurations(
          scenes,
          narrationDuration,
        );
    }

    const outFile =
      path.join(
        workDir,
        "pr-video.mp4",
      );

    const rendered =
      await renderPrVideoMp4({
        workDir,
        imagePaths,
        audioPath,
        scenes,
        outFile,
        bgmEnabled:
          input.bgmEnabled ?? true,
      });

    const { readFile } =
      await import(
        "node:fs/promises"
      );

    const bytes =
      await readFile(
        outFile,
      );

    if (
      bytes.byteLength < 1024
    ) {
      throw new MarketingAgentError(
        "RENDER_FAILURE",
        "MP4 output was incomplete.",
      );
    }

    const slug =
      input.companyName
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "-",
        )
        .replace(
          /^-+|-+$/g,
          "",
        )
        .slice(0, 40) ||
      "business";

    return {
      bytes,
      fileName:
        `brandbridge-pr-video-${slug}.mp4`,
      durationSeconds:
        rendered.durationSeconds,
      width:
        rendered.width,
      height:
        rendered.height,
      productName:
        input.companyName,
    };
  } finally {
    await rm(
      workDir,
      {
        recursive: true,
        force: true,
      },
    );
  }
}
