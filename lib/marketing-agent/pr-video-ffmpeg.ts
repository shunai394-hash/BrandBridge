import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";

const execFileAsync = promisify(execFile);

export async function resolveFfmpegBin(): Promise<string> {
  if (process.platform === "win32") {
    try {
      const { stdout } = await execFileAsync(
        "where.exe",
        ["ffmpeg"],
        { timeout: 5000 },
      );

      const bin = stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find((line) => line.length > 0);

      if (bin) {
        return bin;
      }
    } catch {
      /* fall through */
    }

    try {
      await execFileAsync(
        "ffmpeg",
        ["-version"],
        { timeout: 5000 },
      );

      return "ffmpeg";
    } catch {
      /* fall through */
    }
  } else {
    try {
      const { stdout } = await execFileAsync(
        "which",
        ["ffmpeg"],
        { timeout: 5000 },
      );

      const bin = stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find((line) => line.length > 0);

      if (bin) {
        return bin;
      }
    } catch {
      /* fall through */
    }

    try {
      await execFileAsync(
        "ffmpeg",
        ["-version"],
        { timeout: 5000 },
      );

      return "ffmpeg";
    } catch {
      /* fall through */
    }
  }

  throw new MarketingAgentError(
    "FFMPEG_UNAVAILABLE",
    "FFmpeg is unavailable. Local/Node MVP requires ffmpeg on PATH. Vercel serverless cannot render 30s MP4s.",
  );
}

export async function assertFfmpegAvailable(): Promise<string> {
  const bin = await resolveFfmpegBin();

  try {
    await execFileAsync(
      bin,
      ["-version"],
      { timeout: 8000 },
    );
  } catch {
    throw new MarketingAgentError(
      "FFMPEG_UNAVAILABLE",
      "FFmpeg is installed but could not start.",
    );
  }

  return bin;
}

export async function runFfmpeg(
  args: string[],
  timeoutMs = 90_000,
): Promise<void> {
  const bin = await resolveFfmpegBin();

  try {
    await execFileAsync(bin, args, {
      timeout: timeoutMs,
      maxBuffer: 8 * 1024 * 1024,
    });
  } catch (error) {
    const err = error as {
      killed?: boolean;
      message?: string;
      stderr?: string;
    };

    if (err.killed) {
      throw new MarketingAgentError(
        "AI_TIMEOUT",
        "Video rendering timed out. Please try again locally.",
      );
    }

    const detail = String(
      err.stderr || err.message || "ffmpeg failed",
    ).slice(0, 220);

    throw new MarketingAgentError(
      "RENDER_FAILURE",
      `Video rendering failed: ${detail}`,
    );
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}
