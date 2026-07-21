import { MessageForm } from "@/components/negotiations/MessageForm";
import {
  negotiationDetailCopy,
  type NegotiationUiLocale,
} from "@/lib/negotiation-ui";
import type { MessageView } from "@/lib/types";

type MessageThreadProps = {
  negotiationId: string;
  messages: MessageView[];
  initialMessage?: string | null;
  initialFrom?: string;
  initialAt?: string;
  canReply: boolean;
  /** Default Japanese — Japanese routes unchanged. */
  locale?: NegotiationUiLocale;
};

function formatDateTime(value: string, locale: NegotiationUiLocale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatBytes(bytes: number | null | undefined) {
  if (bytes == null || Number.isNaN(bytes)) return null;
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
  locale = "ja",
}: MessageThreadProps) {
  const t = negotiationDetailCopy[locale];

  return (
    <section className="mt-8" lang={locale === "en" ? "en" : undefined}>
      <h2 className="text-xl text-navy">{t.thread}</h2>

      <div className="mt-4 space-y-3">
        {initialMessage ? (
          <article className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs text-muted">
              From: {initialFrom || t.partnerFallback}
            </p>

            {initialAt ? (
              <p className="text-xs text-muted">
                {formatDateTime(initialAt, locale)}
              </p>
            ) : null}

            <p className="mt-3 whitespace-pre-wrap">{initialMessage}</p>
          </article>
        ) : null}

        {messages.map((message) => {
          const sizeLabel = formatBytes(message.attachment?.size ?? null);

          return (
            <article
              key={message.id}
              className="rounded-lg border border-border bg-surface p-4"
              data-testid="negotiation-message"
            >
              <p className="text-xs text-muted">
                From: {message.isMine ? t.you : message.senderName}
              </p>
              <p className="text-xs text-muted">
                {formatDateTime(message.createdAt, locale)}
              </p>

              {message.topic?.trim() ? (
                <p className="mt-3 text-sm font-semibold text-navy">
                  {t.subjectPrefix} {message.topic.trim()}
                </p>
              ) : null}

              {message.body?.trim() ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                  {message.body}
                </p>
              ) : null}

              {message.attachment ? (
                <div
                  className="mt-3 rounded-md border border-teal/25 bg-teal/[0.06] px-3 py-2.5"
                  data-testid="message-attachment"
                >
                  <p className="text-sm font-medium text-navy">
                    {t.attachment}
                  </p>
                  {message.attachment.url ? (
                    <a
                      href={message.attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 break-all text-sm text-teal hover:underline"
                      data-testid="message-attachment-open"
                    >
                      {message.attachment.name}
                    </a>
                  ) : (
                    <p className="mt-0.5 break-all text-sm text-foreground">
                      {message.attachment.name}
                    </p>
                  )}
                  {sizeLabel ? (
                    <p className="mt-0.5 text-xs text-muted">{sizeLabel}</p>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {canReply ? (
        <div className="mt-6 rounded-lg border border-border bg-surface p-4 md:p-5">
          <h3 className="text-sm font-medium text-navy">{t.reply}</h3>
          <div className="mt-3">
            <MessageForm negotiationId={negotiationId} locale={locale} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
