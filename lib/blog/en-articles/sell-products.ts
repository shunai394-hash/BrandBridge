import type { EnBlogArticle } from "@/lib/blog/en-articles/types";
import {
  EN_BLOG_DISTRIBUTOR_VS_DIRECT,
  EN_BLOG_ENTER_JAPAN,
  EN_BLOG_FIND_DISTRIBUTOR,
  EN_BLOG_FIND_RETAILERS,
  EN_BLOG_HUB,
} from "@/lib/blog/en-articles/types";

const cta = {
  heading: "Start with a SKU Japanese partners can actually sell",
  body: "List the product, wholesale conditions, and first-order quantity so retailers and distributors in Japan can judge fit before they write.",
  primary: { href: "/en/register/maker", label: "List Your Brand" },
  secondary: { href: "/en/contact", label: "Contact BrandBridge" },
} as const;

const links = [
  { href: EN_BLOG_HUB.path, label: EN_BLOG_HUB.label },
  { href: "/en/japan-market-entry", label: "Japan Market Entry hub" },
  { href: "/en/how-to-sell-in-japan", label: "How to Sell in Japan" },
  { href: "/en/cases", label: "Japan expansion opportunities" },
  { href: "/en/register/maker", label: "List your brand" },
  { href: "/en/contact", label: "Contact" },
] as const;

