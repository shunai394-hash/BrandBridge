import { MessageForm } from "@/components/negotiations/MessageForm";
import type { MessageView } from "@/lib/types";

type MessageThreadProps = {
  negotiationId: string;
  messages: MessageView[];
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MessageThread({ negotiationId, messages }: MessageThreadProps) {
  return (
    <section className="mt-10 rounded-lg border border-border bg-surface p-5 md:p-6">
      <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
        メッセージ
      </h2>
      <p className="mt-1 text-sm text-muted">
        承認後のやりとりはここで行えます。送信後に画面が更新されます。
      </p>

      <div className="mt-5 max-h-[28rem] space-y-3 overflow-y-auto rounded-md bg-cream/50 p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            まだメッセージはありません。最初のメッセージを送って交渉を始めましょう。
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={[
                "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm",
                message.isMine
                  ? "ml-auto bg-teal text-white"
                  : "mr-auto border border-border bg-white text-foreground",
              ].join(" ")}
            >
              <p
                className={[
                  "mb-1 text-xs",
                  message.isMine ? "text-white/80" : "text-muted",
                ].join(" ")}
              >
                {message.isMine ? "あなた" : message.senderName} ・{" "}
                {formatDateTime(message.createdAt)}
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-4">
        <MessageForm negotiationId={negotiationId} />
      </div>
    </section>
  );
}
