"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updatePipelineStatusAction } from "@/lib/actions";
import { MessageThread } from "@/components/negotiations/MessageThread";
import { PipelineStatusBadge } from "@/components/negotiations/NegotiationStatusBadge";
import { negotiationsListPath } from "@/lib/negotiation-paths";
import {
  negotiationDetailCopy,
  pipelineStatusLabelsEn,
  toEnglishActionError,
  type NegotiationUiLocale,
} from "@/lib/negotiation-ui";
import { enCategoryLabel } from "@/lib/en-case-catalog";
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
  /** Default Japanese — Japanese routes unchanged. */
  locale?: NegotiationUiLocale;
};

export function NegotiationDetail({
  item,
  user,
  messages,
  locale = "ja",
}: NegotiationDetailProps) {
  const router = useRouter();
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [error, setError] = useState("");
  const t = negotiationDetailCopy[locale];
  const en = locale === "en";

  const listHref = en
    ? "/en/negotiations"
    : negotiationsListPath(user.role);
  const caseHref = en ? `/en/cases/${item.caseId}` : `/cases/${item.caseId}`;
  const dealsHref = en ? "/en/deals" : "/deals";
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
      setError(en ? toEnglishActionError(result.error) : result.error);
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
    <article
      className="animate-fade-up"
      lang={en ? "en" : undefined}
    >
      <div className="mb-6">
        <Link href={listHref} className="text-sm text-teal hover:underline">
          {t.back}
        </Link>
      </div>

      <header className="rounded-lg border border-border bg-surface p-5 md:p-6">
        <p className="text-xs font-medium tracking-wide text-muted">{t.topic}</p>
        <h1 className="mt-1 font-[family-name:var(--font-shippori)] text-2xl leading-tight text-navy md:text-3xl">
          {item.topic}
        </h1>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-border pt-4">
          <div className="min-w-0">
            <p className="font-mono text-sm font-medium text-teal">
              {t.sku} {item.productSku?.trim() || "—"}
            </p>
            <p className="mt-1 text-base font-medium text-navy">
              {item.productName}
            </p>
            <p className="mt-0.5 text-sm text-muted">{item.caseTitle}</p>
          </div>
          {item.pipelineStatus ? (
            <PipelineStatusBadge
              status={item.pipelineStatus}
              locale={locale}
            />
          ) : null}
        </div>

        <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <div className="grid gap-1 sm:grid-cols-[5.5rem_1fr]">
            <dt className="text-muted">{t.counterpart}</dt>
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
            <dt className="text-muted">{t.product}</dt>
            <dd>
              <Link href={caseHref} className="text-teal hover:underline">
                {t.openProduct}
              </Link>
              <span className="mx-2 text-muted">·</span>
              <span className="text-muted">
                {en
                  ? enCategoryLabel(item.caseCategory)
                  : item.caseCategory}
                {item.caseRegion
                  ? ` / ${
                      en
                        ? ({
                            全国: "Japan (nationwide)",
                            特定地域: "Specific regions in Japan",
                            オンライン中心: "Online-focused",
                          }[item.caseRegion] ?? item.caseRegion)
                        : item.caseRegion
                    }`
                  : ""}
              </span>
            </dd>
          </div>
        </dl>
      </header>

      {canEditPipeline ? (
        <section className="mt-6 rounded-lg border border-border bg-surface p-5">
          <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
            {t.pipelineTitle}
          </h2>
          <p className="mt-2 text-sm text-muted">{t.pipelineHint}</p>
          <label className="mt-4 flex flex-col gap-1.5 text-sm sm:max-w-xs">
            <span className="font-medium text-navy">{t.status}</span>
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
                  {en ? pipelineStatusLabelsEn[s] : pipelineStatusLabels[s]}
                </option>
              ))}
            </select>
          </label>
          {item.hasDeal ? (
            <p className="mt-3 text-sm text-teal">
              {t.hasDeal}{" "}
              <Link href={dealsHref} className="underline">
                {t.dealsLink}
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {isClosed ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {t.closedNotice}
        </p>
      ) : null}

      <MessageThread
        negotiationId={item.id}
        messages={canReply ? messages : []}
        initialMessage={item.initialMessage}
        initialFrom={item.partnerCompanyName}
        initialAt={item.createdAt}
        canReply={canReply}
        locale={locale}
      />
    </article>
  );
}
