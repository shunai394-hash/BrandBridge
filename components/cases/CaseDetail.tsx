import type { ReactNode } from "react";
import Link from "next/link";
import { CaseImageGallery } from "@/components/cases/CaseImageGallery";
import { ProductVideo } from "@/components/cases/ProductVideo";
import { FavoriteButton } from "@/components/cases/FavoriteButton";
import { WholesalePriceRange } from "@/components/cases/WholesalePriceRange";
import { Button } from "@/components/ui/Button";
import {
  displayExclusiveDealOption,
  displayOptionalText,
  displaySampleDealLabel,
  displayTrademarkStatus,
} from "@/lib/case-detail-display";
import { casePublicStatusLabel } from "@/lib/case-display";
import { canViewMakerCompanyName } from "@/lib/case-company-visibility";
import { canViewPartnerPricing } from "@/lib/case-pricing-access";
import {
  displayAvailability,
  displayMoqJa,
  displayPriceCondition,
} from "@/lib/price-display";
import type { Case, SessionUser } from "@/lib/types";
import { reviewStatusLabels, salesFormatLabel, targetCountryLabel } from "@/lib/types";
import {
  getJaCategoryByCaseCategory,
  jaCategoryCasesHref,
  jaCategoryPath,
} from "@/lib/ja-categories";
import {
  caseBuyerOverview,
  caseDetailFaqs,
  relatedJaBlogLinks,
  relatedJaCategoryLinks,
} from "@/lib/case-detail-seo";

type CaseDetailProps = {
  caseItem: Case;
  user: SessionUser | null;
  alreadyApplied: boolean;
  isFavorited: boolean;
  showPendingBanner?: boolean;
  showPartnerPricing: boolean;
};

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm leading-relaxed text-navy">
        {value}
      </dd>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-display-jp text-xl text-navy">
        {title}
      </h2>
      <dl className="mt-2">{children}</dl>
    </section>
  );
}

