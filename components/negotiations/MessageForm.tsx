"use client";

import { FormEvent, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendMessageAction } from "@/lib/actions";
import { uploadNegotiationAttachment } from "@/lib/negotiation-attachment-upload";

type MessageFormProps = {
  negotiationId: string;
};

const TOPIC_MAX = 120;

const fieldClass =
  "w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

const submitButtonClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-teal px-5 py-2.5 text-sm font-medium tracking-wide text-white shadow-[0_8px_24px_rgba(26,138,138,0.28)] transition-all duration-200 hover:bg-teal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageForm({ negotiationId }: MessageFormProps) {
  const router = useRouter();
  const topicId = useId();
  const bodyId = useId();
  const fileId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const [topic, setTopic] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setError("");

    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError("件名を入力してください");
      return;
    }
    if (trimmedTopic.length > TOPIC_MAX) {
      setError(`件名は${TOPIC_MAX}文字以内にしてください`);
      return;
    }

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
          file,
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
        topic: trimmedTopic,
        attachment,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setTopic("");
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
          : "送信に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      method="post"
      className="space-y-0"
      data-testid="negotiation-reply-form"
      data-form-version="reply-email-v1"
    >
      <div className="grid grid-cols-1 gap-1.5 border-b border-border pb-4 md:grid-cols-[5rem_1fr] md:items-start md:gap-3">
        <label
          htmlFor={topicId}
          className="pt-2.5 text-sm font-semibold text-navy"
        >
          件名 <span className="text-red-600">*</span>
        </label>
        <div>
          <input
            id={topicId}
            name="topic"
            type="text"
            required
            maxLength={TOPIC_MAX}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例: 条件について回答いたします"
            className={fieldClass}
            autoComplete="off"
            data-testid="negotiation-reply-topic"
          />
          <p className="mt-1 text-xs text-muted">
            必須 · {topic.trim().length}/{TOPIC_MAX}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1.5 border-b border-border py-4 md:grid-cols-[5rem_1fr] md:items-start md:gap-3">
        <label
          htmlFor={bodyId}
          className="pt-2.5 text-sm font-semibold text-navy"
        >
          本文
        </label>
        <div>
          <textarea
            id={bodyId}
            name="body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="返信内容を入力"
            className={`${fieldClass} min-h-[7rem] resize-y`}
            data-testid="negotiation-reply-body"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1.5 border-b border-border py-4 md:grid-cols-[5rem_1fr] md:items-start md:gap-3">
        <label
          htmlFor={fileId}
          className="pt-1 text-sm font-semibold text-navy"
        >
          添付
        </label>
        <div>
          <input
            id={fileId}
            ref={fileRef}
            name="attachment"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,.txt,.csv,application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            data-testid="negotiation-reply-file"
            className="block w-full max-w-md cursor-pointer text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-teal/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-teal hover:file:bg-teal/15"
          />
          <p className="mt-1.5 text-xs text-muted">
            PDF / 画像 / Word / Excel / テキスト / CSV（最大10MB）
          </p>

          {file ? (
            <div
              className="mt-2 rounded-md border border-teal/25 bg-teal/[0.06] px-3 py-2.5"
              data-testid="negotiation-reply-file-ready"
            >
              <p className="text-sm font-medium text-navy">📎 添付済み</p>
              <p className="mt-0.5 break-all text-sm text-foreground">
                {file.name}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {formatBytes(file.size)}
              </p>
              <p className="mt-1 text-xs text-teal">アップロード準備完了</p>
              <button
                type="button"
                className="mt-1.5 cursor-pointer text-xs text-muted underline hover:text-navy"
                onClick={() => {
                  setFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                添付をやめる
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="pt-4">
        <button
          type="submit"
          data-testid="negotiation-reply-submit"
          className={submitButtonClass}
        >
          {loading ? "送信中..." : "返信する"}
        </button>
      </div>
    </form>
  );
}
