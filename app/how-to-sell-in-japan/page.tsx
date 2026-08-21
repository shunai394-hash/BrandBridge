import type { Metadata } from "next";
import { HowToSellInJapan } from "@/components/guides/HowToSellInJapan";
import { HOW_TO_SELL_JA_FAQS } from "@/lib/guides/how-to-sell-ja-faq";
import { pairedLanguageAlternates } from "@/lib/hreflang";
import { jsonLdString } from "@/lib/seo-jsonld";
import { getSiteUrl } from "@/lib/site";

const TITLE = "海外ブランドが日本で販売する方法｜代理店・卸・小売・EC";
const DESCRIPTION =
  "海外ブランドが日本で販売するときのチャネルの選び方、販売パートナーの探し方、MOQ・卸価格・独占・輸入・契約の実務。日本の卸・小売・ECと商談する前に確認する点をまとめています。";
const PATH = "/how-to-sell-in-japan";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...pairedLanguageAlternates(PATH, "/en/how-to-sell-in-japan", "ja"),
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    locale: "ja_JP",
    type: "website",
  },
};

export default function JapaneseHowToSellInJapanPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "日本で販売する方法",
        item: `${siteUrl}${PATH}`,
      },
    ],
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOW_TO_SELL_JA_FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd) }}
      />
      <HowToSellInJapan locale="ja" />
    </>
  );
}
