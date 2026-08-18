import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileExists, runFfmpeg } from "@/lib/marketing-agent/pr-video-ffmpeg";
import type { PrVideoScene } from "@/lib/marketing-agent/pr-script";

/**
 * MoneyPrinterTurbo-inspired narration subtitles.
 *
 * MPT (harry0703/MoneyPrinterTurbo) times cues by punctuation splits and
 * character-count proportion when TTS has no word timestamps. BrandBridge
 * Voicebox has no timestamps, so we reuse that fallback — not Whisper, Edge
 * TTS, MoviePy, or MPT's renderer.
 */

export type SubtitleCue = {
  startSeconds: number;
  endSeconds: number;
  text: string;
};

export type SubtitleFont = {
  path: string;
  family: string;
  fontsDir: string;
};

const FONT_CANDIDATES: Array<{ path: string; family: string }> = [
  {
    path: "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
    family: "WenQuanYi Micro Hei",
  },
  {
    path: "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    family: "Noto Sans CJK JP",
  },
  {
    path: "/usr/share/fonts/truetype/noto/NotoSansCJKjp-Regular.otf",
    family: "Noto Sans CJK JP",
  },
  {
    path: "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    family: "DejaVu Sans",
  },
  {
    path: "C:\\Windows\\Fonts\\meiryo.ttc",
    family: "Meiryo",
  },
  {
    path: "C:\\Windows\\Fonts\\YuGothR.ttc",
    family: "Yu Gothic",
  },
  {
    path: "C:\\Windows\\Fonts\\msgothic.ttc",
    family: "MS Gothic",
  },
  {
    path: "C:\\Windows\\Fonts\\arial.ttf",
    family: "Arial",
  },
];

const MAX_CHARS_PER_LINE = 16;
const MAX_LINES = 3;
const MIN_CUE_SECONDS = 0.7;

export function joinSceneNarration(scenes: PrVideoScene[]): string {
  return scenes
    .map((scene) => scene.narrationText.trim())
    .filter((text) => text.length > 0)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitNarrationCues(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const bySentence = normalized
    .split(/(?<=[。！？!?．.])\s*/)
    .flatMap((part) => {
      const trimmed = part.trim();
      if (!trimmed) return [];
      if (Array.from(trimmed).length <= 22) return [trimmed];
      return trimmed.split(/(?<=[、,，；;])\s*/).map((piece) => piece.trim());
    })
    .filter(Boolean);

  const merged: string[] = [];
  for (const part of bySentence) {
    const last = merged[merged.length - 1];
    if (last && Array.from(last).length < 8) {
      const joiner = /[\u3040-\u30ff\u4e00-\u9faf]/.test(last) ? "" : " ";
      merged[merged.length - 1] = `${last}${joiner}${part}`;
    } else {
      merged.push(part);
    }
  }

  return merged.length > 0 ? merged : [normalized];
}

export function wrapCueText(
  text: string,
  maxChars = MAX_CHARS_PER_LINE,
): string {
  const chars = Array.from(text.replace(/\s+/g, " ").trim());
  if (chars.length === 0) return "";
  if (chars.length <= maxChars) return chars.join("");

  const lines: string[] = [];
  let current = "";
  for (const char of chars) {
    if (lines.length >= MAX_LINES) {
      lines[MAX_LINES - 1] = `${lines[MAX_LINES - 1] ?? ""}${char}`;
      continue;
    }
    current += char;
    if (Array.from(current).length >= maxChars) {
      lines.push(current);
      current = "";
    }
  }
  if (current) {
    if (lines.length < MAX_LINES) lines.push(current);
    else lines[lines.length - 1] = `${lines[lines.length - 1] ?? ""}${current}`;
  }

  return lines.join("\n");
}

export function timeNarrationCues(
  sentences: string[],
  durationSeconds: number,
): SubtitleCue[] {
  const cleaned = sentences.map((text) => text.trim()).filter(Boolean);
  if (cleaned.length === 0 || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return [];
  }

  const totalChars = cleaned.reduce(
    (sum, text) => sum + Math.max(Array.from(text).length, 1),
    0,
  );
  const safeDuration = Math.max(durationSeconds, MIN_CUE_SECONDS);
  const cues: SubtitleCue[] = [];
  let cursor = 0;

  for (let index = 0; index < cleaned.length; index += 1) {
    const text = cleaned[index]!;
    const isLast = index === cleaned.length - 1;
    const share = Math.max(Array.from(text).length, 1) / totalChars;
    const rawEnd = isLast
      ? safeDuration
      : Math.min(safeDuration, cursor + Math.max(share * safeDuration, MIN_CUE_SECONDS));
    const endSeconds = Math.max(rawEnd, cursor + 0.12);
    cues.push({
      startSeconds: cursor,
      endSeconds: Math.min(endSeconds, safeDuration),
      text,
    });
    cursor = cues[cues.length - 1]!.endSeconds;
  }

  const last = cues[cues.length - 1];
  if (last) last.endSeconds = safeDuration;
  return cues;
}

export function cuesFromScenes(
  scenes: PrVideoScene[],
  durationSeconds: number,
): SubtitleCue[] {
  return timeNarrationCues(
    splitNarrationCues(joinSceneNarration(scenes)),
    durationSeconds,
  );
}

export function cuesFromSceneTimeline(scenes: PrVideoScene[]): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  let cursor = 0;
  for (const scene of scenes) {
    const duration = Math.max(scene.durationSeconds, 0.7);
    const text = scene.onScreenText.trim() || scene.narrationText.trim();
    if (text) {
      cues.push({
        startSeconds: cursor,
        endSeconds: cursor + duration,
        text,
      });
    }
    cursor += duration;
  }
  return cues;
}

