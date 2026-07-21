"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
import {
  updateCaseProductImageAction,
  uploadProductImageAction,
} from "@/lib/actions";
import { Button } from "@/components/ui/Button";

type ProductImageFieldProps = {
  /** Current saved / selected public URL */
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  disabled?: boolean;
  /** Notify parent while Storage upload is in progress (block form submit) */
  onUploadingChange?: (uploading: boolean) => void;
  /**
   * When set, successful upload (or clear) can persist immediately to
   * cases.product_image_url — useful when starting from NULL.
   */
  caseId?: string;
  /** Persist to DB right after Storage upload (requires caseId) */
  saveImmediately?: boolean;
  /** Called after a successful immediate DB save */
  onSaved?: (url: string | null) => void;
  /** UI copy language (default Japanese). English used by /en/maker/setup only. */
  locale?: "ja" | "en";
};

/**
 * Always shows an upload control (even when product_image_url is NULL).
 * Optional immediate DB save via caseId + saveImmediately.
 */
export function ProductImageField({
  value,
  onChange,
  label,
  disabled = false,
  onUploadingChange,
  caseId,
  saveImmediately = false,
  onSaved,
  locale = "ja",
}: ProductImageFieldProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<string | null>(value?.trim() || null);
  const en = locale === "en";
  const fieldLabel = label ?? (en ? "Product Image" : "商品画像");

  useEffect(() => {
    setPreview(value?.trim() || null);
  }, [value]);

  const hasImage = Boolean(preview?.trim());

  function setBusy(next: boolean) {
    setUploading(next);
    onUploadingChange?.(next);
  }

  async function persistUrl(url: string | null): Promise<boolean> {
    if (!caseId || !saveImmediately) return true;
    setSaving(true);
    setSuccess("");
    const result = await updateCaseProductImageAction({
      caseId,
      productImageUrl: url,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return false;
    }
    setSuccess(
      url
        ? en
          ? "Product image saved."
          : "商品画像を保存しました"
        : en
          ? "Product image cleared."
          : "商品画像をクリアしました",
    );
    onSaved?.(url);
    return true;
  }

  async function handleFileChange(file: File | null) {
    setError("");
    setSuccess("");
    if (!file) return;

    setBusy(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadProductImageAction(formData);
      if (result.error || !result.url) {
        setError(
          result.error ||
            (en ? "Image upload failed." : "画像アップロードに失敗しました"),
        );
        if (fileRef.current) fileRef.current.value = "";
        return;
      }

      onChange(result.url);
      setPreview(result.url);

      const ok = await persistUrl(result.url);
      if (!ok) {
        setError((prev) =>
          prev
            ? prev
            : en
              ? "Upload succeeded but saving failed. Use Save at the bottom of the form."
              : "アップロードは成功しましたがDB保存に失敗しました。画面下部の保存を押してください。",
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        en
          ? `Image upload failed: ${message}`
          : `画像アップロードに失敗しました: ${message}`,
      );
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    setError("");
    setSuccess("");
    onChange(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    await persistUrl(null);
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-cream/30 p-4">
      <p className="text-sm font-medium text-navy">{fieldLabel}</p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="shrink-0">
          {hasImage ? (
            <ProductCaseImage
              src={preview}
              alt={en ? "Product image preview" : "商品画像プレビュー"}
              size="detail"
              className="!max-w-[200px]"
              locale={en ? "en" : "ja"}
            />
          ) : (
            <div className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-surface px-3 text-center">
              <p className="text-xs font-medium text-navy">
                {en ? "Product image" : "商品画像"}
              </p>
              <p className="text-xs text-muted">
                {en ? "Not set" : "未登録"}
              </p>
              <p className="text-[11px] leading-snug text-muted">
                {en ? "Add an image here" : "ここから追加できます"}
              </p>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <label htmlFor={inputId} className="block text-xs font-medium text-navy">
            {hasImage
              ? en
                ? "Replace image"
                : "画像を差し替え"
              : en
                ? "Upload image"
                : "画像をアップロード"}
          </label>
          <input
            id={inputId}
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
            disabled={disabled || uploading || saving}
            className="block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-teal file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-teal-dark disabled:opacity-60"
            onChange={(e) => {
              void handleFileChange(e.target.files?.[0] ?? null);
            }}
          />
          <p className="text-xs text-muted">
            {en
              ? saveImmediately && caseId
                ? "JPEG / PNG / WebP / GIF (max 5MB). Uploads to storage, then saves automatically."
                : "JPEG / PNG / WebP / GIF (max 5MB). Use Save on the form to store the URL."
              : saveImmediately && caseId
                ? "JPEG / PNG / WebP / GIF（最大5MB）。選択すると Storage へアップロードされます。 成功後に cases.product_image_url へ自動保存します。"
                : "JPEG / PNG / WebP / GIF（最大5MB）。選択すると Storage へアップロードされます。 フォームの「保存」で DB に反映されます。"}
          </p>

          {uploading || saving ? (
            <p className="text-sm text-navy">
              {uploading
                ? en
                  ? "Uploading…"
                  : "アップロード中…"
                : en
                  ? "Saving…"
                  : "保存中…"}
            </p>
          ) : null}

          {hasImage ? (
            <p className="break-all text-xs text-muted">
              URL: <span className="font-mono text-navy">{preview}</span>
            </p>
          ) : null}

          {hasImage ? (
            <button
              type="button"
              className="text-xs text-teal hover:underline disabled:opacity-50"
              disabled={disabled || uploading || saving}
              onClick={() => {
                void handleClear();
              }}
            >
              {en ? "Clear image" : "画像をクリア"}
            </button>
          ) : null}

          {!saveImmediately && caseId && hasImage ? (
            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                className="!px-3 !py-1.5 text-xs"
                disabled={disabled || uploading || saving}
                onClick={() => {
                  void persistUrl(preview);
                }}
              >
                {en ? "Save image now" : "画像だけ今すぐ保存"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-teal" role="status">
          {success}
        </p>
      ) : null}
    </div>
  );
}
