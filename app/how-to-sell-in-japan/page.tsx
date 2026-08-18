import type { Metadata } from "next";
import { HowToSellInJapan } from "@/components/guides/HowToSellInJapan";
import { pairedLanguageAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "日本で販売する方法",
  description:
    "海外メーカーが日本の販売パートナーと取引を始める流れを解説します。商品登録、条件の見せ方、商談、出荷の基礎をまとめています。",
  ...pairedLanguageAlternates(
    "/how-to-sell-in-japan",
    "/en/how-to-sell-in-japan",
    "ja",
  ),
};

export default function JapaneseHowToSellInJapanPage() {
  return <HowToSellInJapan locale="ja" />;
}

