"use client";

import Link from "next/link";
import { FormEvent, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  completeNegotiationOpeningAction,
  startNegotiationAction,
  startNegotiationDraftAction,
} from "@/lib/negotiation-start-action";
import { uploadNegotiationAttachment } from "@/lib/negotiation-attachment-upload";
import { Button } from "@/components/ui/Button";
import type { ApplicationStatus, SessionUser } from "@/lib/types";

type ExistingThread = {
  id: string;
  topic: string;
  applicationStatus: ApplicationStatus;
};

type NegotiationFormProps = {
  caseId: string;
  caseNumber: string;
  productName: string;
  user: SessionUser | null;
  existingThreads?: ExistingThread[];
};

const statusLabel: Record<ApplicationStatus, string> = {
  pending: "審査中",
  accepted: "承認済",
  rejected: "却下",
};

const TOPIC_MAX = 120;

const fieldClass =
  "w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Email-style negotiation start form.
 * Fields: 件名(required) / 本文 / 添付 → startNegotiationAction({ topic, body, attachment })
 */
export function NegotiationForm({
  caseId,
  caseNumber,
  productName,
  user,
  existingThreads = [],
}: NegotiationFormProps) {
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
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setDebugLogs([]);

    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError("件名を入力してください");
      return;
    }
    if (trimmedTopic.length > TOPIC_MAX) {
      setError(`件名は${TOPIC_MAX}文字以内にしてください`);
      return;
    }

    const trimmedBody = body.trim();
    setLoading(true);

    try {
      let result;

      if (file) {
        const draft = await startNegotiationDraftAction({
          caseId,
          topic: trimmedTopic,
          body: trimmedBody,
        });
        setDebugLogs((prev) => [...prev, ...(draft.logs ?? [])]);

        if (draft.error === "LOGIN_REQUIRED") {
          window.location.href = `/login?next=${encodeURIComponent(`/cases/${caseId}/negotiation`)}`;
          return;
        }
        if (!draft.ok || !draft.id) {
          setError(draft.error || "negotiations INSERT に失敗しました");
          return;
        }

        const uploaded = await uploadNegotiationAttachment(draft.id, file);
        if (!uploaded.ok) {
          setError(uploaded.error);
          return;
        }

        const attachment = {
          path: uploaded.path,
          name: uploaded.name,
          mime: uploaded.mime,
          size: uploaded.size,
        };

        result = await completeNegotiationOpeningAction({
          negotiationId: draft.id,
          caseId,
          topic: trimmedTopic,
          body: trimmedBody,
          attachment,
        });
      } else {
        result = await startNegotiationAction({
          caseId,
          topic: trimmedTopic,
          body: trimmedBody,
          attachment: null,
        });
      }

      setDebugLogs((prev) => [...prev, ...(result.logs ?? [])]);

      if (result.error === "LOGIN_REQUIRED") {
        window.location.href = `/login?next=${encodeURIComponent(`/cases/${caseId}/negotiation`)}`;
        return;
      }

      if (!result.ok || !result.id || !result.messageId) {
        setError(
          result.error ||
            "messages が作成されませんでした。遷移を中止しました。",
        );
        return;
      }

      console.info("[negotiation-start] redirect", {
        href: `/negotiations/${result.id}`,
        messageId: result.messageId,
      });

      router.push(`/negotiations/${result.id}`);
      router.refresh();
    } catch (err) {
      setError(
        `送信に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-teal/25 bg-cream/70 p-6">
        <p className="text-sm leading-relaxed text-muted">
          交渉を申し込むには、販売パートナーとしてログインしてください。
        </p>
        <div className="mt-4">
          <Button
            href={`/login?next=${encodeURIComponent(`/cases/${caseId}/negotiation`)}`}
          >
            ログインして申し込む
          </Button>
        </div>
      </div>
    );
  }

  if (user.role === "maker") {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-muted">
          メーカーアカウントでは交渉申込はできません。販売パートナーとして登録・ログインしてください。
        </p>
      </div>
    );
  }

  return (
    <section
      data-testid="negotiation-email-form"
      data-form-version="email-v2"
      className="overflow-hidden rounded-lg border-2 border-teal/40 bg-white shadow-sm"
    >
      <div className="border-b border-teal/20 bg-teal/5 px-5 py-3 md:px-6">
        <p className="text-xs font-semibold tracking-wide text-teal">
          メール形式 · 新規メッセージ
        </p>
        <p className="mt-0.5 text-sm text-muted">
          件名・本文・添付を送信して交渉スレッドを開始します
        </p>
      </div>

      {/* Email meta header */}
      <div className="space-y-0 border-b border-border text-sm">
        <div className="grid grid-cols-[5rem_1fr] items-center gap-2 border-b border-border/70 px-5 py-2.5 md:px-6">
          <span className="text-muted">案件番号</span>
          <span className="font-mono font-medium text-teal">{caseNumber}</span>
        </div>
        <div className="grid grid-cols-[5rem_1fr] items-center gap-2 px-5 py-2.5 md:px-6">
          <span className="text-muted">商品名</span>
          <span className="font-medium text-navy">{productName}</span>
        </div>
      </div>

      {existingThreads.length > 0 ? (
        <div className="border-b border-border bg-cream/40 px-5 py-3 md:px-6">
          <p className="text-xs font-medium text-navy">
            この案件の既存スレッド（{existingThreads.length}件）
          </p>
          <ul className="mt-2 space-y-1">
            {existingThreads.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/negotiations/${t.id}`}
                  className="text-sm text-teal hover:underline"
                >
                  {t.topic}
                  <span className="ml-2 text-xs text-muted">
                    ({statusLabel[t.applicationStatus]})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-0">
        {/* 件名 — required */}
        <div className="grid grid-cols-1 gap-1.5 border-b border-border px-5 py-4 md:grid-cols-[5rem_1fr] md:items-start md:gap-3 md:px-6">
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
              placeholder="例: 初回ロット条件について"
              className={fieldClass}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-muted">
              必須 · {topic.trim().length}/{TOPIC_MAX} · negotiations.topic /
              messages.topic
            </p>
          </div>
        </div>

        {/* 本文 */}
        <div className="grid grid-cols-1 gap-1.5 border-b border-border px-5 py-4 md:grid-cols-[5rem_1fr] md:items-start md:gap-3 md:px-6">
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
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="ご提案内容・取り扱いチャネル・希望条件など"
              className={`${fieldClass} min-h-[10rem] resize-y`}
            />
          </div>
        </div>

        {/* 添付 */}
        <div className="grid grid-cols-1 gap-1.5 border-b border-border px-5 py-4 md:grid-cols-[5rem_1fr] md:items-start md:gap-3 md:px-6">
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
              className="block w-full max-w-md cursor-pointer text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-teal/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-teal hover:file:bg-teal/15"
            />
            <p className="mt-1.5 text-xs text-muted">
              PDF / 画像 / Word / Excel / テキスト / CSV（最大10MB）
            </p>
            {file ? (
              <p className="mt-2 text-sm text-navy">
                選択中: {file.name}（{formatBytes(file.size)}）
                <button
                  type="button"
                  className="ml-2 text-xs text-muted underline"
                  onClick={() => {
                    setFile(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  解除
                </button>
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 px-5 py-4 md:px-6">
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {debugLogs.length > 0 ? (
            <details
              className="rounded-md border border-border bg-cream/50 p-3"
              open
            >
              <summary className="cursor-pointer text-xs font-semibold text-navy">
                [negotiation-start] ログ
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all text-[11px] text-navy">
                {debugLogs.join("\n")}
              </pre>
            </details>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={loading || !topic.trim()}>
              {loading ? "送信中..." : "送信して交渉を開始"}
            </Button>
            <Button href={`/cases/${caseId}`} variant="outline" type="button">
              キャンセル
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
