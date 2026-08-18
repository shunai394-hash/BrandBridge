/**
 * Local smoke: BrandBridge PrVideoScript scenes → MoneyPrinterTurbo 9:16 MP4.
 * Also verifies BrandBridge Ken Burns fallback. No Next.js / DB / Voicebox.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, copyFileSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  probeMoneyPrinterTurbo,
  renderPrVideoWithMoneyPrinterTurbo,
} from "../lib/marketing-agent/pr-video-mpt";
import { renderPrVideoMp4 } from "../lib/marketing-agent/pr-video-render";
import type { PrVideoScene } from "../lib/marketing-agent/pr-script";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "tmp", "pr-video-mpt-smoke");
const OUT_MP4 = path.join(OUT_DIR, "preview.mp4");
const FALLBACK_MP4 = path.join(OUT_DIR, "fallback-brandbridge.mp4");

const IMAGE_CANDIDATES = [
  "public/images/blog/japan/dungthuyvunguyen-matcha-2356774.jpg",
  "public/images/blog/japan/mirkostoedter-tea-6568547.jpg",
  "public/images/blog/japan/shio_design_jp-food-9384171.jpg",
  "public/images/blog/japan/jggrz-nature-4955817.jpg",
  "public/images/blog/japan/mingshy-bamboo-2074751.jpg",
].map((relative) => path.join(ROOT, relative));

function ffmpeg(args: string[]) {
  execFileSync("ffmpeg", args, { stdio: "pipe" });
}

function ffprobe(file: string) {
  return execFileSync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "stream=codec_type,codec_name,width,height",
    "-show_entries",
    "format=duration,size",
    "-of",
    "json",
    file,
  ]).toString();
}

const scenes: PrVideoScene[] = [
  {
    sceneNumber: 1,
    durationSeconds: 5,
    location: "Product table",
    character: "Host",
    action: "Reveal the gift set",
    camera: "dolly_in",
    transition: "cut",
    visual: "Close product hero",
    narrationText: "Matcha gift set for Japanese wholesale partners.",
    onScreenText: "Matcha Gift Set",
  },
  {
    sceneNumber: 2,
    durationSeconds: 5,
    location: "Studio",
    character: "Host",
    action: "Show texture",
    camera: "orbit",
    transition: "dissolve",
    visual: "Tea leaves and tin",
    narrationText: "Clear origin story, MOQ, and selling points in one short video.",
    onScreenText: "Origin & quality",
  },
  {
    sceneNumber: 3,
    durationSeconds: 5,
    location: "Retail shelf",
    character: "Buyer",
    action: "Compare terms",
    camera: "pan_right",
    transition: "slide_left",
    visual: "Wholesale terms overlay",
    narrationText: "Built for distributors who need reliable first-order terms.",
    onScreenText: "MOQ ready",
  },
  {
    sceneNumber: 4,
    durationSeconds: 5,
    location: "Japan market",
    character: "Partner",
    action: "Walk the aisle",
    camera: "tracking",
    transition: "wipe",
    visual: "Lifestyle pour",
    narrationText: "A 30-second portrait cut for TikTok, Reels, and Shorts.",
    onScreenText: "9:16 PR",
  },
  {
    sceneNumber: 5,
    durationSeconds: 5,
    location: "BrandBridge",
    character: "CTA",
    action: "Close",
    camera: "zoom_in",
    transition: "fade",
    visual: "Logo close",
    narrationText: "See the listing on BrandBridge and start the conversation.",
    onScreenText: "BrandBridge",
  },
  {
    sceneNumber: 6,
    durationSeconds: 5,
    location: "BrandBridge",
    character: "CTA",
    action: "Hold",
    camera: "focus_pull",
    transition: "fade",
    visual: "Final frame",
    narrationText: "Japanese partners. Overseas brands. One matching table.",
    onScreenText: "Enquire on BrandBridge",
  },
];

async function main() {
  const probe = await probeMoneyPrinterTurbo();
  if (!probe.available) {
    console.error("MoneyPrinterTurbo is unavailable:", probe.reason);
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const workDir = await mkdtemp(path.join(tmpdir(), "bb-mpt-smoke-"));

  const images = IMAGE_CANDIDATES.filter((file) => existsSync(file));
  if (images.length === 0) {
    const generated = path.join(workDir, "product.jpg");
    ffmpeg([
      "-y",
      "-f",
      "lavfi",
      "-i",
      "color=c=0x1a4d3a:s=1080x1440",
      "-frames:v",
      "1",
      generated,
    ]);
    images.push(generated);
  }

  const imagePaths = images.slice(0, 5).map((file, index) => {
    const dest = path.join(workDir, `product-${index}${path.extname(file)}`);
    copyFileSync(file, dest);
    return dest;
  });

  const brollSource = imagePaths[1] ?? imagePaths[0]!;
  const videoPath = path.join(workDir, "broll.mp4");
  ffmpeg([
    "-y",
    "-loop",
    "1",
    "-i",
    brollSource,
    "-vf",
    "scale=1620:2880:force_original_aspect_ratio=increase,crop=1620:2880,crop=1080:1920:x='(in_w-out_w)*min(t/5,1)':y='(in_h-out_h)*0.3',format=yuv420p",
    "-t",
    "5",
    "-r",
    "30",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "26",
    videoPath,
  ]);

  const audioPath = path.join(workDir, "narration.wav");
  ffmpeg([
    "-y",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=196:sample_rate=44100:duration=30",
    "-ac",
    "2",
    "-ar",
    "44100",
    audioPath,
  ]);

  const rendered = await renderPrVideoWithMoneyPrinterTurbo({
    workDir,
    imagePaths,
    videoPaths: [videoPath],
    audioPath,
    scenes,
    outFile: OUT_MP4,
    bgmEnabled: true,
    subtitlesEnabled: true,
    product: {
      productName: "Matcha Gift Set",
      brandName: "BrandBridge Demo",
      category: "Food",
      description: "Ceremonial-grade matcha gift tin for Japanese wholesale partners.",
      country: "Japan",
      moq: "60 units",
      sellingPoint: "Gift-ready packaging with clear MOQ",
      cta: "See this listing on BrandBridge",
    },
  });

  if (!rendered) {
    console.error("MoneyPrinterTurbo returned no video.");
    process.exit(1);
  }

  const fallbackDir = await mkdtemp(path.join(tmpdir(), "bb-fallback-smoke-"));
  const fallback = await renderPrVideoMp4({
    workDir: fallbackDir,
    imagePaths,
    audioPath,
    scenes: scenes.slice(0, 3),
    outFile: FALLBACK_MP4,
    bgmEnabled: true,
    subtitlesEnabled: true,
    engine: "brandbridge",
    product: { productName: "Matcha Gift Set" },
  });

  const probeJson = ffprobe(OUT_MP4);
  const fallbackJson = ffprobe(FALLBACK_MP4);
  writeFileSync(path.join(OUT_DIR, "probe.json"), probeJson);
  writeFileSync(path.join(OUT_DIR, "fallback-probe.json"), fallbackJson);
  console.log(probeJson);
  console.log(
    JSON.stringify(
      {
        output: OUT_MP4,
        width: rendered.width,
        height: rendered.height,
        durationSeconds: rendered.durationSeconds,
        engine: "moneyprinterturbo",
        fallback: {
          output: FALLBACK_MP4,
          width: fallback.width,
          height: fallback.height,
          durationSeconds: fallback.durationSeconds,
          engine: "brandbridge",
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
