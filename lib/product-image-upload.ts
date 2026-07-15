"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "product-images";
/** Spec: max 10MB for product gallery uploads */
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

export type ProductImageUploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

function extensionFor(file: File): string | null {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ALLOWED_EXT.has(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/jpeg") return "jpg";
  return null;
}

function mimeForExt(ext: string): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function buildPublicUrl(supabaseUrl: string, path: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  const encoded = path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${base}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

/**
 * Upload a product image to Supabase Storage and return its public URL.
 * Path: `{auth.uid()}/{timestamp}.{ext}` (matches storage RLS).
 */
export async function uploadProductImageFile(
  file: File,
): Promise<ProductImageUploadResult> {
  const ext = extensionFor(file);
  const typeOk = ALLOWED_TYPES.has(file.type) || Boolean(ext);
  if (!typeOk || !ext) {
    return {
      ok: false,
      error: "画像形式は JPEG / PNG / WebP のみ対応しています",
    };
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: "画像サイズは10MB以下にしてください",
    };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: "ログインセッションが無効です。再ログインしてください",
    };
  }

  const path = `${user.id}/${Date.now()}.${ext}`;
  const contentType = file.type || mimeForExt(ext);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("[uploadProductImageFile]", uploadError.message);
    return {
      ok: false,
      error: `画像アップロードに失敗しました: ${uploadError.message}`,
    };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  let url = data.publicUrl?.trim() || "";

  // Fallback if client helper returns empty / odd URL
  if (!url || !url.includes("/storage/")) {
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    if (!envUrl) {
      return { ok: false, error: "公開URLの取得に失敗しました" };
    }
    url = buildPublicUrl(envUrl, path);
  }

  console.info("[uploadProductImageFile] ok", { path, url });
  return { ok: true, url, path };
}
