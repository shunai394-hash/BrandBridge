import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import { parseJsonValue } from "@/lib/marketing-agent/json";
import { generatePrVideoMp4 } from "@/lib/marketing-agent/pr-video";
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
