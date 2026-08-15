import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";

const execFileAsync = promisify(execFile);

export function detectSpeechVoice(text: string): "ja" | "en" {
  return /[\u3040-\u30ff\u4e00-\u9faf]/.test(text) ? "ja" : "en";
}

export async function resolveEspeakBin(): Promise<string> {
  const commands =
    process.platform === "win32"
      ? ["where.exe"]
      : ["which"];

  try {
    const { stdout } = await execFileAsync(commands[0]!, ["espeak-ng"], {
      timeout: 5000,
    });

    const bin = stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0);

    if (bin) return bin;
  } catch {
    /* fall through */
  }

  throw new MarketingAgentError(
    "TTS_UNAVAILABLE",
    "TTS is unavailable. Install espeak-ng on the server.",
  );
}

function runWithStdin(
  command: string,
  args: string[],
  input: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { timeout: 10_000 });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0 && stdout.trim()) {
        resolve(stdout.replace(/\s+/g, " ").trim());
        return;
      }
      reject(new Error(stderr.trim() || `${command} failed`));
    });
    child.stdin.write(input, "utf8");
    child.stdin.end();
  });
}

/**
 * espeak-ng -v ja (voice file jpx/ja) only knows hiragana/katakana.
 * Unknown kanji is spoken as English "Chinese letter"; an unknown kana
 * codepoint is spoken as "Japanese letter". `-v jpx` is not a voice
 * (empty phoneme table / segfault). After kana conversion, ASCII tokens
 * such as BrandBridge must be spaced so espeak can leave English mode.
 */
function spaceLatinForEspeak(text: string): string {
  return text
    .replace(/[A-Za-z][A-Za-z0-9._-]*/g, " $& ")
    .replace(/\s+/g, " ")
    .trim();
}

async function japaneseYomi(text: string): Promise<string> {
  let yomi = "";

  try {
    yomi = await runWithStdin("mecab", ["-Oyomi"], text);
  } catch {
    /* fall through */
  }

  if (!yomi) {
    try {
      yomi = await runWithStdin(
        "kakasi",
        ["-iutf8", "-outf8", "-JH", "-KH"],
        text,
      );
    } catch {
      /* fall through */
    }
  }

  if (!yomi) {
    throw new MarketingAgentError(
      "TTS_FAILURE",
      "Japanese TTS requires mecab (mecab-ipadic-utf8) so kanji can be read as Japanese.",
    );
  }

  return spaceLatinForEspeak(yomi);
}

function voiceboxBaseUrl(): string {
  return (process.env.VOICEBOX_URL || "http://127.0.0.1:17493").replace(
    /\/$/,
    "",
  );
}

async function voiceboxAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${voiceboxBaseUrl()}/`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) return false;
    const body = (await response.json()) as { message?: string; version?: string };
    return Boolean(body.message || body.version);
  } catch {
    return false;
  }
}

async function waitVoiceboxCompleted(generationId: string): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < 120_000) {
    const response = await fetch(
      `${voiceboxBaseUrl()}/generate/${generationId}/status`,
      { signal: AbortSignal.timeout(10_000) },
    );
    const body = (await response.json()) as {
      status?: string;
      error?: string;
      detail?: string;
    };
    if (!response.ok) {
      throw new Error(body.error || body.detail || `status HTTP ${response.status}`);
    }
    if (body.status === "completed") return;
    if (body.status === "failed" || body.status === "error") {
      throw new Error(body.error || body.detail || "Voicebox generation failed");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Voicebox generation timed out");
}

async function synthesizeViaVoicebox(input: {
  text: string;
  outFile: string;
}): Promise<{ durationSeconds: number }> {
  const profile =
    process.env.VOICEBOX_PROFILE || process.env.VOICEBOX_PROFILE_ID || "";
  const speakBody: Record<string, string> = {
    text: input.text,
    language: "ja",
  };
  if (profile) speakBody.profile = profile;

  const speakResponse = await fetch(`${voiceboxBaseUrl()}/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(speakBody),
    signal: AbortSignal.timeout(15_000),
  });
  const speakJson = (await speakResponse.json()) as {
    id?: string;
    error?: string;
    detail?: string;
  };
  if (!speakResponse.ok || !speakJson.id) {
    throw new Error(
      speakJson.error ||
        speakJson.detail ||
        `Voicebox /speak HTTP ${speakResponse.status}`,
    );
  }

  await waitVoiceboxCompleted(speakJson.id);

  const audioResponse = await fetch(
    `${voiceboxBaseUrl()}/audio/${speakJson.id}`,
    { signal: AbortSignal.timeout(30_000) },
  );
  if (!audioResponse.ok) {
    throw new Error(
      `Voicebox /audio HTTP ${audioResponse.status} (status was completed but audio was empty)`,
    );
  }
  const bytes = Buffer.from(await audioResponse.arrayBuffer());
  if (bytes.byteLength < 256) {
    throw new Error("Voicebox returned an empty audio file");
  }
  await writeFile(input.outFile, bytes);

  const durationSeconds = await probeAudioDuration(input.outFile);
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0.5) {
    throw new MarketingAgentError("TTS_FAILURE", "TTS produced empty audio.");
  }
  return { durationSeconds };
}

export async function synthesizeNarrationWav(input: {
  text: string;
  outFile: string;
}): Promise<{ durationSeconds: number }> {
  const text = input.text.replace(/\s+/g, " ").trim();

  if (!text) {
    throw new MarketingAgentError("TTS_FAILURE", "Narration text is empty.");
  }

  const voice = detectSpeechVoice(text);
  const required = process.env.VOICEBOX_REQUIRED === "1";

  if (voice === "ja") {
    const available = await voiceboxAvailable();
    if (available) {
      try {
        return await synthesizeViaVoicebox({ text, outFile: input.outFile });
      } catch (error) {
        if (required) {
          const message = error instanceof Error ? error.message : "Voicebox failed";
          throw new MarketingAgentError(
            "TTS_FAILURE",
            `Voicebox TTS failed: ${message.slice(0, 180)}`,
          );
        }
      }
    } else if (required) {
      throw new MarketingAgentError(
        "TTS_UNAVAILABLE",
        `Voicebox is not reachable at ${voiceboxBaseUrl()}.`,
      );
    }
  }

  const bin = await resolveEspeakBin();
  const spoken = voice === "ja" ? await japaneseYomi(text) : text;
  const textFile = path.join(path.dirname(input.outFile), "narration.txt");

  await writeFile(textFile, spoken, "utf8");

  const voiceArgs =
    voice === "ja"
      ? ["-v", "ja", "-s", "120", "-p", "50", "-a", "140"]
      : ["-v", "en", "-s", "135", "-p", "40"];

  try {
    await execFileAsync(
      bin,
      [...voiceArgs, "-f", textFile, "-w", input.outFile],
      {
        timeout: 40_000,
        maxBuffer: 2 * 1024 * 1024,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "TTS failed";

    throw new MarketingAgentError(
      "TTS_FAILURE",
      `TTS failed: ${message.slice(0, 180)}`,
    );
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
