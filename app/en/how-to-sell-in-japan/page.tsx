import type { Metadata } from "next";
import { HowToSellInJapan } from "@/components/guides/HowToSellInJapan";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to Sell in Japan",
  description:
    "Learn how to sell in Japan and sell products to Japanese partners. Compare Japanese distributor, agent, retailer, and ecommerce models, then prepare MOQ, wholesale price, shipping, and exclusivity terms on BrandBridge.",
  alternates: {
    canonical: "/en/how-to-sell-in-japan",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need a company in Japan to sell products there?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Many overseas brands sell in Japan through a Japanese sales partner without opening a local entity.",
      },
    },
    {
      "@type": "Question",
      name: "Can I ship directly from the USA or another overseas warehouse?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Brands often ship with major international carriers, and the Japanese partner receives goods for local distribution.",
      },
    },
    {
      "@type": "Question",
      name: "Who usually handles customs and import procedures?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In many cases, your Japanese sales partner handles import procedures. Confirm responsibility and Incoterms before the first shipment. Requirements vary by product and category.",
      },
    },
    {
      "@type": "Question",
      name: "Do I always need a Japanese distributor?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not always. A distributor fits many brands, but a sales agent, retailer, or ecommerce partner may be better depending on inventory needs, channel goals, and how you want to test the market.",
      },
    },
    {
      "@type": "Question",
      name: "What commercial terms should I prepare before selling to Japan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Prepare wholesale price, MOQ, shipping conditions, Incoterms, exclusivity options, and payment terms so Japanese partners can evaluate fit quickly.",
      },
    },
    {
      "@type": "Question",
      name: "How do I get started on BrandBridge?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Create your BrandBridge account, publish a product listing with clear terms, and Japanese partners can inquire when they see a fit.",
      },
    },
    {
      "@type": "Question",
      name: "Does BrandBridge import or purchase products?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. BrandBridge connects overseas brands with Japanese sales partners. Business agreements are made directly between both companies.",
      },
    },
  ],
};

export default function EnglishHowToSellInJapanPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/en`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "How to Sell in Japan",
        item: `${siteUrl}/en/how-to-sell-in-japan`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HowToSellInJapan locale="en" />
    </>
  );
}
