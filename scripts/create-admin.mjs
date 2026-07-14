/**
 * Create or promote BrandBridge ops admin.
 *
 * Usage (PowerShell):
 *   $env:NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *   $env:ADMIN_EMAIL="admin@example.com"
 *   $env:ADMIN_PASSWORD="YourSecurePassword123"
 *   node scripts/create-admin.mjs
 *
 * Or put the same keys in .env.local (SERVICE_ROLE must NOT be NEXT_PUBLIC_*).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";

function fail(message) {
  console.error(`[create-admin] ERROR: ${message}`);
  process.exit(1);
}

if (!url || url.includes("placeholder")) {
  fail("NEXT_PUBLIC_SUPABASE_URL が未設定、または placeholder です");
}
if (!serviceKey || serviceKey.includes("placeholder")) {
  fail(
    "SUPABASE_SERVICE_ROLE_KEY が未設定です（Supabase → Settings → API → service_role）",
  );
}
if (!email || !email.includes("@")) {
  fail("ADMIN_EMAIL を設定してください（例: admin@yourdomain.com）");
}
if (!password || password.length < 8) {
  fail("ADMIN_PASSWORD は8文字以上で設定してください");
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail(targetEmail) {
  // Paginate admin list (sufficient for early beta user counts)
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) fail(`Auth listUsers failed: ${error.message}`);
    const found = data.users.find(
      (u) => (u.email ?? "").toLowerCase() === targetEmail,
    );
    if (found) return found.id;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureAuthUser() {
  const existingId = await findUserIdByEmail(email);
  if (existingId) {
    console.log(`[create-admin] Auth user exists id=${existingId}`);
    const { error } = await supabase.auth.admin.updateUserById(existingId, {
      password,
      email_confirm: true,
      user_metadata: {
        role: "admin",
        company_name: "BrandBridge Admin",
        contact_name: "Admin",
        onboarding_completed: true,
      },
    });
    if (error) fail(`Auth updateUser failed: ${error.message}`);
    console.log("[create-admin] Auth password/metadata updated");
    return existingId;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "admin",
      company_name: "BrandBridge Admin",
      contact_name: "Admin",
      onboarding_completed: true,
    },
  });
  if (error) fail(`Auth createUser failed: ${error.message}`);
  if (!data.user) fail("Auth createUser returned no user");
  console.log(`[create-admin] Auth user created id=${data.user.id}`);
  return data.user.id;
}

async function ensureAdminProfile(userId) {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id, role, email")
    .eq("id", userId)
    .maybeSingle();

  if (selectError) {
    fail(`profiles select failed: ${selectError.message}`);
  }

  const payload = {
    id: userId,
    email,
    role: "admin",
    is_active: true,
    onboarding_completed: true,
    company_name: "BrandBridge Admin",
    contact_name: "Admin",
  };

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update({
        role: "admin",
        is_active: true,
        onboarding_completed: true,
        email,
        company_name: existing.company_name || "BrandBridge Admin",
        contact_name: "Admin",
      })
      .eq("id", userId);
    if (error) fail(`profiles update failed: ${error.message}`);
    console.log(
      `[create-admin] profiles updated id=${userId} role=admin (was ${existing.role})`,
    );
    return;
  }

  const { error } = await supabase.from("profiles").insert(payload);
  if (error) fail(`profiles insert failed: ${error.message}`);
  console.log(`[create-admin] profiles inserted id=${userId} role=admin`);
}

async function verify(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, is_active, onboarding_completed")
    .eq("id", userId)
    .maybeSingle();
  if (error) fail(`verify failed: ${error.message}`);
  if (!data) fail("verify failed: profile missing");
  if (data.role !== "admin") fail(`verify failed: role=${data.role}`);
  if (data.is_active !== true) fail("verify failed: is_active is not true");
  console.log("[create-admin] VERIFY OK", data);
  console.log("");
  console.log("Login:");
  console.log("  URL:  /login?next=/admin");
  console.log(`  Email: ${email}`);
  console.log("  Password: (ADMIN_PASSWORD に設定した値)");
  console.log("Then open /admin/cases for pending_review.");
}

const userId = await ensureAuthUser();
await ensureAdminProfile(userId);
await verify(userId);
