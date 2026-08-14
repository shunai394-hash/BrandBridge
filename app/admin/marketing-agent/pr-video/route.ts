import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getCaseById } from "@/lib/cases";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import { parseJsonValue } from "@/lib/marketing-agent/json";
import {
  caseImageUrl,
  generatePrVideoMp4,
} from "@/lib/marketing-agent/pr-video";
import { assertSafeProductImageUrl } from "@/lib/marketing-agent/pr-video-image";
import { normalizePrVideoScript } from "@/lib/marketing-agent/pr-script";
import {
  describePrVideoStage,
  redactSecrets,
  stageFromErrorCode,
  type PrVideoStage,
} from "@/lib/marketing-agent/redact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const WORKER_WAIT_MS = 280_000;

function errorJson(
  error: string,
  status: number,
  extra: { code?: string; stage?: PrVideoStage } = {},
): NextResponse {
  const safe = redactSecrets(error);
  return NextResponse.json(
    {
      error: safe,
      httpStatus: status,
      code: extra.code,
      stage: extra.stage,
      stageLabel: describePrVideoStage(extra.stage),
    },
    { status },
  );
}

function fail(error: unknown, status = 400): NextResponse {
  if (error instanceof MarketingAgentError) {
    const timeout = error.code === "AI_TIMEOUT";
    const stage =
      (error.stage as PrVideoStage | undefined) ||
      stageFromErrorCode(error.code) ||
      (timeout ? "timeout" : "vercel");
    return errorJson(error.message, timeout ? 504 : status, {
      code: error.code,
      stage,
    });
  }
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return errorJson("ログインが必要です。", 401, { stage: "vercel" });
    }
    if (
      error.message === "FORBIDDEN_ADMIN_ONLY" ||
      error.message === "NO_PROFILE"
    ) {
      return errorJson("管理者のみ実行できます。", 403, { stage: "vercel" });
    }
    if (error.message === "ACCOUNT_INACTIVE") {
      return errorJson("アカウントが停止されています。", 403, { stage: "vercel" });
    }
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return errorJson(
        "Timed out waiting for Cloud Run / FFmpeg. The worker may still be rendering.",
        504,
        { code: "AI_TIMEOUT", stage: "timeout" },
      );
    }
    return errorJson(error.message, status, { stage: "vercel" });
  }
  return errorJson("Video generation failed.", 500, { stage: "vercel" });
}

function workerConfig(): { url: string; secret: string } | null {
  const url = process.env.PR_VIDEO_WORKER_URL?.trim().replace(/\/$/, "");
  const secret = process.env.PR_VIDEO_WORKER_SECRET?.trim();
  if (!url || !secret) return null;
  return { url, secret };
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const caseId = String(form.get("caseId") ?? "").trim();
    if (!caseId) {
      return errorJson("Please select a product.", 400, { stage: "vercel" });
    }

    const rawScript = String(form.get("script") ?? "").trim();
    if (!rawScript) {
      return errorJson("Generate a PR script before creating a video.", 400, {
        stage: "vercel",
      });
    }

    let parsed: unknown;
    try {
      parsed = parseJsonValue(rawScript);
    } catch {
      return errorJson("Invalid PR script JSON.", 400, { stage: "vercel" });
    }
    const script = normalizePrVideoScript(parsed);
    if (!script) {
      return errorJson("Invalid PR script. Generate the script again.", 400, {
        stage: "vercel",
      });
    }

    const caseItem = await getCaseById(caseId);
    if (!caseItem) {
      return errorJson(
        "Could not load this product. Generation was not started.",
        400,
        { stage: "vercel" },
      );
    }
    const imageRaw = caseImageUrl(caseItem);
    if (!imageRaw) {
      return errorJson(
        "This product has no image. Add one product image and try again.",
        400,
        { stage: "image" },
      );
    }
    const safeImage = assertSafeProductImageUrl(imageRaw);
    if (safeImage.kind !== "remote") {
      return errorJson(
        "This product image cannot be sent to the video worker.",
        400,
        { stage: "image" },
      );
    }

    const worker = workerConfig();
    if (worker) {
      let response: Response;
      try {
        response = await fetch(`${worker.url}/render`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${worker.secret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            caseId,
            script,
            imageUrl: safeImage.url,
            productName: caseItem.productName,
          }),
          signal: AbortSignal.timeout(WORKER_WAIT_MS),
        });
      } catch (error) {
        if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
          return errorJson(
            "Timed out waiting for Cloud Run / FFmpeg (HTTP 504). Try again; render can take a few minutes.",
            504,
            { code: "AI_TIMEOUT", stage: "timeout" },
          );
        }
        const detail = error instanceof Error ? error.message : "network error";
        return errorJson(
          `Cloud Run worker is unavailable (${redactSecrets(detail)}).`,
          502,
          { stage: "cloud-run" },
        );
      }

      const text = await response.text();
      let payload: Record<string, unknown> = {};
      try {
        payload = JSON.parse(text) as Record<string, unknown>;
      } catch {
        payload = {};
      }
      if (!response.ok) {
        const message =
          typeof payload.error === "string"
            ? payload.error
            : `Cloud Run worker error (HTTP ${response.status}).`;
        const code = typeof payload.code === "string" ? payload.code : undefined;
        const stage =
          (typeof payload.stage === "string" ? (payload.stage as PrVideoStage) : undefined) ||
          stageFromErrorCode(code) ||
          "cloud-run";
        return errorJson(`Generation failed (HTTP ${response.status}): ${message}`, 502, {
          code,
          stage,
        });
      }
      const url = typeof payload.url === "string" ? payload.url : "";
      if (!url) {
        return errorJson(
          "Cloud Run finished but did not return a signed preview URL (R2).",
          502,
          { stage: "r2" },
        );
      }
      return NextResponse.json({
        url,
        key: typeof payload.key === "string" ? payload.key : undefined,
        durationSeconds: Number(payload.durationSeconds) || undefined,
        width: Number(payload.width) || 1080,
        height: Number(payload.height) || 1920,
        renderMs: Number(payload.renderMs) || undefined,
        stage: "r2",
        status: "completed",
      });
    }

    if (process.env.VERCEL) {
      return errorJson(
        "Cloud Run worker is not configured (missing PR_VIDEO_WORKER_URL or PR_VIDEO_WORKER_SECRET).",
        503,
        { stage: "cloud-run" },
      );
    }

    const result = await generatePrVideoMp4({ caseId, script });
    return new NextResponse(new Uint8Array(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "X-Pr-Video-Duration": String(result.durationSeconds),
        "X-Pr-Video-Width": String(result.width),
        "X-Pr-Video-Height": String(result.height),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return fail(error);
  }
}
