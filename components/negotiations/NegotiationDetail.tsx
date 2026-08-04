"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  updatePipelineStatusAction,
  upsertNegotiationTermsAction,
  confirmNegotiationTermsAction,
} from "@/lib/actions";
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
  NegotiationTerms,
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
  terms: NegotiationTerms | null;
  /** Default Japanese 窶・Japanese routes unchanged. */
  locale?: NegotiationUiLocale;
};

export function NegotiationDetail({
  item,
  user,
  messages,
  terms,
  locale = "ja",
}: NegotiationDetailProps) {
  const router = useRouter();
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [termsLoading, setTermsLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [termsSavedMessage, setTermsSavedMessage] = useState("");

  const [salesRegion, setSalesRegion] = useState(
    terms?.salesRegion ?? "",
  );
  const [salesChannel, setSalesChannel] = useState(
    terms?.salesChannel ?? "",
  );
  const [wholesalePrice, setWholesalePrice] = useState(
    terms?.wholesalePrice?.toString() ?? "",
  );
  const [moq, setMoq] = useState(
    terms?.moq?.toString() ?? "",
  );
  const [leadTime, setLeadTime] = useState(
    terms?.leadTime ?? "",
  );
  const [paymentTerms, setPaymentTerms] = useState(
    terms?.paymentTerms ?? "",
  );
  const [exclusiveSales, setExclusiveSales] = useState(
    terms?.exclusiveSales ?? false,
  );
  const [notes, setNotes] = useState(
    terms?.notes ?? "",
  );
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

  async function handleSaveTerms(
    status: "draft" | "submitted",
  ) {
    console.log("[HANDLE SAVE TERMS]", status);
    setTermsError("");
    setTermsSavedMessage("");
    setTermsLoading(true);

    const result = await upsertNegotiationTermsAction({
      negotiationId: item.id,
      salesRegion,
      salesChannel,
      wholesalePrice: wholesalePrice
        ? Number(wholesalePrice)
        : null,
      moq: moq
        ? Number(moq)
        : null,
      leadTime,
      paymentTerms,
      exclusiveSales,
      notes,
      status,
    });

    setTermsLoading(false);

    if (result.error) {
      setTermsError(
        en ? toEnglishActionError(result.error) : result.error,
      );
      return;
    }

    setTermsSavedMessage(
      status === "draft"
        ? en
          ? "Draft saved successfully."
          : "下書きを保存しました。"
        : en
          ? "Terms have been presented to the other party."
          : "条件を相手に提示しました。",
    );

    router.refresh();
  }


  async function handleConfirmTerms() {
    setTermsError("");
    setTermsLoading(true);

    const result = await confirmNegotiationTermsAction({
      negotiationId: item.id,
    });

    setTermsLoading(false);

    if (result.error) {
      setTermsError(
        en ? toEnglishActionError(result.error) : result.error,
      );
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
              {t.sku} {item.productSku?.trim() || "-"}
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
              <span className="mx-2 text-muted">ﾂｷ</span>
              <span className="text-muted">
                {en
                  ? enCategoryLabel(item.caseCategory)
                  : item.caseCategory}
                {item.caseRegion
                  ? ` / ${
                      en
                        ? ({
                            蜈ｨ蝗ｽ: "Japan (nationwide)",
                            specific: "Specific regions in Japan",
                            online: "Online-focused",
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
              {pipelineStatusOptions
                .filter((s) =>
                  user.role === "admin"
                    ? true
                    : s !== "won" && s !== "closed"
                )
                .map((s) => (
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

      {!isClosed ? (
        <section className="mt-6 rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
                条件シート
              </h2>
              <p className="mt-1 text-sm text-muted">
                取引条件を入力し、相手に提示します。
              </p>
            </div>

            {terms ? (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                {terms.status === "draft"
                  ? "下書き"
                  : terms.status === "submitted"
                    ? "条件提示中"
                    : terms.status === "revision_requested"
                      ? "修正依頼"
                      : "合意済み"}
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-navy">販売地域</span>
              <input
                className="rounded-md border border-border px-3 py-2"
                value={salesRegion}
                onChange={(e) => setSalesRegion(e.target.value)}
                placeholder="例：日本全国"
                disabled={termsLoading}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-navy">販売チャネル</span>
              <input
                className="rounded-md border border-border px-3 py-2"
                value={salesChannel}
                onChange={(e) => setSalesChannel(e.target.value)}
                placeholder="例：EC・小売店"
                disabled={termsLoading}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-navy">卸価格</span>
              <input
                type="number"
                min="0"
                className="rounded-md border border-border px-3 py-2"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                placeholder="例：5000"
                disabled={termsLoading}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-navy">MOQ</span>
              <input
                type="number"
                min="0"
                className="rounded-md border border-border px-3 py-2"
                value={moq}
                onChange={(e) => setMoq(e.target.value)}
                placeholder="例：100"
                disabled={termsLoading}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-navy">リードタイム</span>
              <input
                className="rounded-md border border-border px-3 py-2"
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                placeholder="例：発注後30日"
                disabled={termsLoading}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-navy">支払条件</span>
              <input
                className="rounded-md border border-border px-3 py-2"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="例：月末締め翌月末払い"
                disabled={termsLoading}
              />
            </label>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={exclusiveSales}
              onChange={(e) => setExclusiveSales(e.target.checked)}
              disabled={termsLoading}
            />
            <span className="font-medium text-navy">
              独占販売を希望する
            </span>
          </label>

          <label className="mt-4 flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-navy">備考</span>
            <textarea
              className="min-h-24 rounded-md border border-border px-3 py-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="その他の取引条件や補足事項"
              disabled={termsLoading}
            />
          </label>

          {termsError ? (
            <p className="mt-4 text-sm text-red-600">
              {termsError}
            </p>
          ) : null}

          {termsSavedMessage ? (
            <p className="mt-4 text-sm text-teal">
              {termsSavedMessage}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-navy hover:bg-surface-muted disabled:opacity-50"
              disabled={termsLoading}
              onClick={() => { console.log("DRAFT CLICK"); handleSaveTerms("draft"); }}
            >
              {termsLoading ? "保存中..." : "下書き保存"}
            </button>

            <button
              type="button"
              className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              disabled={termsLoading}
              onClick={() => { console.log("SUBMITTED CLICK"); handleSaveTerms("submitted"); }}
            >
              {termsLoading ? "保存中..." : "条件を提示"}
            </button>
          </div>
{terms?.status === "submitted" &&
            ((user.role === "maker" && !terms.makerConfirmedAt) ||
              (user.role === "partner" && !terms.partnerConfirmedAt)) ? (
            <button
              type="button"
              className="mt-4 rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              disabled={termsLoading}
              onClick={handleConfirmTerms}
            >
              {termsLoading ? "確認中..." : "この条件で合意する"}
            </button>
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
        canReply={canReply}
        locale={locale}
      />
    </article>
  );
}






























