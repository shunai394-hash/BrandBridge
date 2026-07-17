"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendMessageAction } from "@/lib/actions";
import { uploadNegotiationAttachment } from "@/lib/negotiation-attachment-upload";
import { TextArea } from "@/components/ui/Input";

type MessageFormProps = {
  negotiationId: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageForm({ negotiationId }: MessageFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    setError("");

    const text = body.trim();

    if (!text && !file) {
      setError("メッセージまたは添付ファイルを入力してください");
      return;
    }

    setLoading(true);

    try {
      let attachment = null;

      if (file) {
        const uploaded = await uploadNegotiationAttachment(
          negotiationId,
          file
        );

        if (!uploaded.ok) {
          setError(uploaded.error);
          return;
        }

        attachment = {
          path: uploaded.path,
          name: uploaded.name,
          mime: uploaded.mime,
          size: uploaded.size,
        };
      }

      const result = await sendMessageAction({
        negotiationId,
        body: text,
        attachment,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setBody("");
      setFile(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? `送信に失敗しました: ${err.message}`
          : "送信に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      method="post"
      className="space-y-3"
      data-testid="negotiation-reply-form"
    >
      <TextArea
        label="本文"
        name="body"
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="返信内容を入力"
        data-testid="negotiation-reply-body"
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          添付ファイル（任意）
        </label>

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,.txt,.csv,application/pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          data-testid="negotiation-reply-file"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-cream file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-navy"
        />

        <p className="mt-1 text-xs text-muted">
          PDF / 画像 / Word / Excel / テキスト / CSV（最大10MB）
        </p>

        {file ? (
          <div className="mt-2 rounded-md border border-teal/25 bg-teal/[0.06] px-3 py-2.5">
            <p className="text-sm font-medium text-navy">添付済み</p>
            <p className="mt-0.5 break-all text-sm text-foreground">
              {file.name}
            </p>
            <p className="mt-0.5 text-xs text-muted">{formatBytes(file.size)}</p>
            <button
              type="button"
              className="mt-1.5 text-xs text-muted underline hover:text-navy"
              onClick={() => {
                setFile(null);
                if (fileRef.current) {
                  fileRef.current.value = "";
                }
              }}
            >
              添付をやめる
            </button>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        data-testid="negotiation-reply-submit"
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-teal px-5 py-2.5 text-sm font-medium tracking-wide text-white shadow-[0_8px_24px_rgba(26,138,138,0.28)] transition-all duration-200 hover:bg-teal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "送信中..." : "返信する"}
      </button>
    </form>
  );
}
