import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function readLocalServiceRoleKey(): string | null {
  // Local scripts keep service_role in .tmp/api-keys.json (gitignored).
  // Fallback for local next dev / next start when .env.local omits the key.
  // Skip on Vercel/hosted production (no .tmp file there).
  if (process.env.VERCEL) return null;
  try {
    const p = resolve(process.cwd(), ".tmp/api-keys.json");
    if (!existsSync(p)) return null;
    let text = readFileSync(p, "utf8").replace(/^\uFEFF/, "");
    const arrStart = text.indexOf("[");
    const objStart = text.indexOf("{");
    const start =
      arrStart >= 0 && (objStart < 0 || arrStart < objStart)
        ? arrStart
        : objStart;
    if (start < 0) return null;
    const opener = text[start];
    const closer = opener === "[" ? "]" : "}";
    const end = text.lastIndexOf(closer);
    const json = JSON.parse(text.slice(start, end + 1));
    const list = Array.isArray(json) ? json : json.keys || [];
    return (
      list.find((k: { name?: string; id?: string }) =>
        k.name === "service_role" || k.id === "service_role",
      )?.api_key ?? null
    );
  } catch {
    return null;
  }
}

function resolveServiceRoleKey(): string {
  const fromEnv = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (fromEnv) return fromEnv;
  const fromLocal = readLocalServiceRoleKey();
  if (fromLocal) return fromLocal;
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is not set (required for negotiation counts)",
  );
}

/**
 * Server-only Supabase client with service_role (bypasses RLS).
 * Use only for aggregate reads that must be public (e.g. /cases application counts).
 * Never import from Client Components.
 */
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }

  return createClient(url, resolveServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
