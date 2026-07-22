import type { Metadata } from "next";
import { ProductShowcase } from "@/components/cases/ProductShowcase";
import { getJapaneseProductShowcaseSample } from "@/lib/product-showcase-sample";

export const metadata: Metadata = {
  title: "商品掲載サンプル | BrandBridge",
  description:
    "海外の商品提供企業が登録後の商品ページ完成イメージを確認できるサンプルです。商品画像・紹介動画・説明・特徴・取引条件を掲載しています。",
};

export default function JapaneseProductShowcasePage() {
  const sample = getJapaneseProductShowcaseSample();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <ProductShowcase caseItem={sample} locale="ja" />
    </div>
  );
}
