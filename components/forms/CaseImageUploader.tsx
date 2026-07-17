"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteCaseImageAction,
  reorderCaseImagesAction,
  uploadAndAddCaseImageAction,
} from "@/lib/actions";
import { MAX_CASE_IMAGES } from "@/lib/case-image-constants";
import type { CaseImage } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export type CaseImageUploaderProps = {
  caseId: string;
  /** Existing gallery rows (from case_images) */
  images?: CaseImage[];
  /** Legacy single URL fallback when images empty */
  productImageUrl?: string | null;
  disabled?: boolean;
};

function toInitial(images: CaseImage[] | undefined, legacyUrl?: string | null) {
  if (images && images.length > 0) return images;
  const url = legacyUrl?.trim();
  if (!url) return [];
  return [
    {
      id: `legacy-preview`,
      caseId: "",
      imageUrl: url,
      storagePath: null,
      sortOrder: 0,
      createdAt: "",
    },
  ];
}

/**
 * Multi product-image manager (max 4).
 * Upload → Storage → case_images INSERT → sync product_image_url (DB trigger).
 */
export function CaseImageUploader({
  caseId,
  images: initialImages,
  productImageUrl,
  disabled = false,
}: CaseImageUploaderProps) {
  const router = useRouter();
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<CaseImage[]>(() =>
    toInitial(initialImages, productImageUrl),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setImages(toInitial(initialImages, productImageUrl));
  }, [initialImages, productImageUrl]);

  const canAdd = images.length < MAX_CASE_IMAGES;

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setSuccess("");

    const remaining = MAX_CASE_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`商品画像は最大${MAX_CASE_IMAGES}枚までです`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    setBusy(true);

    try {
      const next = [...images];
      let lastError = "";
      for (const file of selected) {
        const formData = new FormData();
        formData.set("caseId", caseId);
        formData.set("file", file);

        // Server Action: cookie session JWT → Storage → case_images
        const saved = await uploadAndAddCaseImageAction(formData);

        if (saved.error || !saved.imageUrl) {
          lastError = saved.error || "画像アップロードに失敗しました";
          break;
        }

        next.push({
          id: saved.imageId || `tmp-${Date.now()}`,
          caseId,
          imageUrl: saved.imageUrl,
          storagePath: saved.storagePath ?? null,
          sortOrder: next.length,
          createdAt: new Date().toISOString(),
        });
      }

      setImages(next);
      if (lastError) {
        setError(lastError);
      } else if (next.length > images.length) {
        setSuccess(`画像を保存しました（${next.length}/${MAX_CASE_IMAGES}）`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "画像アップロードに失敗しました");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(imageId: string) {
    if (imageId.startsWith("legacy-")) {
      setError(
        "旧形式の画像です。新しい画像を追加してから削除するか、再アップロードしてください。",
      );
      return;
    }

    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const result = await deleteCaseImageAction({ caseId, imageId });
      if (result.error) {
        setError(result.error);
        return;
      }
      setImages((prev) =>
        prev
          .filter((img) => img.id !== imageId)
          .map((img, i) => ({ ...img, sortOrder: i })),
      );
      setSuccess("画像を削除しました");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    const ordered = [...images];
    const tmp = ordered[index];
    ordered[index] = ordered[target];
    ordered[target] = tmp;
    const orderedIds = ordered.map((img) => img.id);

    if (orderedIds.some((id) => id.startsWith("legacy-"))) {
      setError("並び替え前に、ギャラリーへ正式登録し直してください");
      return;
    }

    setError("");
    setBusy(true);
    setImages(ordered.map((img, i) => ({ ...img, sortOrder: i })));

    const result = await reorderCaseImagesAction({ caseId, orderedIds });
    setBusy(false);

    if (result.error) {
      setError(result.error);
      router.refresh();
      return;
    }
    setSuccess("表示順を更新しました（先頭がメイン画像）");
    router.refresh();
  }

  return (
    <section
      id="case-image-uploader"
      data-testid="case-image-uploader"
      className="mb-8 rounded-lg border-2 border-teal bg-white p-5 shadow-sm"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-navy">商品画像管理</h2>
          <p className="mt-1 text-xs text-muted">
            最大{MAX_CASE_IMAGES}枚 · JPEG / PNG / WebP · 各10MB以下 · 先頭がメイン画像
          </p>
        </div>
        <span
          className={
            images.length === 0
              ? "rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900"
              : "rounded bg-teal/15 px-2 py-1 text-xs font-medium text-teal"
          }
        >
          {images.length === 0
            ? "商品画像未登録"
            : `${images.length}/${MAX_CASE_IMAGES}枚`}
        </span>
      </div>

      {images.length === 0 ? (
        <div className="mb-4 flex h-40 items-center justify-center rounded-md border border-dashed border-border bg-cream">
          <p className="text-sm font-medium text-muted">商品画像未登録</p>
        </div>
      ) : (
        <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, index) => (
            <li
              key={img.id}
              className="overflow-hidden rounded-md border border-border bg-cream"
            >
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={`商品画像 ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 0 ? (
                  <span className="absolute left-1.5 top-1.5 rounded bg-navy/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    メイン
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-1 p-2">
                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={() => void moveImage(index, -1)}
                  className="rounded border border-border bg-white px-2 py-1 text-[11px] text-navy disabled:opacity-40"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={busy || index === images.length - 1}
                  onClick={() => void moveImage(index, 1)}
                  className="rounded border border-border bg-white px-2 py-1 text-[11px] text-navy disabled:opacity-40"
                >
                  →
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleDelete(img.id)}
                  className="ml-auto rounded border border-red-200 bg-white px-2 py-1 text-[11px] text-red-700 disabled:opacity-40"
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        id={inputId}
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        multiple
        disabled={disabled || busy || !canAdd}
        className="mb-3 block w-full max-w-md text-sm"
        onChange={(e) => {
          void handleUpload(e.target.files);
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={disabled || busy || !canAdd}
          onClick={() => fileRef.current?.click()}
        >
          {busy
            ? "処理中…"
            : canAdd
              ? "画像をアップロード"
              : `上限（${MAX_CASE_IMAGES}枚）に達しています`}
        </Button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-3 text-sm text-teal" role="status">
          {success}
        </p>
      ) : null}
    </section>
  );
}
