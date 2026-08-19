import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  collectBusinessPrImages,
  generateBusinessPrVideoFromUploads,
  toBusinessPrWorkerImages,
} from "@/lib/marketing-agent/business-pr-video";
import { parseBusinessPrBrief } from "@/lib/marketing-agent/business-pr-script";
import { parseJsonValue } from "@/lib/marketing-agent/json";
import { normalizePrVideoScript } from "@/lib/marketing-agent/pr-script";
import { generateBusinessPrVideoAuto, prepareAutoPrVideoJob } from "@/lib/marketing-agent/pr-video-auto";
import { companyPrContextFromBrief } from "@/lib/marketing-agent/company-pr-context";
import { parsePrVideoGenerationMode } from "@/lib/marketing-agent/pr-video-engine";
import { prVideoWorkerConfig } from "@/lib/marketing-agent/pr-video-worker";
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

    return errorJson(
      error.message,
      timeout ? 504 : status,
      {
        code: error.code,
        stage,
      },
    );
  }

  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return errorJson(
        "ログインが必要です。",
        401,
        { stage: "vercel" },
      );
    }

    if (
      error.message === "FORBIDDEN_ADMIN_ONLY" ||
      error.message === "NO_PROFILE"
    ) {
      return errorJson(
        "管理者のみ実行できます。",
        403,
        { stage: "vercel" },
      );
    }

    if (error.message === "ACCOUNT_INACTIVE") {
      return errorJson(
        "アカウントが停止されています。",
        403,
        { stage: "vercel" },
      );
    }

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return errorJson(
        "Cloud Run / FFmpeg の応答がタイムアウトしました。",
        504,
        { code: "AI_TIMEOUT", stage: "timeout" },
      );
    }

    return errorJson(
      error.message,
      status,
      { stage: "vercel" },
    );
  }

  return errorJson(
    "動画生成に失敗しました。",
    500,
    { stage: "vercel" },
  );
}

function workerConfig(): { url: string; secret: string } | null {
  return prVideoWorkerConfig();
}

