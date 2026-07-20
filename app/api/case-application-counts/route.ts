import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type Body = {
  ids?: string[];
};

type CaseMeta = {
  applicationCount: number;
  hasDeal: boolean;
};

/**
 * Response keyed by SKU (商品番号), e.g.:
 *   { "ATL-0010": { applicationCount, hasDeal }, ... }
 * Also includes the same meta under case UUID for CaseList apiMeta[item.id].
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const ids = Array.isArray(body.ids)
    ? body.ids.filter((id) => typeof id === "string" && id.length > 0)
    : [];

  if (ids.length === 0) {
    return NextResponse.json(
      {},
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  try {
    const supabase = createServiceClient();
    const [casesResult, appResult, dealResult] = await Promise.all([
      supabase.from("cases").select("id, sku").in("id", ids),
      supabase.from("applications").select("case_id").in("case_id", ids),
      supabase.from("deals").select("case_id").in("case_id", ids),
    ]);

    if (casesResult.error) {
      console.error("[case-application-counts]", casesResult.error.message);
      return NextResponse.json(
        { error: casesResult.error.message },
        { status: 500 },
      );
    }
    if (appResult.error) {
      console.error("[case-application-counts]", appResult.error.message);
      return NextResponse.json(
        { error: appResult.error.message },
        { status: 500 },
      );
    }
    if (dealResult.error) {
      console.error("[case-application-counts]", dealResult.error.message);
      return NextResponse.json(
        { error: dealResult.error.message },
        { status: 500 },
      );
    }

    const byCaseId: Record<string, CaseMeta> = {};
    for (const id of ids) {
      byCaseId[id] = { applicationCount: 0, hasDeal: false };
    }

    for (const row of appResult.data ?? []) {
      const caseId = row.case_id as string;
      if (!byCaseId[caseId]) {
        byCaseId[caseId] = { applicationCount: 0, hasDeal: false };
      }
      byCaseId[caseId].applicationCount += 1;
    }

    for (const row of dealResult.data ?? []) {
      const caseId = row.case_id as string;
      if (!byCaseId[caseId]) {
        byCaseId[caseId] = { applicationCount: 0, hasDeal: false };
      }
      byCaseId[caseId].hasDeal = true;
    }

    // Network shape: SKU keys (required) + UUID keys (for apiMeta[item.id]).
    const result: Record<string, CaseMeta> = {};
    for (const row of casesResult.data ?? []) {
      const caseId = row.id as string;
      const meta = byCaseId[caseId] ?? {
        applicationCount: 0,
        hasDeal: false,
      };
      result[caseId] = meta;
      const sku = typeof row.sku === "string" ? row.sku.trim() : "";
      if (sku) {
        result[sku] = meta;
      }
    }

    console.log("[case-application-counts] response", {
      ATL0010: result["ATL-0010"],
      HYC0003: result["HYC-0003"],
      AOB0002: result["AOB-0002"],
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[case-application-counts]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