function assTime(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const totalCs = Math.round(clamped * 100);
  const hours = Math.floor(totalCs / 360000);
  const minutes = Math.floor((totalCs % 360000) / 6000);
  const secs = Math.floor((totalCs % 6000) / 100);
  const centiseconds = totalCs % 100;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function escapeAssText(text: string): string {
  return wrapCueText(text)
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n/g, "\\N");
}

export function cuesToAss(
  cues: SubtitleCue[],
  input: { width: number; height: number; fontFamily: string },
): string {
  const header = [
    "[Script Info]",
    "ScriptType: v4.00+",
    `PlayResX: ${input.width}`,
    `PlayResY: ${input.height}`,
    "WrapStyle: 2",
    "ScaledBorderAndShadow: yes",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    `Style: Default,${input.fontFamily},52,&H00FFFFFF,&H000000FF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,3.2,1.2,2,48,48,180,1`,
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
  ];

  const events = cues
    .filter((cue) => cue.text.trim().length > 0 && cue.endSeconds > cue.startSeconds)
    .map(
      (cue) =>
        `Dialogue: 0,${assTime(cue.startSeconds)},${assTime(cue.endSeconds)},Default,,0,0,0,,${escapeAssText(cue.text)}`,
    );

  return `${header.join("\n")}\n${events.join("\n")}\n`;
}

function srtTime(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const totalMs = Math.round(clamped * 1000);
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1000);
  const millis = totalMs % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

export function cuesToSrt(cues: SubtitleCue[]): string {
  return cues
    .filter((cue) => cue.text.trim().length > 0 && cue.endSeconds > cue.startSeconds)
    .map((cue, index) => {
      const text = wrapCueText(cue.text.trim());
      return `${index + 1}\n${srtTime(cue.startSeconds)} --> ${srtTime(cue.endSeconds)}\n${text}\n`;
    })
    .join("\n");
}

export async function writeNarrationSrtFile(input: {
  scenes: PrVideoScene[];
  durationSeconds: number;
  outFile: string;
}): Promise<boolean> {
  const timeline = cuesFromSceneTimeline(input.scenes);
  const cues =
    timeline.length > 0
      ? timeline
      : cuesFromScenes(input.scenes, input.durationSeconds);
  if (cues.length === 0) return false;
  await writeFile(input.outFile, cuesToSrt(cues), "utf8");
  return true;
}

export async function resolveSubtitleFont(): Promise<SubtitleFont | null> {
  for (const candidate of FONT_CANDIDATES) {
    if (await fileExists(candidate.path)) {
      return {
        path: candidate.path,
        family: candidate.family,
        fontsDir: path.dirname(candidate.path),
      };
    }
  }
  return null;
}

function escapeFilterPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "\\'");
}

export function subtitleFilterExpression(
  assPath: string,
  fontsDir: string,
): string {
  return `ass='${escapeFilterPath(assPath)}':fontsdir='${escapeFilterPath(fontsDir)}'`;
}

export async function writeNarrationAssFile(input: {
  scenes: PrVideoScene[];
  durationSeconds: number;
  outFile: string;
  width: number;
  height: number;
  fontFamily: string;
}): Promise<boolean> {
  const cues = cuesFromScenes(input.scenes, input.durationSeconds);
  if (cues.length === 0) return false;
  const ass = cuesToAss(cues, {
    width: input.width,
    height: input.height,
    fontFamily: input.fontFamily,
  });
  await writeFile(input.outFile, ass, "utf8");
  return true;
}

export async function burnSubtitlesOntoVideo(input: {
  videoPath: string;
  assPath: string;
  fontsDir: string;
  outFile: string;
}): Promise<void> {
  await runFfmpeg(
    [
      "-y",
      "-i",
      input.videoPath,
      "-vf",
      subtitleFilterExpression(input.assPath, input.fontsDir),
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
      input.outFile,
    ],
    60_000,
  );
}
