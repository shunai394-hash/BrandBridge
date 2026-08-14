import { isIP } from "node:net";
import path from "node:path";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";

const PRODUCT_IMAGE_PATH =
  /(?:^|\/)(?:storage\/v1\/)?(?:object|render\/image)\/public\/product-images\//;
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const BLOCKED_SUPABASE_SUBDOMAINS = new Set([
  "www",
  "api",
  "app",
  "mail",
  "status",
  "docs",
]);
/** Public BrandBridge project ref (visible on product image URLs). */
const BRAND_BRIDGE_PROJECT_REF = "licdcotjjmqfzliifngv";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
]);

function isPrivateOrLocalHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (BLOCKED_HOSTS.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host === "::1" || host === "0.0.0.0") return true;
  if (!isIP(host)) {
    if (host === "127.0.0.1" || host.startsWith("127.")) return true;
    return false;
  }
  if (host.includes(":")) {
    return (
      host === "::1" ||
      host.startsWith("fc") ||
      host.startsWith("fd") ||
      host.startsWith("fe80")
    );
  }
  const parts = host.split(".").map(Number);
  const a = parts[0] ?? 0;
  const b = parts[1] ?? 0;
  if (a === 10 || a === 127 || a === 0 || a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function parseHttpUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
}

function normalizeStoredImageUrl(raw: string): string {
  let value = raw.trim().replace(/^\uFEFF/, "");
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  value = value.replace(/\\+$/g, "").replace(/&amp;/gi, "&");
  return value;
}

/**
 * `{ref}.supabase.co` and `{ref}.storage.supabase.co` (also .in / .red).
 */
function projectRefFromHostname(hostname: string): string | null {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  const storage = host.match(
    /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)\.storage\.supabase\.(co|in|red)$/,
  );
  if (storage) return storage[1];
  const api = host.match(
    /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)\.supabase\.(co|in|red)$/,
  );
  if (!api || BLOCKED_SUPABASE_SUBDOMAINS.has(api[1])) return null;
  return api[1];
}

function allowedProjectRefs(): Set<string> {
  const refs = new Set<string>([BRAND_BRIDGE_PROJECT_REF]);
  const envUrl = parseHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  const envRef = envUrl ? projectRefFromHostname(envUrl.hostname) : null;
  if (envRef) refs.add(envRef);
  return refs;
}

function isAllowedProductImageHost(hostname: string): boolean {
  const urlRef = projectRefFromHostname(hostname);
  if (!urlRef) return false;
  return allowedProjectRefs().has(urlRef);
}

function isProductImagesPath(pathname: string): boolean {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    decoded = pathname;
  }
  return PRODUCT_IMAGE_PATH.test(decoded);
}

/** Prefer `{ref}.supabase.co` so older workers matching env host still fetch. */
function canonicalizeProductImageUrl(url: URL): string {
  const ref = projectRefFromHostname(url.hostname);
  if (!ref) return url.toString();
  const next = new URL(url.toString());
  if (next.hostname.toLowerCase().includes(".storage.supabase.")) {
    const tld = next.hostname.toLowerCase().endsWith(".red")
      ? "red"
      : next.hostname.toLowerCase().endsWith(".in")
        ? "in"
        : "co";
    next.hostname = `${ref}.supabase.${tld}`;
  }
  return next.toString();
}

export type SafeProductImage =
  | { kind: "remote"; url: string }
  | { kind: "local"; filePath: string };

/**
 * Validate a Case product image URL before any fetch.
 * Allows: relative files under public/ (jpg/png/webp) and HTTPS public
 * objects in the product-images bucket on the BrandBridge Supabase project
 * (`{ref}.supabase.co` or `{ref}.storage.supabase.co`). Blocks localhost /
 * private IPs / metadata endpoints / arbitrary hosts.
 */
