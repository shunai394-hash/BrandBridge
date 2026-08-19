import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  generateAutoBusinessPrVideoScript,
  type BusinessPrBrief,
} from "@/lib/marketing-agent/business-pr-script";
import {
  companyPrContextFromBrief,
  type CompanyPrContext,
} from "@/lib/marketing-agent/company-pr-context";
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
import {
  fetchStockClipsForScenes,
  type StockProvider,
} from "@/lib/marketing-agent/pr-video-stock";
import { synthesizeNarrationWav } from "@/lib/marketing-agent/pr-video-tts";

export type AutoPrVideoResult = PrVideoRenderResult & {
  generationMode: "auto";
  stockProvider: StockProvider;
  stockVideoCount: number;
  usedImageFallback: boolean;
  searchKeywords: string[][];
  sceneCount: number;
};

const FALLBACK_STILL_CANDIDATES = [
  "public/images/blog/japan/dungthuyvunguyen-matcha-2356774.jpg",
  "public/images/blog/japan/mirkostoedter-tea-6568547.jpg",
  "public/images/blog/japan/shio_design_jp-food-9384171.jpg",
  "public/images/blog/japan/jggrz-nature-4955817.jpg",
];

async function resolveFallbackStills(): Promise<string[]> {
  const { fileExists } = await import("@/lib/marketing-agent/pr-video-ffmpeg");
  const root = /* turbopackIgnore: true */ process.cwd();
  const found: string[] = [];
  for (const relative of FALLBACK_STILL_CANDIDATES) {
    const absolute = path.join(root, relative);
    if (await fileExists(absolute)) found.push(absolute);
  }
  return found;
}

export async function generateBusinessPrVideoAuto(input: {
  brief: BusinessPrBrief;
  script?: PrVideoScript | null;
  company?: CompanyPrContext;
  bgmEnabled?: boolean;
  subtitlesEnabled?: boolean;
  keepWorkDir?: string;
}): Promise<AutoPrVideoResult> {
  await assertFfmpegAvailable();

  const company = input.company ?? companyPrContextFromBrief(input.brief);
  const script =
    normalizePrVideoScript(input.script) ??
    (await generateAutoBusinessPrVideoScript(input.brief));

  const workDir =
    input.keepWorkDir ||
    (await mkdtemp(path.join(tmpdir(), "bb-biz-pr-auto-")));
  const keep = Boolean(input.keepWorkDir);

  try {
    let scenes = scaleSceneDurations(script.scenes);
    const narration = scenes
      .map((scene) => scene.narrationText.trim())
      .filter(Boolean)
      .join(" ");
    const audioPath = path.join(workDir, "narration.wav");
    const tts = await synthesizeNarrationWav({
      text: narration,
      outFile: audioPath,
    });
    const narrationDuration = await fitNarrationDuration(
      audioPath,
      tts.durationSeconds,
    );
    const visualSum = scenes.reduce(
      (total, scene) => total + scene.durationSeconds,
      0,
    );
    if (narrationDuration > visualSum + 0.4) {
      scenes = scaleSceneDurations(scenes, narrationDuration);
    }

    const stock = await fetchStockClipsForScenes({
      workDir,
      scenes,
    });
    const videoPaths = stock.clips.map((clip) => clip.path);
    let imagePaths: string[] = [];
    let usedImageFallback = videoPaths.length === 0;
    if (usedImageFallback) {
      imagePaths = await resolveFallbackStills();
      if (imagePaths.length === 0) {
        throw new MarketingAgentError(
          "MISSING_IMAGE",
          "実写動画もフォールバック画像も取得できませんでした。",
        );
      }
    }

    const outFile = path.join(workDir, "pr-video.mp4");
    const rendered = await renderPrVideoMp4({
      workDir,
      imagePaths,
      audioPath,
      scenes,
      outFile,
      bgmEnabled: input.bgmEnabled ?? true,
      subtitlesEnabled: input.subtitlesEnabled ?? true,
      product: {
        productName: company.companyName,
        brandName: company.companyName,
        description: company.description,
        country: company.country,
        sellingPoint: company.sellingPoints,
        cta: script.cta || company.cta,
      },
      videoPaths,
      materialMode: videoPaths.length > 0 ? "video-first" : "mixed",
    });

    const { readFile } = await import("node:fs/promises");
    const bytes = await readFile(outFile);
    if (bytes.byteLength < 1024) {
      throw new MarketingAgentError(
        "RENDER_FAILURE",
        "MP4 output was incomplete.",
      );
    }

    const slug =
      company.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "company";

    return {
      bytes,
      fileName: `brandbridge-pr-video-auto-${slug}.mp4`,
      durationSeconds: rendered.durationSeconds,
      width: rendered.width,
      height: rendered.height,
      productName: company.companyName,
      generationMode: "auto",
      stockProvider: stock.provider,
      stockVideoCount: videoPaths.length,
      usedImageFallback,
      searchKeywords: stock.keywords,
      sceneCount: scenes.length,
    };
  } finally {
    if (!keep) {
      await rm(workDir, { recursive: true, force: true });
    }
  }
}
