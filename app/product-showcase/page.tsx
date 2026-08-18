import type { Metadata } from "next";
import { DummyCatalogShowcase } from "@/components/cases/DummyCatalogShowcase";
import { ProductShowcase } from "@/components/cases/ProductShowcase";
import { getJapaneseProductShowcaseSample } from "@/lib/product-showcase-sample";
import { pairedLanguageAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "商品掲載サンプル",
  description:
    "商品画像・紹介動画・説明・取引条件が載った、海外ブランド向けの商品ページ完成イメージです。",
  ...pairedLanguageAlternates(
    "/product-showcase",
    "/en/product-showcase",
    "ja",
  ),
};

export const dynamic = "force-dynamic";

export default function JapaneseProductShowcasePage() {
  const sample = getJapaneseProductShowcaseSample();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <ProductShowcase caseItem={sample} locale="ja" />
      <DummyCatalogShowcase locale="ja" />
    </div>
  );
}

