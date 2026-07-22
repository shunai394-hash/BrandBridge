"use client";

import { useId, useRef, useState } from "react";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
import { uploadProductImageAction } from "@/lib/actions";
import { MAX_CASE_IMAGES } from "@/lib/case-image-constants";

type SetupProductImagesFieldProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
  locale?: "ja" | "en";
};

/**
 * Pre-case multi-image upload for maker setup.
 * Uploads to Storage only; parent persists URLs on form submit.
 */
export function SetupProductImagesField({
  value,
  onChange,
  onUploadingChange,
  disabled = false,
  locale = "en",
}: SetupProductImagesFieldProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const en = locale === "en";
  const urls = value.filter((u) => u.trim());
  const canAdd = urls.length < MAX_CASE_IMAGES;

  function setBusy(next: boolean) {
    setUploading(next);
    onUploadingChange?.(next);
  }

  async function handleFiles(files: FileList | null) {
    setError("");
    if (!files?.length) return;
    const remaining = MAX_CASE_IMAGES - urls.length;
    if (remaining <= 0) {
      setError(
        en
          ? `You can upload up to ${MAX_CASE_IMAGES} images.`
          : `商品画像は最大${MAX_CASE_IMAGES}枚までです`,
      );
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    setBusy(true);
    const next = [...urls];
    try {
      for (const file of selected) {
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadProductImageAction(formData);
        if (result.error || !result.url) {
          setError(
            result.error ||
              (en ? "Image upload failed." : "画像アップロードに失敗しました"),
          );
          break;
        }
        next.push(result.url);
      }
      onChange(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        en
          ? `Image upload failed: ${message}`
          : `画像アップロードに失敗しました: ${message}`,
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-cream/30 p-4">
      <p className="text-sm font-medium text-navy">
        {en ? "Product Images" : "商品画像"}
        <span className="ml-1 text-xs font-normal text-muted">
          {en
            ? `(optional, up to ${MAX_CASE_IMAGES})`
            : `（任意・最大${MAX_CASE_IMAGES}枚）`}
        </span>
      </p>

      {urls.length > 0 ? (
        <ul className="flex flex-wrap gap-3">
          {urls.map((url, index) => (
            <li key={`${url}-${index}`} className="relative w-[7.5rem]">
              <ProductCaseImage
                src={url}
                alt={en ? `Product image ${index + 1}` : `商品画像 ${index + 1}`}
                size="tiny"
                className="!h-24 !w-24"
                locale={en ? "en" : "ja"}
              />
              <button
                type="button"
                className="mt-1 text-xs text-teal hover:underline disabled:opacity-50"
                disabled={disabled || uploading}
                onClick={() => removeAt(index)}
              >
                {en ? "Remove" : "削除"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-[5rem] items-center justify-center rounded-md border border-dashed border-border bg-surface px-3 text-center text-xs text-muted">
          {en
            ? "No images yet — upload at least 3 for a complete listing preview."
            : "未登録 — 完成イメージには3枚以上のアップロードを推奨します。"}
        </div>
      )}

      {canAdd ? (
        <div className="space-y-1">
          <label htmlFor={inputId} className="block text-xs font-medium text-navy">
            {en ? "Upload images" : "画像をアップロード"}
          </label>
          <input
            id={inputId}
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
            multiple
            disabled={disabled || uploading}
            className="block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-teal file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-teal-dark disabled:opacity-60"
            onChange={(e) => {
              void handleFiles(e.target.files);
            }}
          />
          <p className="text-xs text-muted">
            {en
              ? `JPEG / PNG / WebP / GIF (max 5MB each). ${urls.length}/${MAX_CASE_IMAGES} selected.`
              : `JPEG / PNG / WebP / GIF（各最大5MB）。${urls.length}/${MAX_CASE_IMAGES}枚選択中。`}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted">
          {en
            ? `Maximum of ${MAX_CASE_IMAGES} images reached.`
            : `最大${MAX_CASE_IMAGES}枚まで登録済みです。`}
        </p>
      )}

      {uploading ? (
        <p className="text-sm text-navy">
          {en ? "Uploading…" : "アップロード中…"}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
