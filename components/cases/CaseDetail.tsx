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

  const description =
    caseItem.description?.trim() || "商品説明はまだ登録されていません。";
  const features = caseItem.productFeatures?.trim() || "";
  const hasImage = Boolean(caseItem.productImageUrl?.trim());

  return (
    <article className="animate-fade-up">
      {/* 最上部: 案件番号 */}
      <p className="font-mono text-sm font-medium tracking-wide text-teal md:text-base">
        {caseItem.caseNumber}
      </p>

      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
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

      {/* 表示順: 画像 → 商品情報 */}
      <header className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted">
            商品画像
          </p>
          <ProductCaseImage
            src={caseItem.productImageUrl}
            alt={caseItem.productName}
            size="detail"
          />
          {!hasImage ? (
            <p className="mt-1.5 text-xs text-muted">画像未登録</p>
          ) : null}
        </div>

        <dl>
          <InfoRow label="商品名" value={caseItem.productName} />
          <InfoRow label="カテゴリ" value={caseItem.category} />
          <InfoRow
            label="原産国"
            value={targetCountryLabel(caseItem.targetCountry)}
          />
        </dl>
      </header>

      <dl className="mt-2">
        {caseItem.summary?.trim() ? (
          <InfoRow label="一覧用サマリー" value={caseItem.summary.trim()} />
        ) : null}
        {features ? (
          <InfoRow label="差別化ポイント" value={features} />
        ) : null}
        <InfoRow label="商品説明" value={description} />
        <InfoRow
          label="販売形式"
          value={salesFormatLabel(caseItem.salesFormat)}
        />
        <InfoRow
          label="独占可否"
          value={
            caseItem.isExclusive ? "独占可" : "非独占（複数パートナー可）"
          }
        />
        {caseItem.minOrder?.trim() ? (
          <InfoRow label="最小発注数量" value={caseItem.minOrder.trim()} />
        ) : null}
        {caseItem.partnerChannels?.trim() ? (
          <InfoRow label="販売チャネル" value={caseItem.partnerChannels.trim()} />
        ) : null}
        {caseItem.salesTerms?.trim() ? (
          <InfoRow label="その他の取引条件" value={caseItem.salesTerms.trim()} />
        ) : null}
        {caseItem.priceBand?.trim() ? (
          <InfoRow label="想定価格帯" value={caseItem.priceBand.trim()} />
        ) : null}
        {caseItem.offer?.trim() ? (
          <InfoRow label="メーカー提供条件" value={caseItem.offer.trim()} />
        ) : null}
        {caseItem.partnerRequirements?.trim() ? (
          <InfoRow
            label="必須実績・体制"
            value={caseItem.partnerRequirements.trim()}
          />
        ) : null}
        {caseItem.idealPartner?.trim() ? (
          <InfoRow
            label="求めるパートナー像"
            value={caseItem.idealPartner.trim()}
          />
        ) : null}
      </dl>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-8">
        {canStartNegotiation ? (
          <>
            <Button href={negotiateHref}>
              {alreadyApplied ? "新しいテーマで交渉" : "交渉を開始"}
            </Button>
            {alreadyApplied ? (
              <Button href="/partner/negotiations" variant="outline">
                交渉一覧を開く
              </Button>
            ) : null}
          </>
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
