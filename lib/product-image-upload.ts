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

async function resolveAccessToken(
  supabase: ReturnType<typeof createClient>,
): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return session.access_token;
  }

  const refreshed = await supabase.auth.refreshSession();
  return refreshed.data.session?.access_token ?? null;
}

/**
 * Upload via Storage REST with an explicit user JWT.
 * Avoids cases where supabase-js Storage calls run as anon
 * even though auth.getUser() succeeds on the same client.
 */
async function uploadWithBearer(input: {
  accessToken: string;
  path: string;
  file: File;
  contentType: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !anonKey) {
    return {
      ok: false,
      error: "Supabase 環境変数が未設定です",
    };
  }

  const encodedPath = input.path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${BUCKET}/${encodedPath}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      apikey: anonKey,
      "Content-Type": input.contentType,
      "x-upsert": "false",
      "cache-control": "3600",
    },
    body: input.file,
  });

  if (response.ok) {
    return { ok: true };
  }

  let detail = `HTTP ${response.status}`;
  try {
    const body = (await response.json()) as {
      message?: string;
      error?: string;
      statusCode?: string;
    };
    detail = body.message || body.error || detail;
  } catch {
    // ignore JSON parse errors
  }

  return {
    ok: false,
    error: detail,
  };
}

/**
 * Upload a product image to Supabase Storage.
 * Path: {auth.uid()}/{timestamp}.{ext}
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

  const accessToken = await resolveAccessToken(supabase);
  if (!accessToken) {
    return {
      ok: false,
      error: "ログインセッションが無効です。再ログインしてください",
    };
  }

  const path = `${user.id}/${Date.now()}.${ext}`;
  const contentType = file.type || mimeForExt(ext);

  const uploaded = await uploadWithBearer({
    accessToken,
    path,
    file,
    contentType,
  });

  if (!uploaded.ok) {
    console.error("[uploadProductImageFile]", uploaded.error);
    return {
      ok: false,
      error: `画像アップロードに失敗しました: ${uploaded.error}`,
    };
  }

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!envUrl) {
    return {
      ok: false,
      error: "公開URLの取得に失敗しました",
    };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  let url = data.publicUrl?.trim() || "";

  if (!url || !url.includes("/storage/")) {
    url = buildPublicUrl(envUrl, path);
  }

  return {
    ok: true,
    url,
    path,
  };
}
