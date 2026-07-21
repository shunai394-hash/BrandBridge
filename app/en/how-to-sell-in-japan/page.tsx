import type { Metadata } from "next";
import { HowToSellInJapan } from "@/components/guides/HowToSellInJapan";

export const metadata: Metadata = {
  title: "How to Sell in Japan | USA → Japan Import Guide",
  description:
    "Learn how overseas manufacturers sell in Japan with BrandBridge—from product registration and partner matching to shipping, payments, and import basics.",
};

export default function EnglishHowToSellInJapanPage() {
  return <HowToSellInJapan locale="en" />;
}
