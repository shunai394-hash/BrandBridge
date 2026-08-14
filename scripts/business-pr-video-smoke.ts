/**
 * Local smoke: 3 stills → per-scene images + Japanese espeak + FFmpeg MP4.
 * Does not hit Next.js, DB, or AI.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fallbackBusinessPrScript } from "../lib/marketing-agent/business-pr-script";
import { isNaturalJapaneseNarration, japaneseNarrationIssues } from "../lib/marketing-agent/japanese-narration";
import { assignSceneImageIndexes } from "../lib/marketing-agent/pr-script";
import { generateBusinessPrVideo } from "../lib/marketing-agent/pr-video-core";

const OUT_DIR = "/tmp/bb-business-pr-video-smoke";
mkdirSync(OUT_DIR, { recursive: true });
const work = mkdtempSync(path.join(tmpdir(), "bb-biz-pr-smoke-"));

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const goodJa =
  "日本市場に挑戦したい海外ブランドへ。日本でビジネスを始めるには、商品を売るだけではありません。BrandBridgeは海外ブランドと日本のビジネスをつなぎます。";
assert(isNaturalJapaneseNarration(goodJa), `expected Japanese: ${japaneseNarrationIssues(goodJa).join(",")}`);
assert(
  !isNaturalJapaneseNarration("Chinese Chinese Chinese"),
  "should reject language dump",
);
assert(
  !isNaturalJapaneseNarration("This product is high quality and has great features."),
  "should reject English product pitch",
);

const assigned = assignSceneImageIndexes(
  [
    { sceneNumber: 1, durationSeconds: 4, visual: "a", narrationText: "あ", onScreenText: "あ" },
    { sceneNumber: 2, durationSeconds: 4, visual: "b", narrationText: "い", onScreenText: "い" },
    { sceneNumber: 3, durationSeconds: 4, visual: "c", narrationText: "う", onScreenText: "う" },
    { sceneNumber: 4, durationSeconds: 4, visual: "d", narrationText: "え", onScreenText: "え", imageIndex: 0 },
  ],
  3,
);
assert(assigned.map((s) => s.imageIndex).join(",") === "0,1,2,0", "scene image indexes");

function still(name: string, color: string, label: string) {
  const file = path.join(work, name);
  execFileSync("ffmpeg", [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `color=c=${color}:s=1200x1600`,
    "-vf",
    `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${label}':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2`,
    "-frames:v",
    "1",
    file,
  ]);
  return file;
}

async function main() {
const files = [
  still("night.jpg", "0x0b1d36", "Night"),
  still("city.jpg", "0x1f4e79", "City"),
  still("office.jpg", "0x2c5f4a", "Office"),
];

const brief = {
  companyName: "BrandBridge",
  brandName: "BrandBridge",
  businessDescription:
    "海外ブランドと日本の販売パートナーをつなぐB2Bマッチングプラットフォームです。",
  targetAudience: "日本市場に挑戦したい海外ブランド",
  videoPurpose: "会社・事業を知ってもらい、BrandBridgeへのアクセスにつなげる",
  imageCount: files.length,
};
const script = fallbackBusinessPrScript(brief);
const narration = script.scenes.map((s) => s.narrationText).join(" ");
assert(isNaturalJapaneseNarration(narration), `fallback narration: ${japaneseNarrationIssues(narration).join(",")}`);

const images = files.map((file) => ({
  bytes: readFileSync(file),
  contentType: "image/jpeg",
}));

const result = await generateBusinessPrVideo({
  script,
  images,
  companyName: "BrandBridge",
});

const outMp4 = path.join(OUT_DIR, result.fileName);
writeFileSync(outMp4, result.bytes);

assert(result.width === 1080, `width ${result.width}`);
assert(result.height === 1920, `height ${result.height}`);
assert(result.durationSeconds >= 20, `duration ${result.durationSeconds}`);
assert(result.durationSeconds <= 40, `duration too long ${result.durationSeconds}`);
assert(result.bytes.byteLength > 50_000, `size ${result.bytes.byteLength}`);

const probe = execFileSync("ffprobe", [
  "-v",
  "error",
  "-select_streams",
  "v:0",
  "-show_entries",
  "stream=width,height,codec_name",
  "-show_entries",
  "format=duration",
  "-of",
  "json",
  outMp4,
]).toString();
console.log(probe);
console.log(
  JSON.stringify(
    {
      file: outMp4,
      bytes: result.bytes.byteLength,
      durationSeconds: result.durationSeconds,
      width: result.width,
      height: result.height,
      scenes: script.scenes.map((s) => s.imageIndex),
      japanese: true,
    },
    null,
    2,
  ),
);

rmSync(work, { recursive: true, force: true });
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
