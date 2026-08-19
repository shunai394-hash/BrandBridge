/**
 * Auto company PR path: company info only (no image selection) → AI script
 * and English search keywords → stock footage → MoneyPrinterTurbo 9:16 MP4.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseBusinessPrBrief } from "../lib/marketing-agent/business-pr-script";
import { generateBusinessPrVideoAuto } from "../lib/marketing-agent/pr-video-auto";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "tmp", "pr-video-auto-smoke");

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

function ffprobe(file: string) {
  return execFileSync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "stream=codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate",
    "-show_entries",
    "format=duration,size",
    "-of",
    "json",
    file,
  ]).toString();
}

function meanVolume(file: string): string {
  const result = spawnSync(
    "ffmpeg",
    ["-i", file, "-af", "volumedetect", "-f", "null", "-"],
    { encoding: "utf8" },
  );
  const text = `${result.stdout || ""}\n${result.stderr || ""}`;
  const match = text.match(/mean_volume:\s*([-\d.]+)\s*dB/);
  return match?.[1] ? `${match[1]} dB` : "unknown";
}

function extractFrame(file: string, seconds: number, dest: string) {
  execFileSync("ffmpeg", [
    "-y",
    "-i",
    file,
    "-ss",
    String(seconds),
    "-frames:v",
    "1",
    dest,
  ], { stdio: "pipe" });
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const brief = parseBusinessPrBrief({
    companyName: "BrandBridge",
    website: "https://www.brandbridge.jp",
    businessDescription:
      "海外ブランドと日本の販売パートナーをつなぐB2Bマッチングプラットフォームです。",
    businessType: "B2B matching platform",
    targetAudience:
      "日本市場に進出したい海外ブランドと、新しい商品を探している日本の販売事業者。",
    country: "Japan",
    services: "出品、商談、日本市場進出のマッチング",
    sellingPoints: "現地パートナーとの橋渡し",
    videoPurpose: "BrandBridgeを知ってもらい、サービスへのアクセスにつなげる。",
    japanMarketRelation:
      "海外ブランドの日本市場進出を、現地パートナーとのマッチングで支援します。",
    mood: "信頼感があり、誠実でプロフェッショナルなビジネス動画",
    imageCount: 0,
  });

  console.log("[auto-smoke] company-only generate (no image selection)");
  const result = await generateBusinessPrVideoAuto({
    brief,
    bgmEnabled: true,
    subtitlesEnabled: true,
    keepWorkDir: OUT_DIR,
  });

  const outFile = path.join(OUT_DIR, "pr-video.mp4");
  const preview = path.join(OUT_DIR, "preview.mp4");
  if (existsSync(outFile)) {
    writeFileSync(preview, readFileSync(outFile));
  }

  const probe = JSON.parse(ffprobe(preview)) as {
    streams?: Array<Record<string, unknown>>;
    format?: Record<string, unknown>;
  };
  const video = probe.streams?.find((stream) => stream.codec_type === "video");
  const audio = probe.streams?.find((stream) => stream.codec_type === "audio");
  const volume = meanVolume(preview);

  for (const second of [2, 8, 14, 20, 26]) {
    extractFrame(
      preview,
      second,
      path.join(OUT_DIR, `frame-${String(second).padStart(2, "0")}s.jpg`),
    );
  }

  const report = {
    generationMode: result.generationMode,
    file: preview,
    durationSeconds: result.durationSeconds,
    width: result.width,
    height: result.height,
    videoCodec: video?.codec_name ?? null,
    audioCodec: audio?.codec_name ?? null,
    fps: video?.avg_frame_rate ?? video?.r_frame_rate ?? null,
    hasAudioStream: Boolean(audio),
    meanVolume: volume,
    sceneCount: result.sceneCount,
    stockProvider: result.stockProvider,
    stockVideoCount: result.stockVideoCount,
    usedImageFallback: result.usedImageFallback,
    searchKeywords: result.searchKeywords,
    fileName: result.fileName,
    bytes: result.bytes.byteLength,
  };
  writeFileSync(
    path.join(OUT_DIR, "report.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );
  console.log(JSON.stringify(report, null, 2));
  if (!audio) {
    throw new Error("Auto PR video has no audio stream.");
  }
  if (result.width !== 1080 || result.height !== 1920) {
    throw new Error("Auto PR video is not 1080x1920.");
  }
  if (result.durationSeconds < 25 || result.durationSeconds > 36) {
    throw new Error(`Duration ${result.durationSeconds}s is outside 25-35s.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
