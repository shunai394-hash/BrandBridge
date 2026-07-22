import Link from "next/link";
import { CaseImageGallery } from "@/components/cases/CaseImageGallery";
import { ProductVideo } from "@/components/cases/ProductVideo";
import { Button } from "@/components/ui/Button";
import {
  displayExclusiveDealOption,
  displayOptionalText,
  displayTrademarkStatus,
} from "@/lib/case-detail-display";
import { displayMoq, displayPriceBand } from "@/lib/price-display";
import type { Case, SalesFormat, TargetCountry } from "@/lib/types";
import { salesFormatLabel, targetCountryLabel } from "@/lib/types";

type ProductShowcaseProps = {
  caseItem: Case;
  locale: "ja" | "en";
};

const SALES_FORMAT_EN: Record<SalesFormat, string> = {
  wholesale: "Wholesale",
  consignment: "Consignment",
  agency: "Agency",
  oem: "OEM / ODM",
  ec: "E-commerce",
  other: "Other",
};

const MARKET_EN: Record<TargetCountry, string> = {
  JP: "Japan",
  US: "United States",
  CN: "China",
  ASEAN: "ASEAN",
  EU: "Europe",
  GLOBAL: "Global",
  OTHER: "Other",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm leading-relaxed text-navy">
        {value}
      </dd>
    </div>
  );
}

const copy = {
  en: {
    eyebrow: "SAMPLE PRODUCT PAGE",
    banner:
      "This is a sample listing so overseas product suppliers can preview how a finished BrandBridge product page looks after registration.",
    backHome: "← Back to English home",
    metaName: "Product Name",
    company: "Company Name",
    origin: "Country of Origin",
    category: "Category",
    format: "Sales Format",
    moq: "MOQ",
    wholesale: "Wholesale Price Range",
    exclusive: "Exclusive Option",
    description: "Product Description",
    features: "Product features",
    brand: "Brand information",
    brandName: "Brand name",
    brandOverview: "Brand overview",
    strengths: "Product strengths",
    terms: "Deal terms",
    initialOrder: "Initial order terms",
    priceBand: "Reference wholesale band",
    trademark: "Trademark / license",
    exclusiveDeal: "Exclusive availability",
    shipping: "International terms",
    shipFrom: "Ship from",
    currencies: "Currencies",
    incoterms: "Incoterms",
    certifications: "Certifications",
    languages: "Support languages",
    ctaTitle: "Inquire with Japanese sales partners",
    ctaBody:
      "Ready to publish your own product? Register as a product supplier, or contact BrandBridge about partner matching in Japan.",
    ctaContact: "Contact BrandBridge",
    ctaRegister: "Register Your Product",
  },
  ja: {
    eyebrow: "商品掲載サンプル",
    banner:
      "これはサンプル商品ページです。海外の商品提供企業が、登録後の完成イメージを確認できます。",
    backHome: "← トップへ戻る",
    metaName: "商品名",
    company: "会社名",
    origin: "原産国",
    category: "カテゴリ",
    format: "販売形式",
    moq: "MOQ（最低発注数量）",
    wholesale: "参考卸価格帯",
    exclusive: "独占販売",
    description: "商品説明",
    features: "商品の特徴",
    brand: "ブランド情報",
    brandName: "ブランド名",
    brandOverview: "ブランド概要",
    strengths: "商品の強み",
    terms: "取引条件",
    initialOrder: "初回発注条件",
    priceBand: "参考卸価格帯",
    trademark: "商標・ライセンス",
    exclusiveDeal: "独占販売可否",
    shipping: "海外展開用情報",
    shipFrom: "出荷元",
    currencies: "対応通貨",
    incoterms: "取引条件（Incoterms）",
    certifications: "必要認証",
    languages: "対応言語",
    ctaTitle: "日本の販売パートナーへ問い合わせる",
    ctaBody:
      "自社商品も同じ形式で掲載できます。商品提供企業として登録するか、BrandBridgeまでお問い合わせください。",
    ctaContact: "お問い合わせ",
    ctaRegister: "商品提供企業として登録",
  },
} as const;

/**
 * Static product-page preview for sales outreach.
 * Reuses CaseDetail / EnCaseDetail visual building blocks without touching live cases.
 */
