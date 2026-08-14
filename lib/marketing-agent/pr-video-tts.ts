import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";

const execFileAsync = promisify(execFile);

export function detectSpeechVoice(text: string): "ja" | "en" {
  return /[\u3040-\u30ff\u4e00-\u9faf]/.test(text) ? "ja" : "en";
}

export async function resolveEspeakBin(): Promise<string> {
  try {
    const { stdout } = await execFileAsync("which", ["espeak-ng"], { timeout: 5000 });
    const bin = stdout.trim();
    if (bin) return bin;
  } catch {
    /* fall through */
  }
  throw new MarketingAgentError(
    "TTS_UNAVAILABLE",
    "TTS is unavailable. Install espeak-ng on the server (local MVP). This does not run on Vercel.",
  );
}

export async function synthesizeNarrationWav(input: {
  text: string;
  outFile: string;
}): Promise<{ durationSeconds: number }> {
  const text = input.text.replace(/\s+/g, " ").trim();
  if (!text) {
    throw new MarketingAgentError("TTS_FAILURE", "Narration text is empty.");
  }

  const bin = await resolveEspeakBin();
  const voice = detectSpeechVoice(text);
  const textFile = path.join(path.dirname(input.outFile), "narration.txt");
  await writeFile(textFile, text, "utf8");

  try {
    await execFileAsync(
      bin,
      ["-v", voice, "-s", "135", "-p", "40", "-f", textFile, "-w", input.outFile],
      { timeout: 40_000, maxBuffer: 2 * 1024 * 1024 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "TTS failed";
    throw new MarketingAgentError("TTS_FAILURE", `TTS failed: ${message.slice(0, 180)}`);
  }

  const durationSeconds = await probeAudioDuration(input.outFile);
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0.5) {
    throw new MarketingAgentError("TTS_FAILURE", "TTS produced empty audio.");
  }
  return { durationSeconds };
}

export async function probeAudioDuration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execFileAsync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        filePath,
      ],
      { timeout: 10_000 },
    );
    return Number(stdout.trim());
  } catch {
    return NaN;
  }
}