export const SELL_PRODUCTS_ARTICLE: EnBlogArticle = {
  slug: "how-to-sell-products-in-japan",
  title: "How to Sell Products in Japan: A Guide for Foreign Brands",
  seoTitle: "How to Sell Products in Japan | Guide for Foreign Brands",
  description:
    "How to sell products in Japan as a foreign brand. Choose a selling model, pick a first SKU, set a Japan-ready price, test with a retail or e-commerce partner, then widen the channel.",
  eyebrow: "SELLING PRODUCTS IN JAPAN",
  lede: "Selling products in Japan is a channel and assortment decision: who sells, which SKU goes first, and how you will know the test worked.",
  intro: [
    "“Sell products in Japan” is a different question from “[enter the Japanese market](" +
      EN_BLOG_ENTER_JAPAN.path +
      ")” and from “[find a distributor](" +
      EN_BLOG_FIND_DISTRIBUTOR.path +
      ").” Entry is the sequence. A distributor is one partner type. Selling is how the product actually reaches a Japanese customer: through wholesale, a Japanese retail partner, e-commerce, or a mix.",
    "This guide is for overseas brands that already believe Japan is worth a trial and need a selling plan. It does not replace the complete market-entry walkthrough or the distributor search playbook. It focuses on models, first assortment, pricing for Japanese shelves, and a test you can read.",
  ],
  hero: {
    id: "shoppingStreet",
    alt: "A Japanese shopping street. Selling products in Japan starts with a channel you can explain",
  },
  sections: [
    {
      heading: "Choose how you will sell, not only who you will meet",
      paragraphs: [
        "Foreign brands often jump to a partner name before they choose a selling model. Japanese retail partners, distributors, and e-commerce operators evaluate different things. A specialty shop cares about story and pack. A wholesaler cares about case pack and reorder. An online partner cares about images, returns, and shipping size. Before choosing a distributor, you may also want to understand the [difference between using a Japanese distributor and selling directly](" +
          EN_BLOG_DISTRIBUTOR_VS_DIRECT.path +
          ").",
      ],
      cards: [
        {
          title: "Wholesale into retail",
          body: "A distributor or wholesaler supplies multiple stores. You sell in Japan by filling their existing accounts.",
        },
        {
          title: "Direct to a Japanese retail partner",
          body: "One banner or specialty group. Fewer accounts, more control over presentation, slower national reach.",
        },
        {
          title: "E-commerce first",
          body: "A Japanese online retailer or a brand shop run with a local operator. Useful for demand tests if the parcel economics work.",
        },
      ],
      callout:
        "Name one primary model for the first six months. Mixing all three on day one makes it hard to see which path paid for the freight.",
    },
    {
      heading: "Pick a first SKU Japanese buyers can stock",
      image: {
        id: "souvenirShop",
        alt: "Products on a Japanese shelf. First SKU choice drives whether a retail partner can say yes",
      },
      paragraphs: [
        "Selling products in Japan usually fails at assortment, not at brand fame. A full colorway or a 20-SKU food range can exceed what a first account will risk. Choose the SKU that is easiest to explain, easiest to store, and closest to a price band you already see on similar Japanese shelves.",
        "If two sizes exist, start with the one that survives import and still looks normal next to local competitors. Keep a second SKU in reserve for a reorder, not for the opening invoice.",
      ],
      bullets: [
        "One hero SKU plus at most a small supporting set",
        "Pack size that fits Japanese retail or parcel constraints",
        "Shelf life that still works after ocean or air freight",
        "A product page story that does not depend on in-store staff",
      ],
    },
    {
      heading: "Set a price a Japanese retail partner can defend",
      paragraphs: [
        "Japanese consumers see tax-included prices. Trade buyers think in remaining margin after their cost. If your wholesale idea was set only from a euro or dollar list, the Japan shelf price may land in a dead zone: too high for everyday, too low to look premium.",
        "Work backwards from a handful of real Japanese listings in your category, then subtract channel margin and a realistic landed cost. You do not need a perfect tariff calculation in this article. You do need to admit that selling products in Japan is a price-architecture problem, not only a translation problem.",
      ],
    },
    {
      heading: "Test demand before you scale the channel",
      paragraphs: [
        "A test can be a small wholesale drop, a pop-in with a specialty retailer, or a limited e-commerce assortment. Define the window and the signal: sell-through, repeat messages from the buyer, or a second order.",
        "Do not treat a quiet first month as proof that Japan is closed. It may mean the SKU, the season, or the channel was wrong. Change one variable at a time. The market-entry guide covers launch governance. Here the selling rule is simpler: a test without a metric is just a shipment.",
      ],
    },
    {
      heading: "Working with a Japanese retail partner",
      paragraphs: [
        "Retail buyers will ask how the product is used, who it sits next to, and what happens if it does not move. Have a photo of the pack, a suggested retail range, and a restock lead time. If you cannot replenish inside a season, say so. Japanese retail partners plan around that honesty.",
        "Department stores, drugstores, and independent specialty shops do not share one buying calendar. If your first partner is specialty, do not promise department-store coverage in the same sentence. Channel-specific retailer search is covered in [how to find Japanese retailers](" +
          EN_BLOG_FIND_RETAILERS.path +
          "). This page stays on how selling actually works once a partner is in talks.",
      ],
    },
    {
      heading: "How BrandBridge helps you sell in Japan",
      paragraphs: [
        "BrandBridge lets overseas brands list products with wholesale conditions that Japanese retail, wholesale, and e-commerce partners can read first. That supports selling products in Japan by making the commercial object visible, not by running stores or ads for you.",
        "Use registration to publish a listing. Use contact if you need a human answer before you publish. Review live opportunities to see how other brands present terms to Japanese partners.",
      ],
    },
  ],
  faqs: [
    {
      q: "Can I sell products in Japan without a distributor?",
      a: "Yes. Some foreign brands sell through a Japanese retail partner or an e-commerce operator. You still need a clear importer of record and a first SKU that can land at a workable cost.",
    },
    {
      q: "Is e-commerce enough to sell in Japan?",
      a: "It can be a valid test. It is rarely a full substitute for wholesale if you want physical retail. Parcel size, returns, and page content decide whether the test is readable.",
    },
    {
      q: "How many products should I launch with?",
      a: "As few as you can defend. A hero SKU plus a small set is easier for a Japanese partner to stock than a full home-market catalog.",
    },
    {
      q: "Where should I start if I still need the overall entry steps?",
      a: "Read the complete Japan market entry guide first, then return here for the selling model. If the missing piece is a distributor, use the distributor search guide.",
    },
  ],
  relatedSlugs: [
    EN_BLOG_DISTRIBUTOR_VS_DIRECT.slug,
    EN_BLOG_FIND_RETAILERS.slug,
    EN_BLOG_FIND_DISTRIBUTOR.slug,
    EN_BLOG_ENTER_JAPAN.slug,
  ],
  existingLinks: [
    ...links,
    {
      href: "/en/japan-market-entry/how-to-find-japanese-retailers",
      label: "How to find Japanese retailers",
    },
    {
      href: "/en/japan-market-for-functional-food-brands",
      label: "Japan market for functional food brands",
    },
  ],
  cta,
};
