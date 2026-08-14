/** Strip credentials from user-facing error text. Never log secrets. */
export function redactSecrets(text: string): string {
  return text
    .replace(/gsk_[A-Za-z0-9]+/g, "[redacted]")
    .replace(/sk-[A-Za-z0-9-]+/g, "[redacted]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/AKIA[A-Z0-9]{8,}/g, "[redacted]")
    .replace(/r2\.cloudflarestorage\.com\/[^\s"']+/gi, "r2.cloudflarestorage.com/[redacted]");
}

export type PrVideoStage =
  | "vercel"
  | "cloud-run"
  | "image"
  | "tts"
  | "ffmpeg"
  | "r2"
  | "timeout";

export function stageFromErrorCode(code: string | undefined): PrVideoStage | undefined {
  switch (code) {
    case "INVALID_IMAGE_URL":
    case "MISSING_IMAGE":
      return "image";
    case "TTS_UNAVAILABLE":
    case "TTS_FAILURE":
      return "tts";
    case "FFMPEG_UNAVAILABLE":
    case "RENDER_FAILURE":
      return "ffmpeg";
    case "STORAGE_UNAVAILABLE":
      return "r2";
    case "AI_TIMEOUT":
      return "timeout";
    default:
      return undefined;
  }
}

export function describePrVideoStage(stage: PrVideoStage | undefined): string {
  switch (stage) {
    case "vercel":
      return "Vercel API";
    case "cloud-run":
      return "Cloud Run worker";
    case "image":
      return "Product image fetch";
    case "tts":
      return "espeak-ng TTS";
    case "ffmpeg":
      return "FFmpeg render";
    case "r2":
      return "Cloudflare R2";
    case "timeout":
      return "Timed out waiting for Cloud Run / FFmpeg";
    default:
      return "Unknown stage";
  }
}
