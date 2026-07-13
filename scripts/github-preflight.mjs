#!/usr/bin/env node
/**
 * GitHub / 本番公開前の簡易チェック（秘密情報を出力しない）
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
let failed = 0;

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}
function ng(msg) {
  console.error(`  ✗ ${msg}`);
  failed += 1;
}
function info(msg) {
  console.log(`  • ${msg}`);
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

console.log("\nBrandBridge preflight check\n");

const required = [
  ".env.example",
  "README.md",
  "docs/ENV.md",
  "docs/GITHUB_CHECKLIST.md",
  "docs/SUPABASE_PRODUCTION.md",
  "docs/DEPLOY_VERCEL.md",
  "docs/ADMIN_SETUP.md",
  "supabase/migrations/001_init.sql",
  "supabase/migrations/008_contact_inquiries.sql",
  "app/layout.tsx",
  "middleware.ts",
];

console.log("Files");
for (const rel of required) {
  if (exists(rel)) ok(rel);
  else ng(`missing: ${rel}`);
}

console.log("\nMigrations");
for (let i = 1; i <= 8; i += 1) {
  const prefix = String(i).padStart(3, "0");
  const found = fs
    .readdirSync(path.join(root, "supabase/migrations"))
    .some((f) => f.startsWith(prefix));
  if (found) ok(`${prefix}_*.sql`);
  else ng(`missing migration ${prefix}`);
}

console.log("\n.env.example");
const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
if (/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\./.test(envExample)) {
  ng(".env.example appears to contain a real-looking JWT — use placeholders only");
} else {
  ok("no real-looking JWT in .env.example");
}
for (const key of [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL",
]) {
  if (envExample.includes(key)) ok(`documents ${key}`);
  else ng(`missing ${key} in .env.example`);
}

console.log("\nGit / secrets");
try {
  const tracked = execSync("git ls-files", { cwd: root, encoding: "utf8" })
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const bad = tracked.filter(
    (f) => /(^|\/)\.env(\.|$)/.test(f) && !f.endsWith(".env.example"),
  );
  if (bad.length) ng(`tracked env files: ${bad.join(", ")}`);
  else ok("no .env secrets tracked by git");

  if (exists(".env.local")) {
    try {
      execSync("git check-ignore -q .env.local", { cwd: root });
      ok(".env.local is gitignored");
    } catch {
      ng(".env.local exists but is NOT gitignored");
    }
  } else {
    info(".env.local not present (ok for CI / fresh clone)");
  }
} catch {
  info("git not available — skipped tracking checks");
}

console.log("\nNext steps");
info("See docs/GITHUB_CHECKLIST.md");
info("See docs/DEPLOY_VERCEL.md");
info("Run: npm run build");

if (failed > 0) {
  console.error(`\nPreflight failed: ${failed} issue(s)\n`);
  process.exit(1);
}
console.log("\nPreflight passed.\n");
