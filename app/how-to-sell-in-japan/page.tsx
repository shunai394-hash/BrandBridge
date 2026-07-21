import type { Metadata } from "next";
import { HowToSellInJapan } from "@/components/guides/HowToSellInJapan";

export const metadata: Metadata = {
  title: "日本で販売する方法 | USA → 日本 輸入ガイド",
  description:
    "海外メーカーがBrandBridgeで日本販売を始める流れを解説。商品登録、パートナー発見、交渉、出荷、支払い、輸入の基礎まで約5分でわかります。",
};

export default function JapaneseHowToSellInJapanPage() {
  return <HowToSellInJapan locale="ja" />;
}
