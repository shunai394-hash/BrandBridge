import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  fileExists,
  resolveFfmpegBin,
} from "@/lib/marketing-agent/pr-video-ffmpeg";
import type { PrVideoScene } from "@/lib/marketing-agent/pr-script";
import {
  writeNarrationSrtFile,
} from "@/lib/marketing-agent/pr-video-subtitles";
import type { PrVideoProductContext } from "@/lib/marketing-agent/pr-video-engine";
import { probeAudioDuration } from "@/lib/marketing-agent/pr-video-tts";
import {
  assignSceneMaterials,
  hasMixedMaterialTypes,
} from "@/lib/marketing-agent/pr-video-materials";

const execFileAsync = promisify(execFile);

const MPT_TIMEOUT_MS = 15 * 60 * 1000;
const HELPER_RELATIVE = path.join(
  "services",
  "moneyprinterturbo",
  "render_pr_video.py",
);

export class MptUnavailableError extends MarketingAgentError {
  constructor(message: string) {
    super("MPT_UNAVAILABLE", message, "ffmpeg");
    this.name = "MptUnavailableError";
  }
}

export type MptProbe = {
  available: boolean;
  root: string;
  pythonPath: string;
  helperPath: string;
  reason?: string;
};

export function resolveMptRoot(): string {
  const configured = process.env.MONEYPRINTERTURBO_ROOT?.trim();
  if (configured) return path.resolve(configured);
  return path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    "vendor",
    "MoneyPrinterTurbo",
  );
}

export async function probeMoneyPrinterTurbo(): Promise<MptProbe> {
  const root = resolveMptRoot();
  const helperPath = path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    HELPER_RELATIVE,
  );
  const pythonPath = path.join(
    root,
    ".venv",
    process.platform === "win32" ? path.join("Scripts", "python.exe") : path.join("bin", "python"),
  );
  const cliPath = path.join(root, "cli.py");
  const videoPath = path.join(root, "app", "services", "video.py");

  if (!(await fileExists(helperPath))) {
    return {
      available: false,
      root,
      pythonPath,
      helperPath,
      reason: "BrandBridge MoneyPrinterTurbo helper is missing.",
    };
  }
  if (!(await fileExists(cliPath)) || !(await fileExists(videoPath))) {
    return {
      available: false,
      root,
      pythonPath,
      helperPath,
      reason: "MoneyPrinterTurbo is not installed under vendor/MoneyPrinterTurbo.",
    };
  }
  if (!(await fileExists(pythonPath))) {
    return {
      available: false,
      root,
      pythonPath,
      helperPath,
      reason: "MoneyPrinterTurbo Python venv is missing. Run npm run pr-video:mpt-setup.",
    };
  }

  try {
    await execFileAsync(pythonPath, ["-c", "import moviepy, loguru, pydantic"], {
      timeout: 12_000,
      cwd: root,
    });
  } catch {
    return {
      available: false,
      root,
      pythonPath,
      helperPath,
      reason: "MoneyPrinterTurbo Python dependencies are incomplete.",
    };
  }

  return { available: true, root, pythonPath, helperPath };
}

const BGM_CANDIDATES = [
  path.join(/* turbopackIgnore: true */ process.cwd(), "public", "audio", "brandbridge-bgm.wav"),
  path.join(/* turbopackIgnore: true */ process.cwd(), "public", "brandbridge-bgm.wav"),
  path.join(/* turbopackIgnore: true */ process.cwd(), "brandbridge-bgm.wav"),
];

async function resolveBgmPath(): Promise<string | null> {
  for (const candidate of BGM_CANDIDATES) {
    if (await fileExists(candidate)) return candidate;
  }
  return null;
}

function buildVideoScript(
  scenes: PrVideoScene[],
  product: PrVideoProductContext | undefined,
): string {
  const parts: string[] = [];
  if (product?.productName) parts.push(product.productName);
  if (product?.brandName) parts.push(product.brandName);
  if (product?.sellingPoint) parts.push(product.sellingPoint);
  for (const scene of scenes) {
    const onScreen = scene.onScreenText.trim();
    const narration = scene.narrationText.trim();
    if (onScreen) parts.push(onScreen);
    if (narration) parts.push(narration);
  }
  if (product?.cta) parts.push(product.cta);
  return parts.join("\n").replace(/\s+\n/g, "\n").trim();
}

function parseMptResult(stdout: string, stderr: string): Record<string, unknown> {
  const lines = `${stdout}\n${stderr}`
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("MPT_RESULT "));
  const last = lines[lines.length - 1];
  if (!last) {
    throw new MarketingAgentError(
      "RENDER_FAILURE",
      "MoneyPrinterTurbo returned no result payload.",
    );
  }
  try {
    return JSON.parse(last.slice("MPT_RESULT ".length)) as Record<string, unknown>;
  } catch {
    throw new MarketingAgentError(
      "RENDER_FAILURE",
      "MoneyPrinterTurbo result JSON could not be parsed.",
    );
  }
}

