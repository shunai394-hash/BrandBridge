import { writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";

const execFileAsync = promisify(execFile);

const VOICEBOX_URL =
  process.env.VOICEBOX_BASE_URL ?? "http://127.0.0.1:17493";

const VOICEBOX_PROFILE =
  process.env.VOICEBOX_PROFILE_ID ??
  "e30baf01-8c2e-477c-be6f-78c3a5b59e8a";

export function detectSpeechVoice(text: string): "ja" | "en" {
  return /[\u3040-\u30ff\u4e00-\u9faf]/.test(text) ? "ja" : "en";
}

async function voiceboxRequest(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Voicebox connection failed";

    throw new MarketingAgentError(
      "TTS_UNAVAILABLE",
      `Voiceboxに接続できません: ${message}`,
    );
  }
}

async function waitForVoiceboxGeneration(
  generationId: string,
): Promise<void> {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    const response = await voiceboxRequest(
      `${VOICEBOX_URL}/generate/${generationId}/status`,
    );

    if (!response.ok) {
      throw new MarketingAgentError(
        "TTS_FAILURE",
        `Voicebox status failed: HTTP ${response.status}`,
      );
    }

    const raw = await response.text();

    let data: {
      status?: string;
      error?: string | null;
    };

    try {
      const jsonText = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim())
        .find((line) => line.startsWith("{"));

      data = JSON.parse(jsonText ?? raw);
    } catch {
      throw new MarketingAgentError(
        "TTS_FAILURE",
        `Voicebox status response could not be parsed: ${raw.slice(0, 300)}`,
      );
    }

    if (data.status === "completed") {
      return;
    }

    if (data.status === "failed" || data.status === "cancelled") {
      throw new MarketingAgentError(
        "TTS_FAILURE",
        `Voicebox generation failed: ${data.error ?? data.status}`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new MarketingAgentError(
    "TTS_FAILURE",
    "Voicebox generation timed out.",
  );
}

async function exportVoiceboxAudio(
  generationId: string,
  outFile: string,
): Promise<void> {
  const response = await voiceboxRequest(
    `${VOICEBOX_URL}/history/${generationId}/export-audio`,
  );

  if (!response.ok) {
    throw new MarketingAgentError(
      "TTS_FAILURE",
      `Voicebox audio export failed: HTTP ${response.status}`,
    );
  }

  const bytes = Buffer.from(await response.arrayBuffer());

  if (bytes.length < 1024) {
    throw new MarketingAgentError(
      "TTS_FAILURE",
      "Voicebox returned an empty audio file.",
    );
  }

  await writeFile(outFile, bytes);
}

export async function synthesizeNarrationWav(input: {
  text: string;
  outFile: string;
}): Promise<{ durationSeconds: number }> {
  const text = input.text
  .replace(/\b(?:Chinese|English|Spanish|French|Korean)\s+narrator\b\s*[:：-]?\s*/gi, "")
  .replace(/\b(?:Chinese|English|Spanish|French|Korean)\b\s*(?:narrator|speaker|voice)?\b\s*[:：-]?\s*/gi, "")
  .replace(/\s+/g, " ")
  .trim();

  if (!text) {
    throw new MarketingAgentError(
      "TTS_FAILURE",
      "Narration text is empty.",
    );
  }

  const language = "ja";

  const response = await voiceboxRequest(
    `${VOICEBOX_URL}/speak`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        text,
        profile: VOICEBOX_PROFILE,
        engine: "kokoro",
        language,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new MarketingAgentError(
      "TTS_FAILURE",
      `Voicebox speak failed: HTTP ${response.status} ${errorText.slice(0, 300)}`,
    );
  }

  const generation = (await response.json()) as {
    id?: string;
    language?: string;
    engine?: string;
    status?: string;
  };

  if (!generation.id) {
    throw new MarketingAgentError(
      "TTS_FAILURE",
      "Voicebox did not return a generation ID.",
    );
  }

  if (language === "ja" && generation.language !== "ja") {
    throw new MarketingAgentError(
      "TTS_FAILURE",
      `Voicebox returned unexpected language: ${generation.language ?? "unknown"}`,
    );
  }

  await waitForVoiceboxGeneration(generation.id);

  await exportVoiceboxAudio(
    generation.id,
    input.outFile,
  );

  const durationSeconds = await probeAudioDuration(input.outFile);

  if (
    !Number.isFinite(durationSeconds) ||
    durationSeconds < 0.5
  ) {
    throw new MarketingAgentError(
      "TTS_FAILURE",
      "Voicebox produced invalid audio.",
    );
  }

  return { durationSeconds };
}

export async function probeAudioDuration(
  filePath: string,
): Promise<number> {
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

