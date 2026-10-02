import { NextResponse } from "next/server";
import { syncApprovedCasesToNewfind } from "@/lib/integration/newfind";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization") || "";
  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncApprovedCasesToNewfind(50);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[newfind-sync] failed", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
