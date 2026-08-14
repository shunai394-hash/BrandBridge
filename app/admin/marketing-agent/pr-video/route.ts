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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function fail(error: unknown, status = 400): NextResponse {
  if (error instanceof MarketingAgentError) {
    const timeout = error.code === "AI_TIMEOUT";
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: timeout ? 504 : 400 },
    );
  }
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
    }
    if (
      error.message === "FORBIDDEN_ADMIN_ONLY" ||
      error.message === "NO_PROFILE"
    ) {
      return NextResponse.json({ error: "管理者のみ実行できます。" }, { status: 403 });
    }
    if (error.message === "ACCOUNT_INACTIVE") {
      return NextResponse.json({ error: "アカウントが停止されています。" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ error: "Video generation failed." }, { status: 500 });
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
      return NextResponse.json({ error: "Please select a product." }, { status: 400 });
    }

    const rawScript = String(form.get("script") ?? "").trim();
    if (!rawScript) {
      return NextResponse.json(
        { error: "Generate a PR script before creating a video." },
        { status: 400 },
      );
    }

    let parsed: unknown;
    try {
      parsed = parseJsonValue(rawScript);
    } catch {
      return NextResponse.json({ error: "Invalid PR script JSON." }, { status: 400 });
    }
    const script = normalizePrVideoScript(parsed);
    if (!script) {
      return NextResponse.json(
        { error: "Invalid PR script. Generate the script again." },
        { status: 400 },
      );
    }

    const caseItem = await getCaseById(caseId);
    if (!caseItem) {
      return NextResponse.json(
        { error: "Could not load this product. Generation was not started." },
        { status: 400 },
      );
    }
    const imageRaw = caseImageUrl(caseItem);
    if (!imageRaw) {
      return NextResponse.json(
        { error: "This product has no image. Add one product image and try again." },
        { status: 400 },
      );
    }
    const safeImage = assertSafeProductImageUrl(imageRaw);
    if (safeImage.kind !== "remote") {
      return NextResponse.json(
        { error: "This product image cannot be sent to the video worker." },
        { status: 400 },
      );
    }

    const worker = workerConfig();
    if (worker) {
      const response = await fetch(`${worker.url}/render`, {
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
        signal: AbortSignal.timeout(110_000),
      });
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
            : `Video worker error (HTTP ${response.status}).`;
        return NextResponse.json(
          { error: message },
          { status: response.status === 401 ? 502 : response.status >= 500 ? 502 : 400 },
        );
      }
      const url = typeof payload.url === "string" ? payload.url : "";
      if (!url) {
        return NextResponse.json(
          { error: "Video worker did not return a preview URL." },
          { status: 502 },
        );
      }
      return NextResponse.json({
        url,
        key: typeof payload.key === "string" ? payload.key : undefined,
        durationSeconds: Number(payload.durationSeconds) || undefined,
        width: Number(payload.width) || 1080,
        height: Number(payload.height) || 1920,
        renderMs: Number(payload.renderMs) || undefined,
      });
    }

    if (process.env.VERCEL) {
      return NextResponse.json(
        { error: "PR video worker is not configured on this server." },
        { status: 503 },
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
