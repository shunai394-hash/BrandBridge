import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("SupabaseŠÂ‹«•Ï”‚ª‚ ‚è‚Ü‚¹‚ñ");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { data, error } = await supabase
  .from("cases")
  .select("id, sku, title, brand_name, maker_id, created_at, updated_at, product_image_url")
  .order("created_at", { ascending: false });

if (error) {
  console.error(error);
  process.exit(1);
}

console.table(
  data.map(x => ({
    id: x.id,
    sku: x.sku,
    brand: x.brand_name,
    maker_id: x.maker_id,
    created_at: x.created_at,
    image: x.product_image_url
  }))
);
