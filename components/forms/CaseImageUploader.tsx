"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
import { uploadProductImageFile } from "@/lib/product-image-upload";
import { updateCaseProductImageAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";

type CaseImageUploaderProps = {
  caseId?: string;
  productImageUrl?: string | null;
  value?: string | null;
  onChange?: (url: string | null) => void;
  label?: string;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
  saveImmediately?: boolean;
  onSaved?: (url: string | null) => void;
};

export function CaseImageUploader({
  caseId,
  productImageUrl,
  value,
  onChange,
  label = "商品画像",
  disabled = false,
  onUploadingChange,
  saveImmediately = false,
  onSaved,
}: CaseImageUploaderProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(
    productImageUrl ?? value ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPreview(productImageUrl ?? value ?? null);
  }, [productImageUrl, value]);

  function setBusy(flag: boolean) {
    setUploading(flag);
    onUploadingChange?.(flag);
  }

  async function saveImage(url: string | null) {
    if (!caseId || !saveImmediately) return;

    setSaving(true);

    const result = await updateCaseProductImageAction({
      caseId,
      productImageUrl: url,
    });

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSaved?.(url);
  }

  async function upload(file: File | null) {
    if (!file) return;

    setError("");
    setBusy(true);

    try {
      const result = await uploadProductImageFile(file);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setPreview(result.url);
      onChange?.(result.url);

      await saveImage(result.url);

    } catch (e) {
      setError(
        e instanceof Error ? e.message : "画像アップロード失敗",
      );
    } finally {
      setBusy(false);
    }
  }

  async function clearImage() {
    setPreview(null);
    onChange?.(null);
    await saveImage(null);
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-4">

      <p className="font-medium text-navy">
        {label}
      </p>

      <ProductCaseImage
        src={preview}
        alt="商品画像"
        size="detail"
      />

      <input
        id={inputId}
        ref={fileRef}
        type="file"
        accept="image/*"
        disabled={disabled || uploading || saving}
        onChange={(e) =>
          upload(e.target.files?.[0] ?? null)
        }
      />

      {preview && (
        <Button
          type="button"
          variant="outline"
          disabled={uploading || saving}
          onClick={() => clearImage()}
        >
          画像を削除
        </Button>
      )}

      {uploading && (
        <p className="text-sm">
          アップロード中...
        </p>
      )}

      {saving && (
        <p className="text-sm">
          保存中...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

    </div>
  );
}