export function ProductShowcase({ caseItem, locale }: ProductShowcaseProps) {
  const t = copy[locale];
  const en = locale === "en";
  const homeHref = en ? "/en" : "/";
  const contactHref = en ? "/en/contact" : "/contact";
  const registerHref = en ? "/en/register/maker" : "/register/maker";

  const salesFormat = en
    ? SALES_FORMAT_EN[caseItem.salesFormat]
    : salesFormatLabel(caseItem.salesFormat);
  const origin = en
    ? caseItem.shipFrom?.trim() || MARKET_EN[caseItem.targetCountry]
    : caseItem.shipFrom?.trim() ||
      targetCountryLabel(caseItem.targetCountry);
  const exclusive = en
    ? caseItem.isExclusive
      ? "Exclusive available"
      : "Non-exclusive"
    : caseItem.isExclusive
      ? "独占可"
      : "非独占";

  return (
    <article className="animate-fade-up" lang={en ? "en" : "ja"}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={homeHref} className="text-sm text-teal hover:underline">
          {t.backHome}
        </Link>
        <p className="rounded-md border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-medium tracking-wide text-teal-dark">
          {t.eyebrow}
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        {t.banner}
      </div>

      <p className="text-xs font-medium tracking-wider text-teal">
        BrandBridge Product
      </p>

      <header className="mt-3 space-y-5">
        <CaseImageGallery
          images={caseItem.images}
          productImageUrl={caseItem.productImageUrl}
          alt={caseItem.productName}
          locale={locale}
        />

        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          {caseItem.productName}
        </h1>

        <dl>
          <InfoRow label={t.metaName} value={caseItem.productName} />
          <InfoRow label={t.company} value={caseItem.makerName} />
          <InfoRow label={t.origin} value={origin} />
          <InfoRow label={t.category} value={caseItem.category} />
          <InfoRow label={t.format} value={salesFormat} />
          <InfoRow label={t.moq} value={displayMoq(caseItem.minOrder)} />
          <InfoRow
            label={t.wholesale}
            value={
              en
                ? (caseItem.priceBand ?? "Quote required")
                    .replace(/以上/g, "+")
                    .replace(/〜/g, "–")
                : displayPriceBand(caseItem.priceBand)
            }
          />
          <InfoRow label={t.exclusive} value={exclusive} />
        </dl>
      </header>

      <ProductVideo url={caseItem.productVideoUrl} locale={locale} />

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          {t.description}
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-navy">
          {caseItem.description}
        </p>
      </section>

      {caseItem.productFeatures?.trim() ? (
        <section className="mt-8">
          <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
            {t.features}
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-navy">
            {caseItem.productFeatures}
          </p>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          {t.brand}
        </h2>
        <dl className="mt-2">
          <InfoRow
            label={t.brandName}
            value={displayOptionalText(caseItem.brandName)}
          />
          <InfoRow
            label={t.brandOverview}
            value={displayOptionalText(caseItem.brandOverview)}
          />
          <InfoRow
            label={t.strengths}
            value={displayOptionalText(caseItem.productStrengths)}
          />
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          {t.terms}
        </h2>
        <dl className="mt-2">
          <InfoRow
            label={t.initialOrder}
            value={displayOptionalText(caseItem.initialOrderTerms)}
          />
          <InfoRow
            label={t.priceBand}
            value={
              en
                ? caseItem.priceBand ?? "—"
                : displayPriceBand(caseItem.priceBand)
            }
          />
          <InfoRow label={t.moq} value={displayMoq(caseItem.minOrder)} />
          <InfoRow
            label={t.trademark}
            value={
              en
                ? "Registered"
                : displayTrademarkStatus(caseItem.trademarkStatus)
            }
          />
          <InfoRow
            label={t.exclusiveDeal}
            value={
              en
                ? "Available by territory (conditional)"
                : displayExclusiveDealOption(caseItem.exclusiveDealOption)
            }
          />
        </dl>
        {caseItem.offer?.trim() ? (
          <p className="mt-4 whitespace-pre-wrap rounded-lg border border-border bg-cream/40 px-4 py-3 text-sm leading-relaxed text-navy">
            {caseItem.offer.trim()}
          </p>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          {t.shipping}
        </h2>
        <dl className="mt-2">
          <InfoRow
            label={t.shipFrom}
            value={displayOptionalText(caseItem.shipFrom)}
          />
          <InfoRow
            label={t.currencies}
            value={displayOptionalText(caseItem.currencies)}
          />
          <InfoRow
            label={t.incoterms}
            value={displayOptionalText(caseItem.incoterms)}
          />
          <InfoRow
            label={t.certifications}
            value={displayOptionalText(caseItem.certifications)}
          />
          <InfoRow
            label={t.languages}
            value={displayOptionalText(caseItem.supportLanguages)}
          />
        </dl>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          {t.ctaTitle}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          {t.ctaBody}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href={contactHref}>{t.ctaContact}</Button>
          <Button href={registerHref} variant="outline">
            {t.ctaRegister}
          </Button>
        </div>
      </section>
    </article>
  );
}
