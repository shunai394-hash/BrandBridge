import type { ReactNode } from "react";
import Link from "next/link";
import { FavoriteButton } from "@/components/cases/FavoriteButton";
import { NegotiationForm } from "@/components/forms/NegotiationForm";
import type { Case, SessionUser } from "@/lib/types";
import {
  reviewStatusLabels,
  salesFormatLabel,
  targetCountryLabel,
} from "@/lib/types";

type CaseDetailProps = {
  caseItem: Case;
  user: SessionUser | null;
  alreadyApplied: boolean;
  isFavorited: boolean;
  showPendingBanner?: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-foreground/90">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  );
}

export function CaseDetailView({
  caseItem,
  user,
  alreadyApplied,
  isFavorited,
  showPendingBanner = false,
}: CaseDetailProps) {
  const trustBits = [
    caseItem.makerIndustry,
    caseItem.makerHeadquarters,
    caseItem.makerFoundedYear ? `設立 ${caseItem.makerFoundedYear}年` : null,
  ].filter(Boolean);

  return (
    <article className="animate-fade-up">
      <div className="mb-6">
        <Link href="/cases" className="text-sm text-teal hover:underline">
          ← 案件一覧に戻る
        </Link>
      </div>

      {showPendingBanner || caseItem.reviewStatus === "pending_review" ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          この案件は運営審査中です（{reviewStatusLabels[caseItem.reviewStatus]}
          ）。承認後に公開一覧へ表示されます。
        </div>
      ) : null}

      {caseItem.reviewStatus === "rejected" ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          この案件は却下されました。
          {caseItem.reviewNote ? ` 理由: ${caseItem.reviewNote}` : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded bg-cream px-2.5 py-1 text-navy">
            {caseItem.category}
          </span>
          <span className="rounded bg-cream px-2.5 py-1 text-navy">
            {targetCountryLabel(caseItem.targetCountry)}
          </span>
          <span className="rounded bg-cream px-2.5 py-1 text-navy">
            {salesFormatLabel(caseItem.salesFormat)}
          </span>
          {caseItem.isExclusive ? (
            <span className="rounded border border-teal/30 bg-teal/10 px-2.5 py-1 text-teal-dark">
              独占可
            </span>
          ) : (
            <span className="rounded bg-cream px-2.5 py-1 text-navy">非独占</span>
          )}
          <span className="rounded bg-cream px-2.5 py-1 text-navy">
            エリア: {caseItem.region}
          </span>
        </div>
        <FavoriteButton
          caseId={caseItem.id}
          initialFavorited={isFavorited}
          isLoggedIn={Boolean(user)}
        />
      </div>

      <h1 className="mt-4 font-[family-name:var(--font-shippori)] text-3xl leading-tight text-navy md:text-4xl">
        {caseItem.title}
      </h1>
      <p className="mt-2 text-muted">{caseItem.productName}</p>

      {caseItem.productImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={caseItem.productImageUrl}
          alt={caseItem.productName}
          className="mt-5 max-h-80 w-full rounded-lg border border-border object-cover"
        />
      ) : null}

      <div className="mt-4 rounded-lg border border-border bg-surface p-4">
        <p className="text-xs font-medium text-muted">掲載メーカー</p>
        <Link
          href={`/profiles/${caseItem.makerId}`}
          className="mt-1 inline-block text-lg font-medium text-navy hover:text-teal hover:underline"
        >
          {caseItem.makerName}
        </Link>
        {trustBits.length > 0 ? (
          <p className="mt-1 text-sm text-muted">{trustBits.join(" ・ ")}</p>
        ) : null}
        <p className="mt-2 text-xs text-muted">
          掲載日 {formatDate(caseItem.createdAt)}
        </p>
      </div>

      <section className="mt-10 space-y-8 border-t border-border pt-8">
        <DetailBlock title="商品情報">
          <Field label="商品・ブランド名" value={caseItem.productName} />
          <Field label="特徴・差別化" value={caseItem.productFeatures} />
          <Field label="想定価格帯" value={caseItem.priceBand} />
          <Field label="案件概要" value={caseItem.description} />
        </DetailBlock>

        <DetailBlock title="販売条件">
          <Field
            label="販売形式"
            value={salesFormatLabel(caseItem.salesFormat)}
          />
          <Field
            label="独占可否"
            value={caseItem.isExclusive ? "独占可" : "非独占（複数パートナー可）"}
          />
          <Field label="取引条件" value={caseItem.salesTerms} />
          <Field label="最小発注・初期ロット" value={caseItem.minOrder} />
          <Field label="メーカー提供条件" value={caseItem.offer} />
        </DetailBlock>

        <DetailBlock title="希望パートナー条件">
          <Field label="希望チャネル" value={caseItem.partnerChannels} />
          <Field label="必須実績・体制" value={caseItem.partnerRequirements} />
          <Field label="求めるパートナー像" value={caseItem.idealPartner} />
        </DetailBlock>
      </section>

      <NegotiationForm
        caseId={caseItem.id}
        user={user}
        alreadyApplied={alreadyApplied}
      />
    </article>
  );
}
