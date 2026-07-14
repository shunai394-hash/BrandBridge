import Link from "next/link";
import { FavoriteButton } from "@/components/cases/FavoriteButton";
import { ProductCaseImage } from "@/components/cases/ProductCaseImage";
import { Button } from "@/components/ui/Button";
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[8rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm leading-relaxed text-navy">
        {value}
      </dd>
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
  const negotiateHref = `/cases/${caseItem.id}/negotiation`;
  const canStartNegotiation =
    caseItem.reviewStatus === "approved" && caseItem.status === "open";

  const ingredients =
    caseItem.productFeatures?.trim() || "成分情報はまだ登録されていません。";
  const description =
    caseItem.description?.trim() || "商品説明はまだ登録されていません。";

  const salesTermsLines = [
    `販売形式: ${salesFormatLabel(caseItem.salesFormat)}`,
    `独占可否: ${caseItem.isExclusive ? "独占可" : "非独占（複数パートナー可）"}`,
    caseItem.salesTerms?.trim()
      ? `取引条件:\n${caseItem.salesTerms.trim()}`
      : null,
    caseItem.minOrder?.trim()
      ? `最小発注・初期ロット: ${caseItem.minOrder.trim()}`
      : null,
    caseItem.offer?.trim() ? `メーカー提供条件:\n${caseItem.offer.trim()}` : null,
    caseItem.partnerChannels?.trim()
      ? `希望チャネル: ${caseItem.partnerChannels.trim()}`
      : null,
    caseItem.partnerRequirements?.trim()
      ? `必須実績・体制:\n${caseItem.partnerRequirements.trim()}`
      : null,
    caseItem.idealPartner?.trim()
      ? `求めるパートナー像:\n${caseItem.idealPartner.trim()}`
      : null,
    caseItem.priceBand?.trim()
      ? `想定価格帯: ${caseItem.priceBand.trim()}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <article className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/cases" className="text-sm text-teal hover:underline">
          ← 案件一覧に戻る
        </Link>
        <FavoriteButton
          caseId={caseItem.id}
          initialFavorited={isFavorited}
          isLoggedIn={Boolean(user)}
        />
      </div>

      {showPendingBanner || caseItem.reviewStatus === "pending_review" ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          この案件は運営審査中です（{reviewStatusLabels[caseItem.reviewStatus]}
          ）。承認後に公開一覧へ表示されます。
        </div>
      ) : null}

      {caseItem.reviewStatus === "rejected" ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          この案件は不承認となりました。
          {caseItem.reviewNote ? ` 理由: ${caseItem.reviewNote}` : null}
        </div>
      ) : null}

      <p className="text-xs font-medium tracking-wide text-muted">案件番号</p>
      <p className="mt-1 font-mono text-lg font-medium text-teal">
        {caseItem.caseNumber}
      </p>

      <div className="mt-6">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted">
          商品画像
        </p>
        <ProductCaseImage
          src={caseItem.productImageUrl}
          alt={caseItem.productName}
          className="aspect-[4/3] h-auto w-full max-w-3xl md:aspect-[16/10]"
          imageClassName="object-cover"
        />
      </div>

      <dl className="mt-8">
        <InfoRow label="商品名" value={caseItem.productName} />
        <InfoRow label="カテゴリ" value={caseItem.category} />
        <InfoRow
          label="原産国"
          value={targetCountryLabel(caseItem.targetCountry)}
        />
        <InfoRow
          label="販売形式"
          value={salesFormatLabel(caseItem.salesFormat)}
        />
        <InfoRow label="商品説明" value={description} />
        <InfoRow label="成分情報" value={ingredients} />
        <InfoRow
          label="販売条件"
          value={salesTermsLines || "販売条件はまだ登録されていません。"}
        />
      </dl>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-8">
        {alreadyApplied ? (
          <Button href="/negotiations" variant="outline">
            交渉管理を開く
          </Button>
        ) : canStartNegotiation ? (
          <Button href={negotiateHref}>交渉する</Button>
        ) : (
          <p className="text-sm text-muted">
            この案件は現在交渉を受け付けていません。
          </p>
        )}
        <Button href="/cases" variant="ghost">
          一覧に戻る
        </Button>
      </div>
    </article>
  );
}