export function assertSafeProductImageUrl(raw: string): SafeProductImage {
  const trimmed = normalizeStoredImageUrl(raw);
  if (!trimmed) {
    throw new MarketingAgentError("MISSING_IMAGE", "This product has no image.");
  }

  if (trimmed.startsWith("/")) {
    if (trimmed.includes("\\") || trimmed.includes("\0")) {
      throw new MarketingAgentError("INVALID_IMAGE_URL", "Invalid image path.");
    }
    const publicRoot = path.resolve(process.cwd(), "public");
    const resolved = path.resolve(publicRoot, `.${trimmed}`);
    if (resolved !== publicRoot && !resolved.startsWith(publicRoot + path.sep)) {
      throw new MarketingAgentError("INVALID_IMAGE_URL", "Invalid image path.");
    }
    const ext = path.extname(resolved).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      throw new MarketingAgentError(
        "INVALID_IMAGE_URL",
        "Product image must be JPEG, PNG, or WebP.",
      );
    }
    return { kind: "local", filePath: resolved };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new MarketingAgentError("INVALID_IMAGE_URL", "Invalid image URL.");
  }

  if (url.protocol !== "https:") {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      "Remote product images must use HTTPS.",
    );
  }
  if (url.username || url.password) {
    throw new MarketingAgentError("INVALID_IMAGE_URL", "Invalid image URL.");
  }
  if (url.port && url.port !== "443") {
    throw new MarketingAgentError("INVALID_IMAGE_URL", "Invalid image URL.");
  }

  const hostname = url.hostname.toLowerCase();
  if (isIP(hostname) || isPrivateOrLocalHost(hostname)) {
    throw new MarketingAgentError("INVALID_IMAGE_URL", "Image host is not allowed.");
  }

  if (!isAllowedProductImageHost(hostname)) {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      "Image host is not an allowed product-images domain.",
    );
  }
  if (!isProductImagesPath(url.pathname)) {
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      "Image path is not a product-images object.",
    );
  }

  return { kind: "remote", url: canonicalizeProductImageUrl(url) };
}

export async function readSafeProductImage(
  source: SafeProductImage,
): Promise<{ bytes: Buffer; contentType: string }> {
  if (source.kind === "local") {
    const { readFile, stat } = await import("node:fs/promises");
    const info = await stat(source.filePath).catch(() => null);
    if (!info?.isFile()) {
      throw new MarketingAgentError("MISSING_IMAGE", "Product image file was not found.");
    }
    if (info.size > MAX_IMAGE_BYTES) {
      throw new MarketingAgentError("INVALID_IMAGE_URL", "Product image is too large.");
    }
    const bytes = await readFile(source.filePath);
    const ext = path.extname(source.filePath).toLowerCase();
    const contentType =
      ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return { bytes, contentType };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(source.url, {
      method: "GET",
      redirect: "error",
      signal: controller.signal,
      headers: { Accept: "image/jpeg,image/png,image/webp" },
    });
    if (!response.ok) {
      throw new MarketingAgentError(
        "INVALID_IMAGE_URL",
        `Could not download product image (HTTP ${response.status}).`,
      );
    }
    const contentType = (response.headers.get("content-type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(contentType)) {
      throw new MarketingAgentError(
        "INVALID_IMAGE_URL",
        "Downloaded file is not a JPEG, PNG, or WebP image.",
      );
    }
    const length = Number(response.headers.get("content-length") ?? "0");
    if (length > MAX_IMAGE_BYTES) {
      throw new MarketingAgentError("INVALID_IMAGE_URL", "Product image is too large.");
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      throw new MarketingAgentError("INVALID_IMAGE_URL", "Product image is too large.");
    }
    return { bytes: buffer, contentType };
  } catch (error) {
    if (error instanceof MarketingAgentError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new MarketingAgentError("AI_TIMEOUT", "Image download timed out.");
    }
    throw new MarketingAgentError(
      "INVALID_IMAGE_URL",
      "Could not download the product image.",
    );
  } finally {
    clearTimeout(timer);
  }
}
