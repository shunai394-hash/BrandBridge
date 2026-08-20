import type { EnBlogArticle } from "@/lib/blog/en-articles/types";
import {
  EN_BLOG_BUSINESS_PARTNER,
  EN_BLOG_ENTRY_COST,
  EN_BLOG_FIND_DISTRIBUTOR,
  EN_BLOG_HUB,
  EN_BLOG_IMPORT_REQUIREMENTS,
  EN_BLOG_MOQ,
  EN_BLOG_SELL_PRODUCTS,
} from "@/lib/blog/en-articles/types";

const cta = {
  heading: "Explore Japan with commercial terms in view",
  body: "List your brand so Japanese distributors, retailers, and e-commerce partners can review product details and wholesale conditions before they inquire.",
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

export const ENTER_JAPAN_ARTICLE: EnBlogArticle = {
  slug: "how-to-enter-the-japanese-market",
  title:
    "How to Enter the Japanese Market: A Complete Guide for Foreign Brands",
  seoTitle: "How to Enter the Japanese Market | Guide for Foreign Brands",
  description:
    "A complete Japan market entry guide for foreign brands. Cover market fit, product requirements, Japanese distributors and retail partners, wholesale terms, localization, launch, and common mistakes.",
  eyebrow: "JAPAN MARKET ENTRY GUIDE",
  lede: "Entering Japan is less about a single contact and more about a sequence: market fit, commercial terms, the right Japanese partner, and a first order you can actually fulfill.",
  intro: [
    "Foreign brands often start with a search for a Japan distributor or a Japanese retail partner. Those searches are useful, but they skip the work that makes a first conversation productive: who the product is for, which channel it can enter, and what wholesale terms a Japanese buyer can take to an internal meeting.",
    "This guide walks through Japan market entry in practical order. It is written for overseas manufacturers and brand owners who want to sell products in Japan without opening a local office first. It is orientation, not legal or tax advice. Category rules still need a specialist when food, cosmetics, supplements, or electrical goods are involved.",
    "If you already know you need a partner rather than a full process map, use the companion guides on [finding a distributor in Japan](" +
      EN_BLOG_FIND_DISTRIBUTOR.path +
      ") and [selling products in Japan](" +
      EN_BLOG_SELL_PRODUCTS.path +
      ") after you finish the steps below.",
  ],
  hero: {
    id: "mtFuji",
    alt: "Mount Fuji. A long view of Japan market entry for overseas brands",
  },
  sections: [
    {
      heading: "1. Why Japan Is an Attractive Market",
      image: {
        id: "citySkyline",
        alt: "A Japanese city skyline. Scale and retail density in Japan",
      },
      paragraphs: [
        "Japan remains a large, quality-sensitive consumer market with dense retail and e-commerce networks. Buyers often pay for reliability, documentation, and after-sales clarity as much as for a new story.",
        "For a foreign brand, that can mean a smaller first order than in some export markets, but a partner who stays if the first season works. Japanese distributors and retailers usually prefer a brand that can repeat supply, answer questions in writing, and keep packaging and specs consistent.",
      ],
      cards: [
        {
          title: "Quality and proof",
          body: "Spec sheets, origin, certifications, and stable quality often matter more than a discounted first invoice.",
        },
        {
          title: "Established trade paths",
          body: "Importers, wholesalers, specialty retail, and e-commerce operators already move overseas goods. You do not need a Japan entity to start those conversations.",
        },
        {
          title: "Partnership time horizon",
          body: "Many Japanese partners look for a workable first discussion, then a trial quantity, before they talk about exclusivity or national coverage.",
        },
      ],
    },
    {
      heading: "2. Understand the Japanese Market",
      paragraphs: [
        "Before you email distributors, write down who would buy the product in Japan and where they already shop. A gift food, a daily skincare SKU, and a home object use different shelves, price bands, and explanation styles.",
        "Look at competing products already on Japanese retail or Amazon.jp-style listings: pack size, claimed use, price including tax, and how much text sits on the pack. If your home-market hero SKU is too large, too strongly scented, or too expensive after freight, the issue is market fit, not partner hunting.",
      ],
      bullets: [
        "Who is the first Japanese customer: specialty shopper, supermarket buyer, or online repeat buyer?",
        "Which Japanese companies already sell a close substitute?",
        "What retail price band still looks reasonable after import and domestic margin?",
        "Which channel can explain the product without a large in-store staff?",
      ],
      callout:
        "A short market note you can share with a partner is more useful than a long brand manifesto. One page on customer, price band, and first SKU is enough to start.",
    },
    {
      heading: "3. Check Product Regulations and Requirements",
      paragraphs: [
        "Japan does not use one import rule for every category. Food, cosmetics, quasi-drugs, supplements, toys, and electrical goods each have their own labeling, safety, and sometimes notification steps. BrandBridge does not determine legal fitness. Your Japanese partner, a licensed importer, or a qualified advisor should confirm what applies to your SKU. Before shipping products to Japan, review the [key import requirements for overseas brands](" +
          EN_BLOG_IMPORT_REQUIREMENTS.path +
          ").",
        "What you can prepare early is the file a partner will ask for: ingredients or materials, net content, country of origin, shelf life, storage, voltage or plug type if relevant, and any certificates you already hold. Missing files delay Japan market entry more often than a missing exclusive contract.",
      ],
      bullets: [
        "Ingredient or material list in a form a Japanese importer can review",
        "Shelf life from production and remaining life on arrival",
        "Allergen, alcohol, or battery information when it applies",
        "Who would be the importer of record on a first shipment",
      ],
    },
    {
      heading: "4. Find a Japanese Distributor or Retail Partner",
      paragraphs: [
        "A Japan distributor is not the same as a retailer, an importer, or a sales agent. Distributors usually buy or consign goods and place them into accounts they already serve. Retail partners evaluate shelf or e-commerce fit for one banner. Importers may handle customs without owning the retail relationship.",
        "The search for a Japanese distributor works better after you can state the role you want: national wholesale, regional specialty, e-commerce only, or a test with one retail group. Cold emails that only say “we want a distributor in Japan” are hard to route inside a Japanese company.",
        "How to search, what to send, and how to judge exclusive requests are covered in the dedicated distributor guide. This section is only the placement of that step inside Japan market entry: partner search comes after product and commercial basics, not before.",
      ],
    },
    {
      heading: "5. Set Pricing and Wholesale Terms",
      paragraphs: [
        "Japanese partners reverse-engineer from a realistic retail or e-commerce price. A wholesale number copied from your home market often leaves no room for freight, duty, domestic delivery, and the partner’s margin. If you are comparing different ways to enter Japan, see our guide to [Japan market entry costs](" +
          EN_BLOG_ENTRY_COST.path +
          ").",
        "State Incoterms, currency, MOQ, sample policy, and lead time in the same sheet as the price. If the first MOQ is a full production run, many Japanese retail partners will wait. A smaller first SKU set is usually easier to test. [MOQ for Japan market entry](" +
          EN_BLOG_MOQ.path +
          ") explains how a first order differs from a reorder.",
      ],
      bullets: [
        "FOB, CIF, or DDP-style responsibility, written clearly",
        "MOQ by SKU and by first order, not only by annual volume",
        "Sample cost and who pays freight on samples",
        "Whether Japan-exclusive rights are even on the table for a trial",
      ],
    },
    {
      heading: "6. Prepare for Japanese Localization",
      paragraphs: [
        "Localization is more than a translated slogan. Japanese buyers look at pack copy volume, date format, barcode, and whether care or allergen information can appear in Japanese. E-commerce partners also need images and a fact set they can put on a product page.",
        "You do not need perfect Japanese packaging on day one, but you do need a plan: who writes the Japanese copy, who prints a sticker or inner card, and whether your current pack size fits Japanese shelves and parcel sizes.",
      ],
    },
    {
      heading: "7. Launch and Test the Market",
      paragraphs: [
        "A first Japan launch is usually a limited SKU list, a defined channel, and a review date. Trying every prefecture and every online mall at once makes it hard to see what failed.",
        "Agree with the partner what “good” looks like for the trial: sell-through, re-order timing, or a second SKU. Keep a written record of price, MOQ, and who handles returns or quality claims. Then decide whether to widen the channel or change the assortment.",
      ],
    },
    {
      heading: "8. Common Mistakes Foreign Brands Make",
      paragraphs: [
        "These patterns show up often in first conversations with Japanese partners. None of them require a local office to avoid.",
      ],
      cards: [
        {
          title: "Partner search with no commercial file",
          body: "Japanese teams cannot raise an internal discussion on a mood board alone. Price, MOQ, and ship-from location belong in the first pack.",
        },
        {
          title: "Copying home-market retail prices",
          body: "Yen conversion without freight and channel margin produces a shelf price nobody can explain.",
        },
        {
          title: "Asking for exclusivity in the first email",
          body: "National exclusive rights before a trial order freeze the brand if that partner does not move.",
        },
        {
          title: "Treating Japan as one channel",
          body: "Department stores, specialty retail, drugstores, and e-commerce do not buy the same way. Name the first channel.",
        },
        {
          title: "Leaving import responsibility unnamed",
          body: "If nobody is clearly the importer, the first container does not leave. Name the role even if the answer is “to be confirmed with the partner.”",
        },
      ],
    },
    {
      heading: "9. How BrandBridge Helps Foreign Brands Enter Japan",
      paragraphs: [
        "BrandBridge is a B2B matching platform for overseas brands and Japanese sales partners. You list product information and trading conditions. Japanese distributors, wholesalers, retailers, and e-commerce operators can review those conditions before they inquire.",
        "The platform does not import goods, hold inventory, or replace legal advice. It shortens the gap between “we want to enter Japan” and a conversation that already includes MOQ, wholesale range, and channel intent.",
        "Registration for brands is the starting point if you want partners to find you. If you only need a process question answered, use the contact page. Live listings are on the English opportunities page.",
      ],
    },
  ],
  faqHeading: "10. FAQ",
  faqs: [
    {
      q: "Do I need a Japanese company to enter the Japanese market?",
      a: "No. Many foreign brands sell products in Japan through a distributor, importer, retailer, or e-commerce partner without opening a local entity. Some categories still need a Japanese importer of record.",
    },
    {
      q: "What is the difference between a Japan distributor and a retail partner?",
      a: "A distributor usually supplies multiple accounts. A Japanese retail partner buys for its own stores or site. Confirm which role you are asking for before you discuss exclusivity.",
    },
    {
      q: "When should I look for a Japanese distributor?",
      a: "After you can share a first SKU list, a wholesale idea, MOQ, and ship-from terms. Searching earlier is possible, but replies are weaker.",
    },
    {
      q: "Can I test Japan with e-commerce only?",
      a: "Yes. Some brands start with an e-commerce partner or a small specialty account, then add wholesale. The test still needs landing cost, page content, and a returns path.",
    },
    {
      q: "Does BrandBridge handle customs or warehousing?",
      a: "No. BrandBridge connects brands and Japanese partners around visible commercial terms. Import, storage, and labeling stay with the parties and their service providers.",
    },
  ],
  relatedSlugs: [
    EN_BLOG_ENTRY_COST.slug,
    EN_BLOG_IMPORT_REQUIREMENTS.slug,
    EN_BLOG_BUSINESS_PARTNER.slug,
    EN_BLOG_FIND_DISTRIBUTOR.slug,
    EN_BLOG_SELL_PRODUCTS.slug,
  ],
  existingLinks: [
    ...links,
    {
      href: "/en/japan-market-entry/how-to-enter-the-japanese-market",
      label: "Practical Japan market entry steps",
    },
    {
      href: "/en/japan-market-entry/how-to-find-japanese-distributors",
      label: "How to find Japanese distributors",
    },
    {
      href: "/en/japan-market-entry/how-to-find-japanese-retailers",
      label: "How to find Japanese retailers",
    },
  ],
  cta,
};
