import { createHmac } from "crypto";
import { createServiceClient } from "@/lib/supabase/admin";

const DEFAULT_NEWFIND_URL = "https://newfind-self.vercel.app/api/integrations/tracer";

function integrationConfig() {
  return {
    url:
      process.env.NEWFIND_INTEGRATION_URL?.trim() ||
      DEFAULT_NEWFIND_URL,
    secret:
      process.env.NEWFIND_INTEGRATION_SECRET?.trim() ||
      process.env.NEWFIND_TRACER_SHARED_SECRET?.trim() ||
      "",
    key:
      process.env.NEWFIND_INTEGRATION_KEY?.trim() ||
      "brandbridge-newfind",
  };
}

function sign(secret: string, timestamp: string, eventId: string, body: string) {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${eventId}.${body}`, "utf8")
    .digest("hex");
}

type PublicCaseRow = {
  id: string;
  title: string;
  product_name: string;
  sku: string | null;
  category: string;
  region: string | null;
  description: string;
  summary: string | null;
  product_image_url: string | null;
  product_video_url: string | null;
  brand_name: string | null;
  brand_overview: string | null;
  product_strengths: string | null;
  ship_from: string | null;
  created_at: string;
};

async function getPublicCase(caseId: string): Promise<PublicCaseRow | null> {
  const admin = createServiceClient();
  const { data, error } = await admin
    .from("cases")
    .select(
      "id,title,product_name,sku,category,region,description,summary,product_image_url,product_video_url,brand_name,brand_overview,product_strengths,ship_from,created_at",
    )
    .eq("id", caseId)
    .eq("status", "open")
    .eq("review_status", "approved")
    .maybeSingle();

  if (error) {
    console.error("[BrandBridge→NEWFIND] case lookup failed", error.message);
    return null;
  }
  return (data as PublicCaseRow | null) ?? null;
}

function absoluteCaseUrl(caseId: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "https://www.brandbridge.jp";
  return `${base.replace(/\/$/, "")}/cases/${caseId}`;
}

export async function sendCaseToNewfind(caseId: string) {
  const cfg = integrationConfig();
  if (!cfg.secret) {
    return { ok: false, skipped: true, reason: "NEWFIND_INTEGRATION_SECRET not configured" };
  }

  const item = await getPublicCase(caseId);
  if (!item) {
    return { ok: false, skipped: true, reason: "case is not public" };
  }

  const eventId = `brandbridge:case:${item.id}:v1`;
  const payload = {
    source: "brandbridge",
    source_type: "brandbridge_case",
    source_id: item.id,
    product_name: item.product_name || item.title,
    title: item.product_name || item.title,
    brand: item.brand_name,
    category: item.category,
    country: item.ship_from || item.region,
    product_url: absoluteCaseUrl(item.id),
    official_url: absoluteCaseUrl(item.id),
    image_url: item.product_image_url,
    product_image_url: item.product_image_url,
    description: item.description || item.summary || "",
    discovery_reason: "BrandBridgeに新しく登録された公開商品",
    note: item.product_strengths || item.brand_overview || null,
    sku: item.sku,
    source_created_at: item.created_at,
    video_url: item.product_video_url,
  };

  const body = JSON.stringify({
    event_id: eventId,
    event_type: "brandbridge_product",
    event_version: 1,
    source: "brandbridge",
    occurred_at: new Date().toISOString(),
    payload,
  });
  const timestamp = String(Math.floor(Date.now() / 1000));

  const response = await fetch(cfg.url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Integration-Key": cfg.key,
      "X-Integration-Timestamp": timestamp,
      "X-Integration-Id": eventId,
      "X-Integration-Signature": sign(cfg.secret, timestamp, eventId, body),
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(
      `NEWFIND integration failed: HTTP ${response.status} ${responseText.slice(0, 500)}`,
    );
  }

  return {
    ok: true,
    skipped: false,
    eventId,
    response: responseText.slice(0, 500),
  };
}

export async function syncApprovedCasesToNewfind(limit = 50) {
  const admin = createServiceClient();
  const { data, error } = await admin
    .from("cases")
    .select("id")
    .eq("status", "open")
    .eq("review_status", "approved")
    .order("created_at", { ascending: false })
    .limit(Math.max(1, Math.min(limit, 100)));

  if (error) throw new Error(`BrandBridge case sync query failed: ${error.message}`);

  const results: Array<Record<string, unknown>> = [];
  const rows = data ?? [];
  for (let offset = 0; offset < rows.length; offset += 5) {
    const batch = rows.slice(offset, offset + 5);
    const batchResults = await Promise.all(
      batch.map(async (row) => {
        try {
          return await sendCaseToNewfind(String(row.id));
        } catch (error) {
          return {
            ok: false,
            skipped: false,
            caseId: String(row.id),
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    );
    results.push(...batchResults);
  }

  return {
    scanned: data?.length ?? 0,
    delivered: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok && !result.skipped).length,
    skipped: results.filter((result) => result.skipped).length,
    results,
  };
}
