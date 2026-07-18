"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updatePipelineStatusAction } from "@/lib/actions";
import { MessageThread } from "@/components/negotiations/MessageThread";
import { PipelineStatusBadge } from "@/components/negotiations/NegotiationStatusBadge";
import { negotiationsListPath } from "@/lib/negotiation-paths";
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
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [error, setError] = useState("");

  const listHref = negotiationsListPath(user.role);
  const isClosed = item.applicationStatus === "rejected";
  const canReply = !isClosed;
  const canEditPipeline =
    !isClosed &&
    (user.role === "maker" ||
      user.role === "partner" ||
      user.role === "admin");

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
        <Link href={listHref} className="text-sm text-teal hover:underline">
          ← 交渉一覧に戻る
        </Link>
      </div>

      <header className="rounded-lg border border-border bg-surface p-5 md:p-6">
        <p className="text-xs font-medium tracking-wide text-muted">件名</p>
        <h1 className="mt-1 font-[family-name:var(--font-shippori)] text-2xl leading-tight text-navy md:text-3xl">
          {item.topic}
        </h1>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-border pt-4">
          <div className="min-w-0">
            <p className="font-mono text-sm font-medium text-teal">
              商品コード（SKU）：{item.productSku?.trim() || "—"}
            </p>
            <p className="mt-1 text-base font-medium text-navy">
              {item.productName}
            </p>
            <p className="mt-0.5 text-sm text-muted">{item.caseTitle}</p>
          </div>
          {item.pipelineStatus ? (
            <PipelineStatusBadge status={item.pipelineStatus} />
          ) : null}
        </div>

        <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <div className="grid gap-1 sm:grid-cols-[5.5rem_1fr]">
            <dt className="text-muted">相手</dt>
            <dd>
              <Link
                href={`/profiles/${counterpartHref}`}
                className="text-navy hover:text-teal hover:underline"
              >
                {item.counterpartName}
              </Link>
            </dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[5.5rem_1fr]">
            <dt className="text-muted">商品</dt>
            <dd>
              <Link
                href={`/cases/${item.caseId}`}
                className="text-teal hover:underline"
              >
                商品詳細を開く
              </Link>
              <span className="mx-2 text-muted">·</span>
              <span className="text-muted">
                {item.caseCategory}
                {item.caseRegion ? ` / ${item.caseRegion}` : ""}
              </span>
            </dd>
          </div>
        </dl>
      </header>

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
        </section>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {isClosed ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          この交渉は終了しています。メッセージのやり取りはできません。
        </p>
      ) : null}

      <MessageThread
        negotiationId={item.id}
        messages={canReply ? messages : []}
        initialMessage={item.initialMessage}
        initialFrom={item.partnerCompanyName}
        initialAt={item.createdAt}
        canReply={canReply}
      />
    </article>
  );
}
