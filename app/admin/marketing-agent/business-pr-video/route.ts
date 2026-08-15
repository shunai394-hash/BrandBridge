import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  collectBusinessPrImages,
  generateBusinessPrVideoFromUploads,
} from "@/lib/marketing-agent/business-pr-video";
import { parseJsonValue } from "@/lib/marketing-agent/json";
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

export async function POST(request: Request) {
  try {
    await requireAdmin();

    if (process.env.VERCEL) {
      return errorJson(
        "PR動画のローカルFFmpeg生成は、この環境では実行できません。ローカル環境で実行してください。",
        503,
        { stage: "cloud-run" },
      );
    }

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

    const images =
      await collectBusinessPrImages(form);

    const result =
      await generateBusinessPrVideoFromUploads({
        script,
        images,
        companyName,
        bgmEnabled,
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
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return fail(error);
  }
}