export function CaseDetailView({
  caseItem,
  user,
  alreadyApplied,
  isFavorited,
  showPendingBanner = false,
  showPartnerPricing,
}: CaseDetailProps) {
  const negotiateHref = `/cases/${caseItem.id}/negotiation`;
  const jaCategory = getJaCategoryByCaseCategory(caseItem.category);

  const canStartNegotiation =
    caseItem.reviewStatus === "approved" && caseItem.status === "open";

  // 1ユーザーが「商品提供企業」と「販売パートナー」の両方になれる設計。
  // 交渉開始権限は role ではなく isPartner で判定する。
  const isPartner = user?.isPartner === true;

  // Defense in depth: never show if server redacted / unauthorized
  const partnerUnlocked =
    showPartnerPricing && canViewPartnerPricing(caseItem, user);

  const showCompanyName = canViewMakerCompanyName(user, alreadyApplied);
  const brandName = caseItem.brandName?.trim() || "";
  const faqs = caseDetailFaqs(caseItem);
  const categoryLinks = relatedJaCategoryLinks(caseItem.category);
  const blogLinks = relatedJaBlogLinks(caseItem.category);
  const overview = caseBuyerOverview(caseItem);
  const description = caseItem.description?.trim() || "";
  const summary = caseItem.summary?.trim();
  const showSummary = Boolean(summary && summary !== description);
  const origin = caseItem.shipFrom?.trim();

  return (
    <article className="animate-fade-up" lang="ja">
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <FavoriteButton
          caseId={caseItem.id}
          initialFavorited={isFavorited}
          isLoggedIn={Boolean(user)}
        />
      </div>

      {showPendingBanner || caseItem.reviewStatus === "pending_review" ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          この商品は現在審査中です。
          {reviewStatusLabels[caseItem.reviewStatus]}
          審査完了後に公開・閲覧されます。
        </div>
      ) : null}

      {caseItem.reviewStatus === "rejected" ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          この商品は審査で非承認となりました。
          {caseItem.reviewNote
            ? ` 理由: ${caseItem.reviewNote}`
            : null}
        </div>
      ) : null}

      <header className="space-y-5">
        <CaseImageGallery
          images={caseItem.images}
          productImageUrl={caseItem.productImageUrl}
          alt={caseItem.productName}
        />

        {brandName ? (
          <p className="text-sm font-medium tracking-wide text-teal">
            {brandName}
          </p>
        ) : null}

        <h1 className="font-display-jp text-3xl text-navy md:text-4xl">
          {caseItem.productName}
        </h1>

        <dl>
          <InfoRow
            label="カテゴリ"
            value={
              jaCategory ? (
                <span>
                  <Link
                    href={jaCategoryPath(jaCategory.slug)}
                    className="text-teal hover:underline"
                  >
                    {caseItem.category}
                  </Link>
                  <span className="text-border" aria-hidden>
                    {" / "}
                  </span>
                  <Link
                    href={jaCategoryCasesHref(jaCategory.caseCategory)}
                    className="text-teal hover:underline"
                  >
                    {jaCategory.label}の商品一覧
                  </Link>
                </span>
              ) : (
                caseItem.category
              )
            }
          />

          {caseItem.sku?.trim() ? (
            <InfoRow label="商品コード（SKU）" value={caseItem.sku.trim()} />
          ) : null}

          <InfoRow
            label="販売形式"
            value={salesFormatLabel(caseItem.salesFormat)}
          />

          <InfoRow
            label="卸売価格帯"
            value={
              <WholesalePriceRange
                priceBand={caseItem.priceBand}
                locale="ja"
              />
            }
          />

          <InfoRow
            label="MOQ・最低注文数量"
            value={displayMoqJa(caseItem.minOrder)}
          />

          {origin ? (
            <InfoRow label="原産国・出荷元" value={origin} />
          ) : null}

          <InfoRow
            label="独占販売可否"
            value={displayExclusiveDealOption(caseItem.exclusiveDealOption)}
          />

          {showCompanyName ? (
            <InfoRow
              label="会社名"
              value={caseItem.makerName?.trim() || "未設定"}
            />
          ) : null}
        </dl>
      </header>

      <section className="mt-8">
        <h2 className="font-display-jp text-xl text-navy">
          仕入れを検討するときに見ること
        </h2>
        <div className="mt-3 space-y-4 text-sm leading-relaxed text-muted md:text-base">
          {overview.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <ProductVideo
        url={caseItem.productVideoUrl}
        locale="ja"
        poster={caseItem.productImageUrl}
      />

      <section className="mt-8">
        <h2 className="font-display-jp text-xl text-navy">
          商品説明
        </h2>

        {showSummary ? (
          <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
            {summary}
          </p>
        ) : null}

        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-navy">
          {description || "商品説明はまだ登録されていません。"}
        </p>

        {caseItem.productFeatures?.trim() ? (
          <>
            <h3 className="mt-6 text-sm font-medium text-muted">
              商品の特徴
            </h3>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-navy">
              {caseItem.productFeatures.trim()}
            </p>
          </>
        ) : null}
      </section>

      <DetailSection title="ブランド情報">
        <InfoRow
          label="ブランド名"
          value={displayOptionalText(caseItem.brandName)}
        />

        <InfoRow
          label="ブランド概要"
          value={displayOptionalText(caseItem.brandOverview)}
        />

        <InfoRow
          label="商品の強み"
          value={displayOptionalText(caseItem.productStrengths)}
        />
      </DetailSection>

      <DetailSection title="販売情報">
        <InfoRow
          label="既存販売実績"
          value={displayOptionalText(caseItem.salesTrackRecord)}
        />

        <InfoRow
          label="日本・米国の販売可否"
          value={displayOptionalText(caseItem.marketAvailabilityJpUs)}
        />

        <InfoRow
          label="想定小売価格"
          value={displayOptionalText(caseItem.suggestedRetailPrice)}
        />

        <InfoRow
          label="リードタイム"
          value={displayOptionalText(caseItem.leadTime)}
        />
      </DetailSection>

      <DetailSection title="取引条件">
        <InfoRow
          label="初回発注条件"
          value={displayOptionalText(caseItem.initialOrderTerms)}
        />

        <InfoRow
          label="卸売価格帯"
          value={
            <WholesalePriceRange
              priceBand={caseItem.priceBand}
              locale="ja"
            />
          }
        />

        <InfoRow
          label="MOQ・最低注文数量"
            value={displayMoqJa(caseItem.minOrder)}
        />

        <InfoRow
          label="販売条件"
          value={displayOptionalText(caseItem.salesTerms)}
        />

        <InfoRow
          label="サンプル提供可否"
          value={displaySampleDealLabel(caseItem.sampleAvailable)}
        />
      </DetailSection>

      <DetailSection title="商標・知的財産情報">
        <InfoRow
          label="商品・ブランドライセンス情報"
          value={displayTrademarkStatus(caseItem.trademarkStatus)}
        />

        <InfoRow
          label="独占販売可否"
          value={displayExclusiveDealOption(caseItem.exclusiveDealOption)}
        />
      </DetailSection>

      <DetailSection title="輸入・出荷条件">
        <InfoRow
          label="原産国・出荷元"
          value={displayOptionalText(caseItem.shipFrom)}
        />

        <InfoRow
          label="ターゲット市場"
          value={targetCountryLabel(caseItem.targetCountry)}
        />

        <InfoRow
          label="対応通貨"
          value={displayOptionalText(caseItem.currencies)}
        />

        <InfoRow
          label="取引条件（Incoterms）"
          value={displayOptionalText(caseItem.incoterms)}
        />

        <InfoRow
          label="必要認証"
          value={displayOptionalText(caseItem.certifications)}
        />

        <InfoRow
          label="対応言語"
          value={displayOptionalText(caseItem.supportLanguages)}
        />
      </DetailSection>

      {partnerUnlocked ? (
        <section className="mt-8">
          <h2 className="font-display-jp text-xl text-navy">
            取引条件（ログイン限定）
          </h2>

          <dl className="mt-2">
            <InfoRow
              label="正確な卸売価格"
              value={
                caseItem.wholesalePrice?.trim() ||
                "詳細な取引条件あり"
              }
            />

            <InfoRow
              label="ロット別価格"
              value={caseItem.lotPricing?.trim() || "未設定"}
            />

            <InfoRow
              label="最低発注数量"
              value={
                caseItem.minOrderAmount?.trim() ||
                "要問い合わせ"
              }
            />

            <InfoRow
              label="希望小売価格"
              value={
                caseItem.suggestedRetailPrice?.trim() ||
                "未設定"
              }
            />

            <InfoRow
              label="価格条件"
              value={displayPriceCondition(caseItem.priceConditions)}
            />

            <InfoRow
              label="サンプル提供可否"
              value={displayAvailability(caseItem.sampleAvailable)}
            />

            <InfoRow
              label="テスト販売可否"
              value={displayAvailability(caseItem.testSaleAvailable)}
            />

            <InfoRow
              label="独占販売可否"
              value={
                caseItem.isExclusive
                  ? "独占販売の相談可能"
                  : "非独占・複数パートナー可能"
              }
            />

            <InfoRow
              label="対象国"
              value={targetCountryLabel(caseItem.targetCountry)}
            />

            {caseItem.partnerChannels?.trim() ? (
              <InfoRow
                label="対応チャネル"
                value={caseItem.partnerChannels.trim()}
              />
            ) : null}

            <InfoRow
              label="状態"
              value={casePublicStatusLabel({
                status: caseItem.status,
                reviewStatus: caseItem.reviewStatus,
                hasDeal: caseItem.hasDeal,
              })}
            />
          </dl>
        </section>
      ) : (
        <div className="mt-8 rounded-lg border border-border bg-cream/50 px-4 py-5 text-sm text-muted">
          <p className="font-medium text-navy">
            詳細な卸売価格・取引条件
          </p>

          <p className="mt-2">
            正確な卸売価格・ロット別価格・発注条件などは、
            販売パートナーとしてログイン後に確認できます。
          </p>

          {!user ? (
            <p className="mt-3">
              <Button
                href={`/login?next=/cases/${caseItem.id}`}
                prefetch={false}
              >
                ログインして詳細を見る
              </Button>
            </p>
          ) : !isPartner ? (
            <p className="mt-2 text-xs">
              販売パートナー登録を完了すると詳細な取引条件を確認できます。
            </p>
          ) : null}
        </div>
      )}

      {faqs.length > 0 ? (
        <section className="mt-10 border-t border-border pt-8">
          <h2 className="font-display-jp text-xl text-navy">よくある質問</h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((item) => (
              <div key={item.q} className="border-b border-border pb-6 last:border-b-0 last:pb-0">
                <dt className="font-medium text-navy">Q：{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">
                  A：{item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {categoryLinks.length > 0 ? (
        <section className="mt-10 border-t border-border pt-8">
          <h2 className="font-display-jp text-xl text-navy">関連カテゴリー</h2>
          <ul className="mt-4 space-y-2.5">
            {categoryLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-teal hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {blogLinks.length > 0 ? (
        <section className="mt-10 border-t border-border pt-8">
          <h2 className="font-display-jp text-xl text-navy">
            関連する日本語ガイド
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            仕入れ条件や注意点は、商品詳細とあわせて次のガイドも参照できます。
          </p>
          <ul className="mt-4 space-y-2.5">
            {blogLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-teal hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-8">
        {partnerUnlocked && isPartner && canStartNegotiation ? (
          <>
            <Button href={negotiateHref}>
              {alreadyApplied
                ? "新しいメッセージで交渉"
                : "商品について交渉・問い合わせ"}
            </Button>

            {alreadyApplied ? (
              <Button
                href="/partner/negotiations"
                variant="outline"
              >
                交渉一覧を開く
              </Button>
            ) : null}
          </>
        ) : canStartNegotiation && !user ? (
          <Button
            href={`/login?next=${encodeURIComponent(negotiateHref)}`}
          >
            ログインして交渉・問い合わせ
          </Button>
        ) : canStartNegotiation && user && !isPartner ? (
          <p className="text-sm text-muted">
            販売パートナーとして登録すると交渉・問い合わせができます。
          </p>
        ) : (
          <p className="text-sm text-muted">
            この商品は現在、交渉を受け付けていません。
          </p>
        )}

        <Button href="/cases" variant="ghost">
          商品一覧に戻る
        </Button>
        {jaCategory ? (
          <Button href={jaCategoryPath(jaCategory.slug)} variant="ghost">
            {jaCategory.label}のカテゴリー
          </Button>
        ) : null}
        <Button href="/contact" variant="outline">
          お問い合わせ
        </Button>
      </div>
    </article>
  );
}

