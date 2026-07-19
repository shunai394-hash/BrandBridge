import { CaseImageGallery } from "@/components/cases/CaseImageGallery";
import { FavoriteButton } from "@/components/cases/FavoriteButton";
import { Button } from "@/components/ui/Button";
import { casePublicStatusLabel } from "@/lib/case-display";
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

  const descriptionParts = [
    caseItem.description?.trim() || "",
    caseItem.productFeatures?.trim() || "",
  ].filter(Boolean);
  const description =
    descriptionParts.join("\n\n") || "商品説明はまだ登録されていません。";

  return (
    <article className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <a href="/cases" className="text-sm text-teal hover:underline">
          ← 商品一覧に戻る
        </a>
        <FavoriteButton
          caseId={caseItem.id}
          initialFavorited={isFavorited}
          isLoggedIn={Boolean(user)}
        />
      </div>

      {showPendingBanner || caseItem.reviewStatus === "pending_review" ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          この商品は運営審査中です（{reviewStatusLabels[caseItem.reviewStatus]}
          ）。承認後に公開一覧へ表示されます。
        </div>
      ) : null}

      {caseItem.reviewStatus === "rejected" ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          この商品は不承認となりました。
          {caseItem.reviewNote ? ` 理由: ${caseItem.reviewNote}` : null}
        </div>
      ) : null}

      {/* 表示順: 画像ギャラリー → 商品名 / SKU / 説明 */}
      <header className="space-y-5">
        <CaseImageGallery
          images={caseItem.images}
          productImageUrl={caseItem.productImageUrl}
          alt={caseItem.productName}
        />

        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          {caseItem.productName}
        </h1>

        <dl>
          <InfoRow
            label="商品コード（SKU）"
            value={caseItem.sku?.trim() || "—"}
          />
          <InfoRow label="カテゴリ" value={caseItem.category} />
          <InfoRow
            label="原産国"
            value={targetCountryLabel(caseItem.targetCountry)}
          />
          <InfoRow
            label="販売形式"
            value={salesFormatLabel(caseItem.salesFormat)}
          />
          <InfoRow
            label="状態"
            value={casePublicStatusLabel({
              status: caseItem.status,
              reviewStatus: caseItem.reviewStatus,
              hasDeal: caseItem.hasDeal,
            })}
          />
        </dl>
      </header>

      <dl className="mt-2">
        {caseItem.summary?.trim() ? (
          <InfoRow label="一覧用サマリー" value={caseItem.summary.trim()} />
        ) : null}
        <InfoRow label="商品説明" value={description} />
        <InfoRow
          label="応募件数"
          value={`${caseItem.applicationCount ?? 0}件`}
        />
        <InfoRow
          label="交渉中"
          value={`${caseItem.negotiationCount ?? 0}件`}
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
          <InfoRow label="商品提供企業の提供条件" value={caseItem.offer.trim()} />
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
            この商品は現在交渉を受け付けていません。
          </p>
        )}
        <Button href="/cases" variant="ghost">
          商品一覧に戻る
        </Button>
      </div>
    </article>
  );
}
