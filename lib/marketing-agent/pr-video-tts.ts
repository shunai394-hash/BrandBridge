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
