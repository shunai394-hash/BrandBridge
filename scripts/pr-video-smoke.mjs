#!/usr/bin/env node
/**
 * Local smoke: one still image → Ken Burns scenes + espeak narration → MP4.
 * Does not hit Next.js, DB, or AI.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const W = 1080;
const H = 1920;
const FPS = 24;
const FONT = "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc";
const OUT_DIR = "/tmp/bb-pr-video-smoke";
const OUT_MP4 = path.join(OUT_DIR, "preview.mp4");
const OUT_HTML = path.join(OUT_DIR, "preview.html");

mkdirSync(OUT_DIR, { recursive: true });
const work = mkdtempSync(path.join(tmpdir(), "bb-pr-smoke-"));

function run(bin, args) {
  execFileSync(bin, args, { stdio: "pipe" });
}

const image = path.join(work, "product.jpg");
run("ffmpeg", [
  "-y",
  "-f",
  "lavfi",
  "-i",
  "color=c=0x12344d:s=1200x1600",
  "-vf",
  "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='BrandBridge Product':fontcolor=white:fontsize=64:x=(w-text_w)/2:y=(h-text_h)/2",
  "-frames:v",
  "1",
  image,
]);

const scenes = [
  { dur: 6, caption: "Hook: meet the product" },
  { dur: 6, caption: "Features that matter" },
  { dur: 6, caption: "Built for Japan partners" },
  { dur: 6, caption: "Trusted wholesale terms" },
  { dur: 6, caption: "Learn more on BrandBridge" },
];

const narration =
  "Meet this product. Clear features for Japanese sales partners. Reliable wholesale terms. Learn more on BrandBridge.";
const wav = path.join(work, "n.wav");
writeFileSync(path.join(work, "n.txt"), narration);
run("espeak-ng", ["-v", "en", "-s", "135", "-f", path.join(work, "n.txt"), "-w", wav]);

const zooms = [
  "min(1+0.0014*on,1.16)",
  "1.12",
  "min(1+0.0022*on,1.28)",
  "max(1.18-0.0016*on,1.02)",
  "min(1+0.0009*on,1.1)",
];
const sceneFiles = [];
for (let i = 0; i < scenes.length; i += 1) {
  const caption = path.join(work, `c${i}.txt`);
  writeFileSync(caption, scenes[i].caption);
  const out = path.join(work, `s${i}.mp4`);
  const frames = Math.round(scenes[i].dur * FPS);
  const vf = [
    `scale=${W}:${H}:force_original_aspect_ratio=increase`,
    `crop=${W}:${H}`,
    `zoompan=z='${zooms[i]}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS}`,
    `drawtext=fontfile='${FONT}':textfile='${caption}':fontsize=42:fontcolor=white:borderw=3:bordercolor=black:box=1:boxcolor=black@0.42:boxborderw=18:x=(w-text_w)/2:y=h-text_h-150`,
    "format=yuv420p",
  ].join(",");
  run("ffmpeg", [
    "-y",
    "-loop",
    "1",
    "-framerate",
    String(FPS),
    "-i",
    image,
    "-vf",
    vf,
    "-t",
    String(scenes[i].dur),
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "26",
    "-pix_fmt",
    "yuv420p",
    out,
  ]);
  sceneFiles.push(out);
}

const list = path.join(work, "list.txt");
writeFileSync(list, sceneFiles.map((f) => `file '${f}'`).join("\n"));
const concat = path.join(work, "concat.mp4");
run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", concat]);
run("ffmpeg", [
  "-y",
  "-i",
  concat,
  "-i",
  wav,
  "-map",
  "0:v:0",
  "-map",
  "1:a:0",
  "-c:v",
  "copy",
  "-c:a",
  "aac",
  "-b:a",
  "128k",
  "-movflags",
  "+faststart",
  OUT_MP4,
]);

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
  OUT_MP4,
]).toString();
console.log(probe);
run("ffmpeg", ["-y", "-i", OUT_MP4, "-ss", "2", "-frames:v", "1", path.join(OUT_DIR, "frame-hook.jpg")]);
run("ffmpeg", ["-y", "-i", OUT_MP4, "-ss", "14", "-frames:v", "1", path.join(OUT_DIR, "frame-mid.jpg")]);
run("ffmpeg", ["-y", "-i", OUT_MP4, "-ss", "27", "-frames:v", "1", path.join(OUT_DIR, "frame-cta.jpg")]);

writeFileSync(
  OUT_HTML,
  `<!doctype html><meta charset="utf-8"><title>PR video smoke</title>
<body style="background:#111;color:#eee;font-family:sans-serif;display:flex;flex-direction:column;align-items:center">
<h1>PR video smoke</h1>
<video src="./preview.mp4" controls autoplay style="width:270px;aspect-ratio:9/16;background:#000"></video>
<p>1080x1920 Ken Burns + narration + burned-in captions</p>
</body>`,
);

rmSync(work, { recursive: true, force: true });
console.log("Wrote", OUT_MP4, OUT_HTML);
