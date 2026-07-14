"use client";

import { createClient } from "@/lib/supabase/client";
import { NEGOTIATION_ATTACHMENTS_BUCKET } from "@/lib/negotiation-attachments";

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
]);

export type NegotiationAttachmentUploadResult =
  | {
      ok: true;
      path: string;
      name: string;
      mime: string;
      size: number;
    }
  | { ok: false; error: string };

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^\w.\-()\u3040-\u30ff\u4e00-\u9faf]+/g, "_");
  return base.slice(0, 120) || "file";
}

/**
 * Upload a negotiation attachment to private Storage.
 * Path: `{negotiationId}/{userId}/{timestamp}_{filename}`
 */
export async function uploadNegotiationAttachment(
  negotiationId: string,
  file: File,
): Promise<NegotiationAttachmentUploadResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      ok: false,
      error:
        "対応形式: PDF / 画像 / Word / Excel / テキスト / CSV（10MB以下）",
    };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "ファイルサイズは10MB以下にしてください" };
  }
  if (!negotiationId) {
    return { ok: false, error: "交渉IDが不正です" };
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

  const safeName = sanitizeFileName(file.name);
  const path = `${negotiationId}/${user.id}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(NEGOTIATION_ATTACHMENTS_BUCKET)
    .upload(path, file, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("[uploadNegotiationAttachment]", uploadError.message);
    return {
      ok: false,
      error: `添付のアップロードに失敗しました: ${uploadError.message}`,
    };
  }

  return {
    ok: true,
    path,
    name: file.name,
    mime: file.type || "application/octet-stream",
    size: file.size,
  };
}