export async function renderPrVideoWithMoneyPrinterTurbo(input: {
  workDir: string;
  imagePaths: string[];
  audioPath: string;
  scenes: PrVideoScene[];
  outFile: string;
  bgmEnabled?: boolean;
  subtitlesEnabled?: boolean;
  product?: PrVideoProductContext;
  videoPaths?: string[];
}): Promise<{ width: number; height: number; durationSeconds: number } | null> {
  const probe = await probeMoneyPrinterTurbo();
  if (!probe.available) {
    return null;
  }
  if (input.imagePaths.length === 0) {
    throw new MarketingAgentError("MISSING_IMAGE", "画像が指定されていません。");
  }
  if (input.scenes.length === 0) {
    throw new MarketingAgentError("RENDER_FAILURE", "動画シーンが指定されていません。");
  }

  const ffmpegPath = await resolveFfmpegBin();
  const materialsDir = path.join(input.workDir, "mpt-materials");
  await mkdir(materialsDir, { recursive: true });

  const sceneJobs = await assignSceneMaterials({
    workDir: materialsDir,
    scenes: input.scenes,
    imagePaths: input.imagePaths,
    videoPaths: input.videoPaths,
  });
  if (sceneJobs.length === 0) {
    throw new MarketingAgentError("MISSING_IMAGE", "動画素材を準備できませんでした。");
  }

  const narrationDur = await probeAudioDuration(input.audioPath);
  const visualSum = input.scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
  const subtitleDuration = Math.max(
    Number.isFinite(narrationDur) ? narrationDur : 0,
    visualSum,
    25,
  );

  const bgmEnabled = input.bgmEnabled ?? true;
  const subtitlesEnabled = input.subtitlesEnabled ?? true;
  const bgmPath = bgmEnabled ? await resolveBgmPath() : null;
  if (bgmEnabled && !bgmPath) {
    throw new MarketingAgentError(
      "RENDER_FAILURE",
      "BrandBridge BGMファイルが見つかりません。",
    );
  }

  let subtitlePath = "";
  if (subtitlesEnabled) {
    const srtPath = path.join(input.workDir, "mpt-subtitles.srt");
    const wrote = await writeNarrationSrtFile({
      scenes: input.scenes,
      durationSeconds: subtitleDuration,
      outFile: srtPath,
    });
    if (wrote) subtitlePath = srtPath;
  }

  const job = {
    mptRoot: probe.root,
    ffmpegPath,
    workDir: input.workDir,
    scenes: sceneJobs,
    audioPath: input.audioPath,
    subtitlePath,
    bgmPath: bgmPath ?? "",
    outFile: input.outFile,
    bgmEnabled: Boolean(bgmPath),
    subtitlesEnabled: Boolean(subtitlePath),
    mixedMaterials: hasMixedMaterialTypes(sceneJobs),
    productName: input.product?.productName || "BrandBridge product",
    videoScript: buildVideoScript(input.scenes, input.product),
    fontName: "MicrosoftYaHeiBold.ttc",
    threads: 2,
  };

  const jobFile = path.join(input.workDir, "mpt-job.json");
  await writeFile(jobFile, JSON.stringify(job), "utf8");

  try {
    const { stdout, stderr } = await execFileAsync(
      probe.pythonPath,
      [probe.helperPath, "--job", jobFile],
      {
        cwd: probe.root,
        timeout: MPT_TIMEOUT_MS,
        maxBuffer: 16 * 1024 * 1024,
        env: {
          ...process.env,
          IMAGEIO_FFMPEG_EXE: ffmpegPath,
          PYTHONIOENCODING: "utf-8",
        },
      },
    );

    const result = parseMptResult(String(stdout), String(stderr));
    if (result.ok !== true) {
      const code = typeof result.code === "string" ? result.code : "RENDER_FAILURE";
      const message =
        typeof result.error === "string"
          ? result.error
          : "MoneyPrinterTurbo video generation failed.";
      if (code === "MPT_UNAVAILABLE") {
        throw new MptUnavailableError(message);
      }
      throw new MarketingAgentError(code, message, "ffmpeg");
    }
  } catch (error) {
    if (error instanceof MarketingAgentError) throw error;
    const err = error as {
      killed?: boolean;
      code?: string | number;
      message?: string;
      stderr?: string;
      stdout?: string;
    };
    if (err.killed || err.code === "ETIMEDOUT") {
      throw new MarketingAgentError(
        "AI_TIMEOUT",
        "MoneyPrinterTurbo video rendering timed out.",
        "timeout",
      );
    }
    const combined = `${err.stdout || ""}\n${err.stderr || ""}`;
    if (combined.includes("MPT_RESULT ")) {
      const result = parseMptResult(String(err.stdout || ""), String(err.stderr || ""));
      const message =
        typeof result.error === "string"
          ? result.error
          : "MoneyPrinterTurbo video generation failed.";
      if (result.code === "MPT_UNAVAILABLE") {
        throw new MptUnavailableError(message);
      }
      throw new MarketingAgentError(
        typeof result.code === "string" ? result.code : "RENDER_FAILURE",
        message,
        "ffmpeg",
      );
    }
    throw new MptUnavailableError(
      `MoneyPrinterTurbo subprocess failed: ${String(err.message || "unknown error").slice(0, 220)}`,
    );
  }

  const finalDur = await probeAudioDuration(input.outFile);
  if (!(await fileExists(input.outFile)) || !Number.isFinite(finalDur) || finalDur < 1) {
    throw new MarketingAgentError(
      "RENDER_FAILURE",
      "MoneyPrinterTurbo MP4 output was incomplete.",
    );
  }

  return {
    width: 1080,
    height: 1920,
    durationSeconds: finalDur,
  };
}
