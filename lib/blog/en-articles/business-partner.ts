import type { EnBlogArticle } from "@/lib/blog/en-articles/types";
import {
  EN_BLOG_DISTRIBUTOR_VS_DIRECT,
  EN_BLOG_ENTER_JAPAN,
  EN_BLOG_FIND_DISTRIBUTOR,
  EN_BLOG_FIND_RETAILERS,
  EN_BLOG_HUB,
  EN_BLOG_IMPORT_REQUIREMENTS,
} from "@/lib/blog/en-articles/types";

const cta = {
  heading: "Let Japanese companies see the partnership you actually want",
  body: "List your brand with channel intent, MOQ, and wholesale conditions so importers, distributors, retailers, and other sales partners can judge fit before they write.",
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

export const BUSINESS_PARTNER_ARTICLE: EnBlogArticle = {
  slug: "how-to-find-a-business-partner-in-japan",
  title: "How to Find a Business Partner in Japan",
  seoTitle: "How to Find a Business Partner in Japan",
  description:
    "How to find a business partner in Japan for an overseas brand. Compare importer, distributor, wholesaler, retailer, and sales partner roles.",
  eyebrow: "JAPAN BUSINESS PARTNER",
  lede: "A Japan business partner is a role, not a title on a business card. Name the job you need—import, wholesale, retail doors, or local selling—before you start searching.",
  intro: [
    "Searches for a business partner in Japan, a Japanese business partner, or a Japan sales partner often mix several jobs into one email. That is why replies are slow. The company on the other side cannot tell whether you want them to import, to wholesale, to put you on a shelf, or to represent the brand to accounts they already call on.",
    "This article is a selection guide. It is not a hunt for one distributor, and it is not a hunt for one retailer. Those searches have their own playbooks. Here the question is broader: which type of Japanese partner your brand actually needs, how the roles differ, what to confirm, and how to open the first conversation without wasting a buying team’s time.",
    "If you already know you need distribution coverage, use [how to find a distributor in Japan](" +
      EN_BLOG_FIND_DISTRIBUTOR.path +
      "). If you want a specific banner or e-commerce operator, use [how to find Japanese retailers](" +
      EN_BLOG_FIND_RETAILERS.path +
      "). If you are still choosing a model, start here, then read [distributor versus direct sales](" +
      EN_BLOG_DISTRIBUTOR_VS_DIRECT.path +
      ").",
  ],
  hero: {
    id: "goldenPavilion",
    alt: "A landmark in Kyoto. Finding a Japan business partner starts with naming the role you need",
  },
  sections: [
    {
      heading: "Types of partners overseas brands may need in Japan",
      image: {
        id: "shoppingStreet",
        alt: "A Japanese shopping street. Different partners sit at different points between factory and shopper",
      },
      paragraphs: [
        "Japan market entry rarely uses one company for every function. You might need an importer of record, a wholesaler for many doors, a retailer for a test, and a sales partner who already speaks to a category buyer. Some firms combine two of those jobs. Many do not.",
        "Write the functions first. Then look for a Japanese business partner who already performs them in your category. “Anyone in Japan who likes our brand” is not a brief.",
      ],
      cards: [
        {
          title: "Importer",
          body: "Brings goods across the border and is often the named party for clearance. May or may not sell onward to retail.",
        },
        {
          title: "Distributor / sales partner",
          body: "Sells into accounts they already serve. May import, or may buy from an importer. The commercial relationship with trade is the core job.",
        },
        {
          title: "Wholesaler",
          body: "Moves volume into trade. Coverage can be wide. Brand storytelling and a single-banner test are not always the priority.",
        },
        {
          title: "Retailer",
          body: "Buys for its own stores or site. Useful for a shelf or page test. Not a substitute for national wholesale coverage.",
        },
      ],
    },
    {
      heading: "How the roles differ in practice",
      paragraphs: [
        "The same English word can mean different legal and commercial facts in Japan. Ask who invoices the next party, who holds stock, who is importer of record, and who the store calls when a pack is wrong. Those four answers tell you more than “we are a trading company.”",
        "A distributor search is about account access and programming. A retailer search is about assortment fit for one banner. A business-partner search is the step before those: decide which mix of import, sell-in, and sell-out you are hiring, so you do not send a retail buyer a national exclusive request, or ask a wholesaler to run your brand story in a concept shop.",
      ],
      callout:
        "If you cannot say whether you need import capacity, wholesale coverage, or a first retail door, pause the outreach. The partner type is the strategy, not a later detail.",
    },
    {
      heading: "How to choose a partner that fits your brand",
      paragraphs: [
        "Fit is category, channel, and operating style—not logo size. A Japanese company that sells a neighbouring product into the channel you want is usually a better Japan sales partner than a famous name in an unrelated aisle.",
        "Also match ambition to your file. If you have one SKU, a realistic MOQ, and no Japanese-speaking service team, a partner who can import and sell into a defined channel is often the first hire. Direct sales can wait. Distributor versus direct sales covers that fork. This page only needs the selection rule: hire the gap in your team, not a title that sounds like “Japan expansion.”",
      ],
      bullets: [
        "Do they already sell your category, or only “international goods” in general?",
        "Is their strength import, wholesale, retail doors, or e-commerce operations?",
        "Can they name a first customer type, not only a prefecture map?",
        "Are they willing to start without a wide exclusive?",
      ],
    },
    {
      heading: "What to confirm: channel, terms, category, and region",
      paragraphs: [
        "Before you treat a company as your Japanese business partner, put commercial facts on the table. Vague “let’s cooperate” meetings produce polite follow-ups and no order.",
      ],
      bullets: [
        "Sales channel: specialty retail, chain, drugstore, e-commerce, foodservice, or mixed",
        "Geography: national coverage is a claim—ask where the first accounts actually sit",
        "Category experience and any competing lines they already carry",
        "MOQ, wholesale range, and who pays freight under which Incoterms",
        "Who imports, labels, and answers quality questions in Japanese",
      ],
    },
    {
      heading: "What to prepare before you inquire",
      paragraphs: [
        "Japanese companies route a first email to a person who needs a file, not a vision deck. Prepare a short pack: first SKU, suggested price band, MOQ for a test and for a reorder, ship-from location, sample policy, and the partner role you are asking for.",
        "If import checks still sit with specialists, say so. [Japan import requirements](" +
          EN_BLOG_IMPORT_REQUIREMENTS.path +
          ") is the checklist article. Do not hide missing documents behind a partnership request. A clear “we need an importer who already handles this category” is easier to accept than a polished brand film with no specs.",
      ],
    },
    {
      heading: "First communication with Japanese companies",
      paragraphs: [
        "Lead with the role, the SKU, and the first quantity. English is widely used in international trade teams, but the content has to be specific. “We want a business partner in Japan” is hard to assign. “We are looking for a Japanese sales partner to import and wholesale one skincare SKU into specialty beauty, non-exclusive for a first season” can be forwarded.",
        "Reply when they ask for facts. Slow or partial answers on ingredients, lead time, or MOQ read as operational risk. Keep exclusivity out of the first note unless they raise it. Offer a sample path and a review date for a test. How to find a distributor and how to find Japanese retailers go deeper on those two outreach styles. Use them after you know which role you are writing to.",
      ],
    },
    {
      heading: "Finding a Japan sales partner on BrandBridge",
      paragraphs: [
        "BrandBridge is built for overseas brands that want Japanese companies to see commercial terms before a call. You list product information, MOQ, and channel intent. Importers, distributors, wholesalers, retailers, and e-commerce operators can inquire with that context already visible.",
        "The platform does not appoint a partner for you, and it does not replace a contract. It reduces the cost of repeating the same PDF to companies that were never going to take your category. Register to list the brand. Contact BrandBridge if you need a human answer first.",
      ],
    },
  ],
  faqs: [
    {
      q: "What is a Japan business partner for a foreign brand?",
      a: "Usually a Japanese company that imports, wholesales, retails, or sells into accounts on your behalf. Name the function. The English title on their site is not enough.",
    },
    {
      q: "Is a distributor the same as a sales partner?",
      a: "Often in conversation, yes. In operations, ask who invoices the next buyer and who holds stock. Some “sales partners” only introduce. Some buy and resell.",
    },
    {
      q: "Should I look for a retailer or a wholesaler first?",
      a: "A retailer fits a banner or site test. A wholesaler or distributor fits coverage across accounts. Many brands start with one defined partner type, then widen.",
    },
  ],
  relatedSlugs: [
    EN_BLOG_FIND_DISTRIBUTOR.slug,
    EN_BLOG_FIND_RETAILERS.slug,
    EN_BLOG_DISTRIBUTOR_VS_DIRECT.slug,
    EN_BLOG_ENTER_JAPAN.slug,
    EN_BLOG_IMPORT_REQUIREMENTS.slug,
  ],
  existingLinks: [...links],
  cta,
};
