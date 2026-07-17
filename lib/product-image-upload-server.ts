import { createClient } from "@/lib/supabase/server";

const BUCKET = "product-images";
const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

export type ServerProductImageUploadResult =
  | { ok: true; url: string; path: string; userId: string }
  | { ok: false; error: string };

function extensionFor(file: {
  name?: string;
  type?: string;
}): string | null {
  const fromName = file.name?.split(".").pop()?.toLowerCase();
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
 * Server-side product image upload using the cookie session JWT.
 * Preferred path for maker/admin gallery management.
 */
export async function uploadProductImageOnServer(
  file: File | Blob & { name?: string; type?: string },
): Promise<ServerProductImageUploadResult> {
  const ext = extensionFor(file);
  const typeOk =
    (file.type ? ALLOWED_TYPES.has(file.type) : false) || Boolean(ext);

  if (!typeOk || !ext) {
    return {
      ok: false,
      error: "画像形式は JPEG / PNG / WebP のみ対応しています",
    };
  }

  if (typeof file.size === "number" && file.size > MAX_BYTES) {
    return {
      ok: false,
      error: "画像サイズは10MB以下にしてください",
    };
  }

  if (typeof file.size === "number" && file.size <= 0) {
    return {
      ok: false,
      error: "画像ファイルを選択してください",
    };
  }

  const supabase = await createClient();
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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {
      ok: false,
      error: "ログインセッションが無効です。再ログインしてください",
    };
  }

  const path = `${user.id}/${Date.now()}.${ext}`;
  const contentType = file.type || mimeForExt(ext);
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, {
      upsert: false,
      contentType,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("[uploadProductImageOnServer]", {
      message: uploadError.message,
      userId: user.id,
      path,
      hasAccessToken: Boolean(session.access_token),
    });
    return {
      ok: false,
      error: `画像アップロードに失敗しました: ${uploadError.message}`,
    };
  }

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!envUrl) {
    return { ok: false, error: "公開URLの取得に失敗しました" };
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
    userId: user.id,
  };
}
