/**
 * Verify cases.product_image_url and storage bucket.
 *
 * Usage:
 *   node scripts/verify-case-image.mjs
 *   node scripts/verify-case-image.mjs --case-id=<uuid>
 *   node scripts/verify-case-image.mjs --case-id=<uuid> --set-test-url
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const args = process.argv.slice(2);
const caseIdArg = args.find((a) => a.startsWith("--case-id="))?.slice(10);
const setTest = args.includes("--set-test-url");

if (!url || !key) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が必要です",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let query = supabase
  .from("cases")
  .select("id, case_number, product_name, product_image_url, maker_id")
  .order("created_at", { ascending: false })
  .limit(10);

if (caseIdArg) {
  query = supabase
    .from("cases")
    .select("id, case_number, product_name, product_image_url, maker_id")
    .eq("id", caseIdArg);
}

const { data, error: qErr } = await query;
if (qErr) {
  console.error("query failed:", qErr.message);
  process.exit(1);
}

console.log("--- cases.product_image_url ---");
for (const row of data ?? []) {
  console.log({
    id: row.id,
    case_number: row.case_number,
    product_name: row.product_name,
    product_image_url: row.product_image_url,
  });
}

const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
if (bErr) {
  console.error("listBuckets failed:", bErr.message);
} else {
  const pi = buckets?.find((b) => b.id === "product-images");
  console.log("--- storage bucket product-images ---");
  console.log(
    pi
      ? { id: pi.id, public: pi.public, file_size_limit: pi.file_size_limit }
      : "MISSING — run migration 009",
  );
}

if (setTest && caseIdArg) {
  const testUrl = `${url.replace(/\/$/, "")}/storage/v1/object/public/product-images/verify-test.png`;
  const { data: updated, error: uErr } = await supabase
    .from("cases")
    .update({ product_image_url: testUrl })
    .eq("id", caseIdArg)
    .select("id, product_image_url")
    .maybeSingle();
  if (uErr) {
    console.error("update failed:", uErr.message);
    process.exit(1);
  }
  console.log("--- after --set-test-url ---");
  console.log(updated);
}
