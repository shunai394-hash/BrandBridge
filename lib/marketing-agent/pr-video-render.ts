import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { PrVideoScene } from "@/lib/marketing-agent/pr-script";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import { fileExists, runFfmpeg } from "@/lib/marketing-agent/pr-video-ffmpeg";
import { probeAudioDuration } from "@/lib/marketing-agent/pr-video-tts";

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 24;

const FONT_CANDIDATES = [
  "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
  "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
];

type KenBurns = {
  z: string;
  x: string;
  y: string;
};

function kenBurnsForScene(index: number, frames: number): KenBurns {
  const n = Math.max(frames, 1);
  const patterns: KenBurns[] = [
    {
      z: `min(1+0.0014*on,1.16)`,
      x: "iw/2-(iw/zoom/2)",
      y: "ih/2-(ih/zoom/2)",
    },
    {
      z: "1.12",
      x: `(iw-iw/zoom)*min(on/${n},1)`,
      y: "ih/2-(ih/zoom/2)",
    },
    {
      z: `min(1+0.0022*on,1.28)`,
      x: "iw/2-(iw/zoom/2)",
      y: "ih/2-(ih/zoom/2)",
    },
    {
      z: `max(1.18-0.0016*on,1.02)`,
      x: "iw/2-(iw/zoom/2)",
      y: "ih/2-(ih/zoom/2)",
    },
    {
      z: `min(1+0.0009*on,1.1)`,
      x: "iw/2-(iw/zoom/2)",
      y: `(ih-ih/zoom)*min(on/${n},1)`,
    },
  ];
  return patterns[index % patterns.length] ?? patterns[0];
}

function wrapOnScreenText(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  const max = 16;
  const lines: string[] = [];
  let current = "";
  for (const char of Array.from(trimmed)) {
    current += char;
    if (current.length >= max) {
      lines.push(current);
      current = "";
      if (lines.length >= 3) break;
    }
  }
  if (current && lines.length < 3) lines.push(current);
  return lines.join("\n");
}

async function resolveFontFile(): Promise<string> {
  for (const candidate of FONT_CANDIDATES) {
    if (await fileExists(candidate)) return candidate;
  }
  throw new MarketingAgentError(
    "RENDER_FAILURE",
    "No subtitle font found on this server.",
  );
}

export async function renderPrVideoMp4(input: {
  workDir: string;
  imagePath: string;
  audioPath: string;
  scenes: PrVideoScene[];
  outFile: string;
}): Promise<{ width: number; height: number; durationSeconds: number }> {
  const fontfile = await resolveFontFile();
  const sceneFiles: string[] = [];

  for (let i = 0; i < input.scenes.length; i += 1) {
    const scene = input.scenes[i];
    if (!scene) continue;
    const duration = Math.max(scene.durationSeconds, 1.2);
    const frames = Math.max(Math.round(duration * VIDEO_FPS), VIDEO_FPS);
    const kb = kenBurnsForScene(i, frames);
    const textPath = path.join(input.workDir, `caption-${i}.txt`);
    await writeFile(textPath, wrapOnScreenText(scene.onScreenText), "utf8");
    const sceneFile = path.join(input.workDir, `scene-${i}.mp4`);

    const vf = [
      `scale=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:force_original_aspect_ratio=increase`,
      `crop=${VIDEO_WIDTH}:${VIDEO_HEIGHT}`,
      `zoompan=z='${kb.z}':x='${kb.x}':y='${kb.y}':d=1:s=${VIDEO_WIDTH}x${VIDEO_HEIGHT}:fps=${VIDEO_FPS}`,
      `drawtext=fontfile='${fontfile}':textfile='${textPath}':reload=0:fontsize=42:fontcolor=white:borderw=3:bordercolor=black:line_spacing=8:box=1:boxcolor=black@0.42:boxborderw=18:x=(w-text_w)/2:y=h-text_h-150`,
      "format=yuv420p",
    ].join(",");

    await runFfmpeg(
      [
        "-y",
        "-loop",
        "1",
        "-framerate",
        String(VIDEO_FPS),
        "-i",
        input.imagePath,
        "-vf",
        vf,
        "-t",
        duration.toFixed(3),
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "26",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        sceneFile,
      ],
      60_000,
    );
    sceneFiles.push(sceneFile);
  }

  if (sceneFiles.length === 0) {
    throw new MarketingAgentError("RENDER_FAILURE", "No video scenes were rendered.");
  }

  const listFile = path.join(input.workDir, "concat.txt");
  await writeFile(
    listFile,
    sceneFiles.map((file) => `file '${file.replace(/'/g, "'\\''")}'`).join("\n"),
    "utf8",
  );

  const concatFile = path.join(input.workDir, "concat.mp4");
  await runFfmpeg(
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listFile,
      "-c",
      "copy",
      concatFile,
    ],
    30_000,
  );

  const videoDur = await probeAudioDuration(concatFile);
  const audioDur = await probeAudioDuration(input.audioPath);
  const muxArgs =
    Number.isFinite(videoDur) && Number.isFinite(audioDur) && videoDur > audioDur + 0.15
      ? [
          "-y",
          "-i",
          concatFile,
          "-i",
          input.audioPath,
          "-filter_complex",
          `[1:a]apad=whole_dur=${videoDur.toFixed(3)}[a]`,
          "-map",
          "0:v:0",
          "-map",
          "[a]",
          "-c:v",
          "copy",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "-ac",
          "2",
          "-ar",
          "44100",
          "-movflags",
          "+faststart",
          input.outFile,
        ]
      : [
          "-y",
          "-i",
          concatFile,
          "-i",
          input.audioPath,
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
          "-ac",
          "2",
          "-ar",
          "44100",
          "-movflags",
          "+faststart",
          input.outFile,
        ];

  await runFfmpeg(muxArgs, 40_000);

  const finalDur = await probeAudioDuration(input.outFile);
  if (!(await fileExists(input.outFile)) || !Number.isFinite(finalDur) || finalDur < 1) {
    throw new MarketingAgentError("RENDER_FAILURE", "MP4 output was incomplete.");
  }

  return {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    durationSeconds: finalDur,
  };
}