async function callWorker(
  worker: { url: string; secret: string },
  payload: Record<string, unknown>,
): Promise<NextResponse> {
  let response: Response;
  try {
    response = await fetch(`${worker.url}/render`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${worker.secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(WORKER_WAIT_MS),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      return errorJson(
        "Cloud Run / FFmpeg の応答がタイムアウトしました（HTTP 504）。数分かかることがあります。",
        504,
        { code: "AI_TIMEOUT", stage: "timeout" },
      );
    }
    const detail = error instanceof Error ? error.message : "network error";
    return errorJson(
      `Cloud Run worker に接続できません（${redactSecrets(detail)}）。`,
      502,
      { stage: "cloud-run" },
    );
  }

  const text = await response.text();
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    body = {};
  }
  if (!response.ok) {
    const rawMessage =
      typeof body.error === "string"
        ? body.error
        : `Cloud Run worker error (HTTP ${response.status}).`;
    const message = /caseId and imageUrl are required/i.test(rawMessage)
      ? "Cloud Run worker が複数画像または自動生成に未対応です。pr-video-worker Service を再デプロイしてください。"
      : rawMessage;
    const code = typeof body.code === "string" ? body.code : undefined;
    const stage =
      (typeof body.stage === "string"
        ? (body.stage as PrVideoStage)
        : undefined) ||
      stageFromErrorCode(code) ||
      "cloud-run";
    return errorJson(
      `動画生成に失敗しました（HTTP ${response.status}）: ${message}`,
      502,
      { code, stage },
    );
  }
  const url = typeof body.url === "string" ? body.url : "";
  if (!url) {
    return errorJson(
      "Cloud Run は完了しましたが、R2 の署名付きURLが返りませんでした。",
      502,
      { stage: "r2" },
    );
  }
  return NextResponse.json({
    url,
    key: typeof body.key === "string" ? body.key : undefined,
    durationSeconds: Number(body.durationSeconds) || undefined,
    width: Number(body.width) || 1080,
    height: Number(body.height) || 1920,
    renderMs: Number(body.renderMs) || undefined,
    bgmEnabled: payload.bgmEnabled !== false,
    subtitlesEnabled: payload.subtitlesEnabled !== false,
    generationMode: payload.generationMode,
    stockProvider: body.stockProvider,
    stockVideoCount: body.stockVideoCount,
    stage: "r2",
    status: "completed",
  });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const form = await request.formData();

    const companyName =
      String(
        form.get("companyName") ?? "",
      ).trim() || "BrandBridge";

    const rawScript =
      String(
        form.get("script") ?? "",
      ).trim();

    if (!rawScript) {
      return errorJson(
        "日本語の台本を指定してください。",
        400,
        { stage: "vercel" },
      );
    }

    let parsed: unknown;

    try {
      parsed = parseJsonValue(rawScript);
    } catch {
      return errorJson(
        "台本のJSONが正しくありません。",
        400,
        { stage: "vercel" },
      );
    }

    const script =
      normalizePrVideoScript(parsed);

    if (!script) {
      return errorJson(
        "台本が正しくありません。もう一度生成してください。",
        400,
        { stage: "vercel" },
      );
    }

    const bgmEnabled =
      String(
        form.get("bgmEnabled") ?? "true",
      ).toLowerCase() === "true";
    const subtitlesEnabled =
      String(
        form.get("subtitlesEnabled") ?? "true",
      ).toLowerCase() !== "false";
    const generationMode = parsePrVideoGenerationMode(
      form.get("generationMode"),
    );

    if (generationMode === "auto") {
      const brief = parseBusinessPrBrief({
        companyName,
        brandName: form.get("brandName"),
        businessDescription:
          form.get("businessDescription") ||
          `${companyName}の会社紹介`,
        targetAudience:
          form.get("targetAudience") ||
          "日本市場に進出したい海外ブランド",
        videoPurpose:
          form.get("videoPurpose") ||
          "BrandBridgeへアクセスしてもらう",
        japanMarketRelation: form.get("japanMarketRelation"),
        mood: form.get("mood"),
        website: form.get("website"),
        businessType: form.get("businessType"),
        country: form.get("country"),
        services: form.get("services"),
        sellingPoints: form.get("sellingPoints"),
        imageCount: 0,
      });
      const company = companyPrContextFromBrief(brief);
      const job = await prepareAutoPrVideoJob({
        brief,
        script,
        company,
        bgmEnabled,
        subtitlesEnabled,
      });
      const worker = workerConfig();
      if (worker) {
        return callWorker(worker, {
          generationMode: "auto",
          script: job.script,
          companyName: job.companyName,
          website: job.website,
          description: job.description,
          businessType: job.businessType,
          targetAudience: job.targetAudience,
          country: job.country,
          services: job.services,
          sellingPoints: job.sellingPoints,
          cta: job.cta,
          bgmEnabled: job.bgmEnabled,
          subtitlesEnabled: job.subtitlesEnabled,
        });
      }
      if (process.env.VERCEL) {
        return errorJson(
          "Cloud Run worker が設定されていません（PR_VIDEO_WORKER_URL または PR_VIDEO_WORKER_SECRET が未設定です）。自動生成は Worker 上の MoneyPrinterTurbo で実行します。",
          503,
          { stage: "cloud-run" },
        );
      }
      const result = await generateBusinessPrVideoAuto({
        brief,
        script: job.script,
        company,
        bgmEnabled,
        subtitlesEnabled,
      });
      return new NextResponse(new Uint8Array(result.bytes), {
        status: 200,
        headers: {
          "Content-Type": "video/mp4",
          "Content-Disposition": `attachment; filename="${result.fileName}"`,
          "X-Pr-Video-Duration": String(result.durationSeconds),
          "X-Pr-Video-Width": String(result.width),
          "X-Pr-Video-Height": String(result.height),
          "X-Pr-Video-BGM": String(bgmEnabled),
          "X-Pr-Video-Subtitles": String(subtitlesEnabled),
          "X-Pr-Video-Mode": "auto",
          "X-Pr-Video-Stock-Provider": result.stockProvider,
          "X-Pr-Video-Stock-Count": String(result.stockVideoCount),
          "Cache-Control": "no-store",
        },
      });
    }

    const images =
      await collectBusinessPrImages(form);

    const worker = workerConfig();
    if (worker) {
      return callWorker(worker, {
        script,
        images: toBusinessPrWorkerImages(images),
        companyName,
        productName: companyName,
        bgmEnabled,
        subtitlesEnabled,
      });
    }

    if (process.env.VERCEL) {
      return errorJson(
        "Cloud Run worker が設定されていません（PR_VIDEO_WORKER_URL または PR_VIDEO_WORKER_SECRET が未設定です）。",
        503,
        { stage: "cloud-run" },
      );
    }

    const result =
      await generateBusinessPrVideoFromUploads({
        script,
        images,
        companyName,
        bgmEnabled,
        subtitlesEnabled,
      });

    return new NextResponse(
      new Uint8Array(result.bytes),
      {
        status: 200,
        headers: {
          "Content-Type": "video/mp4",
          "Content-Disposition":
            `attachment; filename="${result.fileName}"`,
          "X-Pr-Video-Duration":
            String(result.durationSeconds),
          "X-Pr-Video-Width":
            String(result.width),
          "X-Pr-Video-Height":
            String(result.height),
          "X-Pr-Video-BGM":
            String(bgmEnabled),
          "X-Pr-Video-Subtitles":
            String(subtitlesEnabled),
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return fail(error);
  }
}
