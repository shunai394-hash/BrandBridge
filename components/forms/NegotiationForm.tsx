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
  accepted: "承認済み",
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
 * Fields: 莉ｶ蜷・required) / 譛ｬ譁・/ 豺ｻ莉・竊・startNegotiationAction({ topic, body, attachment })
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
      setError("莉ｶ蜷阪ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞");
      return;
    }
    if (trimmedTopic.length > TOPIC_MAX) {
      setError(`莉ｶ蜷阪・${TOPIC_MAX}譁・ｭ嶺ｻ･蜀・↓縺励※縺上□縺輔＞`);
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
          setError(draft.error || "negotiations INSERT 縺ｫ螟ｱ謨励＠縺ｾ縺励◆");
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
            "messages 縺御ｽ懈・縺輔ｌ縺ｾ縺帙ｓ縺ｧ縺励◆縲る・遘ｻ繧剃ｸｭ豁｢縺励∪縺励◆縲・,
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
        `騾∽ｿ｡縺ｫ螟ｱ謨励＠縺ｾ縺励◆: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-teal/25 bg-cream/70 p-6">
        <p className="text-sm leading-relaxed text-muted">
          莠､貂峨ｒ逕ｳ縺苓ｾｼ繧縺ｫ縺ｯ縲∬ｲｩ螢ｲ繝代・繝医リ繝ｼ縺ｨ縺励※繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・
        </p>
        <div className="mt-4">
          <Button
            href={`/login?next=${encodeURIComponent(`/cases/${caseId}/negotiation`)}`}
          >
            繝ｭ繧ｰ繧､繝ｳ縺励※逕ｳ縺苓ｾｼ繧
          </Button>
        </div>
      </div>
    );
  }

  if (user.role === "maker") {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-muted">
          繝｡繝ｼ繧ｫ繝ｼ繧｢繧ｫ繧ｦ繝ｳ繝医〒縺ｯ莠､貂臥筏霎ｼ縺ｯ縺ｧ縺阪∪縺帙ｓ縲りｲｩ螢ｲ繝代・繝医リ繝ｼ縺ｨ縺励※逋ｻ骭ｲ繝ｻ繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・
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
          繝｡繝ｼ繝ｫ蠖｢蠑・ﾂｷ 譁ｰ隕上Γ繝・そ繝ｼ繧ｸ
        </p>
        <p className="mt-0.5 text-sm text-muted">
          莉ｶ蜷阪・譛ｬ譁・・豺ｻ莉倥ｒ騾∽ｿ｡縺励※莠､貂峨せ繝ｬ繝・ラ繧帝幕蟋九＠縺ｾ縺・
        </p>
      </div>

      {/* Email meta header */}
      <div className="space-y-0 border-b border-border text-sm">
        <div className="grid grid-cols-[5rem_1fr] items-center gap-2 border-b border-border/70 px-5 py-2.5 md:px-6">
          <span className="text-muted">譯井ｻｶ逡ｪ蜿ｷ</span>
          <span className="font-mono font-medium text-teal">{caseNumber}</span>
        </div>
        <div className="grid grid-cols-[5rem_1fr] items-center gap-2 px-5 py-2.5 md:px-6">
          <span className="text-muted">蝠・刀蜷・/span>
          <span className="font-medium text-navy">{productName}</span>
        </div>
      </div>

      {existingThreads.length > 0 ? (
        <div className="border-b border-border bg-cream/40 px-5 py-3 md:px-6">
          <p className="text-xs font-medium text-navy">
            縺薙・譯井ｻｶ縺ｮ譌｢蟄倥せ繝ｬ繝・ラ・・existingThreads.length}莉ｶ・・
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
        {/* 莉ｶ蜷・窶・required */}
        <div className="grid grid-cols-1 gap-1.5 border-b border-border px-5 py-4 md:grid-cols-[5rem_1fr] md:items-start md:gap-3 md:px-6">
          <label
            htmlFor={topicId}
            className="pt-2.5 text-sm font-semibold text-navy"
          >
            莉ｶ蜷・<span className="text-red-600">*</span>
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
              placeholder="萓・ 蛻晏屓繝ｭ繝・ヨ譚｡莉ｶ縺ｫ縺､縺・※"
              className={fieldClass}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-muted">
              蠢・・ﾂｷ {topic.trim().length}/{TOPIC_MAX} ﾂｷ negotiations.topic /
              messages.topic
            </p>
          </div>
        </div>

        {/* 譛ｬ譁・*/}
        <div className="grid grid-cols-1 gap-1.5 border-b border-border px-5 py-4 md:grid-cols-[5rem_1fr] md:items-start md:gap-3 md:px-6">
          <label
            htmlFor={bodyId}
            className="pt-2.5 text-sm font-semibold text-navy"
          >
            譛ｬ譁・
          </label>
          <div>
            <textarea
              id={bodyId}
              name="body"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="縺疲署譯亥・螳ｹ繝ｻ蜿悶ｊ謇ｱ縺・メ繝｣繝阪Ν繝ｻ蟶梧悍譚｡莉ｶ縺ｪ縺ｩ"
              className={`${fieldClass} min-h-[10rem] resize-y`}
            />
          </div>
        </div>

        {/* 豺ｻ莉・*/}
        <div className="grid grid-cols-1 gap-1.5 border-b border-border px-5 py-4 md:grid-cols-[5rem_1fr] md:items-start md:gap-3 md:px-6">
          <label
            htmlFor={fileId}
            className="pt-1 text-sm font-semibold text-navy"
          >
            豺ｻ莉・
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
              PDF / 逕ｻ蜒・/ Word / Excel / 繝・く繧ｹ繝・/ CSV・域怙螟ｧ10MB・・
            </p>
            {file ? (
              <p className="mt-2 text-sm text-navy">
                驕ｸ謚樔ｸｭ: {file.name}・・formatBytes(file.size)}・・
                <button
                  type="button"
                  className="ml-2 text-xs text-muted underline"
                  onClick={() => {
                    setFile(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  隗｣髯､
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
                [negotiation-start] 繝ｭ繧ｰ
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all text-[11px] text-navy">
                {debugLogs.join("\n")}
              </pre>
            </details>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "騾∽ｿ｡荳ｭ..." : "騾∽ｿ｡縺励※莠､貂峨ｒ髢句ｧ・}
            </Button>
            <Button href={`/cases/${caseId}`} variant="outline" type="button">
              繧ｭ繝｣繝ｳ繧ｻ繝ｫ
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

