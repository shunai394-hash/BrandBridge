"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  acceptNegotiationAction,
  rejectNegotiationAction,
  updatePipelineStatusAction,
} from "@/lib/actions";
import { MessageThread } from "@/components/negotiations/MessageThread";
import {
  NegotiationStatusBadge,
  PipelineStatusBadge,
} from "@/components/negotiations/NegotiationStatusBadge";
import { Button } from "@/components/ui/Button";
import type {
  MessageView,
  NegotiationListItem,
  PipelineStatus,
  SessionUser,
} from "@/lib/types";
import {
  pipelineStatusLabels,
  pipelineStatusOptions,
} from "@/lib/types";

type NegotiationDetailProps = {
  item: NegotiationListItem;
  user: SessionUser;
  messages: MessageView[];
};

export function NegotiationDetail({
  item,
  user,
  messages,
}: NegotiationDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [error, setError] = useState("");

  const canModerate =
    user.role === "maker" && item.applicationStatus === "pending";
  const canEditPipeline =
    item.applicationStatus === "accepted" &&
    (user.role === "maker" ||
      user.role === "partner" ||
      user.role === "admin");

  async function handleAccept() {
    setError("");
    setLoading("accept");
    const result = await acceptNegotiationAction(item.id);
    setLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleReject() {
    setError("");
    setLoading("reject");
    const result = await rejectNegotiationAction(item.id);
    setLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handlePipelineChange(pipelineStatus: PipelineStatus) {
    setError("");
    setPipelineLoading(true);
    const result = await updatePipelineStatusAction({
      negotiationId: item.id,
      pipelineStatus,
    });
    setPipelineLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const counterpartHref =
    user.role === "maker"
      ? item.partnerId
      : user.role === "partner"
        ? item.makerId
        : item.partnerId;

  return (
    <article className="animate-fade-up">
      <div className="mb-6">
        <Link href="/negotiations" className="text-sm text-teal hover:underline">
          ← 交渉一覧に戻る
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-cream px-2.5 py-1 text-navy">
              {item.caseCategory}
            </span>
            <span className="rounded bg-cream px-2.5 py-1 text-navy">
              {item.caseRegion}
            </span>
          </div>
          <h1 className="mt-3 font-[family-name:var(--font-shippori)] text-3xl leading-tight text-navy md:text-4xl">
            {item.caseTitle}
          </h1>
          <p className="mt-3 text-muted">
            相手:{" "}
            <Link
              href={`/profiles/${counterpartHref}`}
              className="text-navy hover:text-teal hover:underline"
            >
              {item.counterpartName}
            </Link>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <NegotiationStatusBadge status={item.applicationStatus} />
          <PipelineStatusBadge status={item.pipelineStatus} />
        </div>
      </div>

      <section className="mt-8 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          申込メッセージ
        </h2>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed text-foreground/90">
          {item.initialMessage?.trim() || "（メッセージなし）"}
        </p>
        <p className="mt-4 text-xs text-muted">
          <Link href={`/cases/${item.caseId}`} className="text-teal hover:underline">
            案件詳細を見る
          </Link>
        </p>
      </section>

      {canModerate ? (
        <section className="mt-6 rounded-lg border border-teal/25 bg-cream/70 p-5">
          <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
            交渉の審査
          </h2>
          <p className="mt-2 text-sm text-muted">
            承認すると、メッセージと成約プロセス（パイプライン）が開始します。
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleAccept}
              disabled={loading !== null}
            >
              {loading === "accept" ? "処理中..." : "承認する"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReject}
              disabled={loading !== null}
            >
              {loading === "reject" ? "処理中..." : "却下する"}
            </Button>
          </div>
        </section>
      ) : null}

      {canEditPipeline ? (
        <section className="mt-6 rounded-lg border border-border bg-surface p-5">
          <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
            成約プロセス
          </h2>
          <p className="mt-2 text-sm text-muted">
            交渉中 → 条件確認 → 契約準備 → 成約 / 終了
          </p>
          <label className="mt-4 flex flex-col gap-1.5 text-sm sm:max-w-xs">
            <span className="font-medium text-navy">ステータス</span>
            <select
              className="rounded-md border border-border px-3 py-2"
              value={item.pipelineStatus ?? "in_negotiation"}
              disabled={pipelineLoading}
              onChange={(e) =>
                handlePipelineChange(e.target.value as PipelineStatus)
              }
            >
              {pipelineStatusOptions.map((s) => (
                <option key={s} value={s}>
                  {pipelineStatusLabels[s]}
                </option>
              ))}
            </select>
          </label>
          {item.hasDeal ? (
            <p className="mt-3 text-sm text-teal">
              成約レコードが登録されています。{" "}
              <Link href="/deals" className="underline">
                成約一覧
              </Link>
            </p>
          ) : null}
          {user.role === "admin" && !item.hasDeal ? (
            <p className="mt-3 text-sm text-muted">
              成約金額の登録は{" "}
              <Link href="/admin/negotiations" className="text-teal underline">
                管理画面の交渉一覧
              </Link>
              から行えます。
            </p>
          ) : null}
        </section>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {item.applicationStatus === "pending" && user.role === "partner" ? (
        <p className="mt-8 rounded-lg border border-border bg-surface px-5 py-4 text-sm text-muted">
          メーカーの審査をお待ちください。承認されるとメッセージ機能が利用できます。
        </p>
      ) : null}

      {item.applicationStatus === "rejected" ? (
        <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          この交渉は却下されました。メッセージのやり取りはできません。
        </p>
      ) : null}

      {item.applicationStatus === "accepted" ? (
        <MessageThread negotiationId={item.id} messages={messages} />
      ) : null}
    </article>
  );
}
