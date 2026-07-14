import { MessageForm } from "@/components/negotiations/MessageForm";
import type { MessageView } from "@/lib/types";

type MessageThreadProps = {
  negotiationId: string;
  messages: MessageView[];
  /** Initial application message shown as first mail-like entry */
  initialMessage?: string | null;
  initialFrom?: string;
  initialAt?: string;
  canReply: boolean;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatBytes(bytes: number | null | undefined) {
  if (bytes == null || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageThread({
  negotiationId,
  messages,
  initialMessage,
  initialFrom,
  initialAt,
  canReply,
}: MessageThreadProps) {
  const hasInitial = Boolean(initialMessage?.trim());

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
            スレッド
          </h2>
          <p className="mt-1 text-sm text-muted">
            時系列でメッセージを確認し、同じ画面から返信できます。
          </p>
        </div>
        <p className="text-xs text-muted">{messages.length}件の返信</p>
      </div>

      <div className="space-y-3">
        {hasInitial && messages.length === 0 ? (
          <article className="rounded-lg border border-border bg-cream/40 px-4 py-3.5 md:px-5">
            <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/70 pb-2 text-xs text-muted">
              <p>
                <span className="font-medium text-navy">From:</span>{" "}
                {initialFrom || "パートナー"}
              </p>
              {initialAt ? (
                <time>{formatDateTime(initialAt)}</time>
              ) : null}
            </header>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {initialMessage}
            </p>
          </article>
        ) : null}

        {messages.length === 0 && !hasInitial ? (
          <p className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
            まだメッセージはありません。下の返信欄から送信してください。
          </p>
        ) : null}

        {messages.map((message) => (
          <article
            key={message.id}
            className={[
              "rounded-lg border px-4 py-3.5 md:px-5",
              message.isMine
                ? "border-teal/30 bg-teal/[0.06]"
                : "border-border bg-surface",
            ].join(" ")}
          >
            <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/70 pb-2 text-xs text-muted">
              <p>
                <span className="font-medium text-navy">From:</span>{" "}
                {message.isMine ? "あなた" : message.senderName}
              </p>
              <time>{formatDateTime(message.createdAt)}</time>
            </header>
            {message.body ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {message.body}
              </p>
            ) : null}
            {message.attachment ? (
              <div className="mt-3 rounded-md border border-border bg-cream/50 px-3 py-2 text-xs">
                <p className="font-medium text-navy break-all">
                  添付: {message.attachment.name}
                  {message.attachment.size != null
                    ? `（${formatBytes(message.attachment.size)}）`
                    : ""}
                </p>
                {message.attachment.url ? (
                  <a
                    href={message.attachment.url}
                    download={message.attachment.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block font-medium text-teal underline underline-offset-2"
                  >
                    ダウンロード
                  </a>
                ) : (
                  <p className="mt-1 text-muted">
                    ダウンロードリンクを取得できませんでした
                  </p>
                )}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {canReply ? (
        <div className="mt-6 rounded-lg border border-border bg-surface p-4 md:p-5">
          <h3 className="text-sm font-medium text-navy">返信</h3>
          <div className="mt-3">
            <MessageForm negotiationId={negotiationId} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
