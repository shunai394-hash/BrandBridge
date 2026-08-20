import type { EnBlogArticle } from "@/lib/blog/en-articles/types";
import {
  EN_BLOG_BUSINESS_PARTNER,
  EN_BLOG_ENTER_JAPAN,
  EN_BLOG_ENTRY_COST,
  EN_BLOG_FIND_DISTRIBUTOR,
  EN_BLOG_FIND_RETAILERS,
  EN_BLOG_HUB,
  EN_BLOG_SELL_PRODUCTS,
} from "@/lib/blog/en-articles/types";

const cta = {
  heading: "Choose a Japan sales model with terms on the table",
  body: "List your brand so Japanese distributors and other sales partners can review wholesale conditions. Direct sales can wait until a test has taught you the landed cost.",
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

export const DISTRIBUTOR_VS_DIRECT_ARTICLE: EnBlogArticle = {
  slug: "japan-distributor-vs-direct-sales",
  title:
    "Japan Distributor vs. Direct Sales: Which Is Better for Your Brand?",
  seoTitle: "Japan Distributor vs Direct Sales | Which Fits Your Brand",
  description:
    "Japan distributor vs direct sales for overseas brands. Compare a Japanese sales partner with selling yourself: operations, logistics, language, and when to test before you scale.",
  eyebrow: "JAPAN SALES MODEL",
  lede: "A Japan distributor and direct sales are different operating systems. Most foreign brands should pick the model that matches their team, not the one that sounds more ambitious.",
  intro: [
    "“Japan distributor vs direct sales” is a structure question. A Japanese distribution partner buys or programs goods and sells into accounts. Direct sales means your company owns the customer relationship in Japan: your own e-commerce, your own sales hire, or your own retail. Both can work. They fail for different reasons.",
    "This article is for overseas brands choosing a first path to sell in Japan. It does not repeat [how to search for a distributor](" +
      EN_BLOG_FIND_DISTRIBUTOR.path +
      "), how to find Japanese retailers, or the [full market-entry sequence](" +
      EN_BLOG_ENTER_JAPAN.path +
      "). Those guides sit next to this one. Here the comparison is operational: who talks to the buyer, who holds stock, who answers Japanese customers, and who funds the first mistakes.",
  ],
  hero: {
    id: "waterTorii",
    alt: "A torii standing in water. Two paths into Japan: a local partner or your own sales line",
  },
  sections: [
    {
      heading: "The main ways foreign brands sell in Japan",
      paragraphs: [
        "In practice you will hear more than two labels. Importers, wholesalers, retailers, and e-commerce operators can sit between you and the shopper. For this comparison, “Japan distributor” means a local sales partner that takes the trade relationship. “Direct” means you keep that relationship and build the local machine yourself. [How to sell products in Japan](" +
          EN_BLOG_SELL_PRODUCTS.path +
          ") covers first SKU and channel once you have chosen a model.",
      ],
      cards: [
        {
          title: "Japanese sales partner",
          body: "A distributor, importer-distributor, or similar partner sells into accounts they already serve. You supply commercial terms and product.",
        },
        {
          title: "Direct to Japanese customers",
          body: "Your own site, marketplace account, or local sales employee. You own pricing to the shopper and most of the service load.",
        },
        {
          title: "Hybrid, later",
          body: "A partner for wholesale or one channel, direct for another. This is easier after a test has shown where demand actually is.",
        },
      ],
    },
    {
      heading: "Selling through a Japan distributor or sales partner",
      image: {
        id: "handshake",
        alt: "A handshake. A Japanese distribution partner owns the local account relationship",
      },
      paragraphs: [
        "The advantage is speed of access. A good Japanese distributor already knows which buyers will look at your category, how to raise an internal discussion, and what a first order looks like. You do not need Japanese-language customer service on day one. You do need a clean file: SKU, MOQ, Incoterms, and an honest story about exclusivity.",
        "The trade-off is control. The partner sets much of the account list, the pace, and often the local service standard. If they are weak, your brand is quiet in Japan even though you “have a distributor.” Exclusive rights make that risk larger. How to find a distributor in Japan covers search and qualification. If you are still choosing the partner type, see [how to find a business partner in Japan](" +
          EN_BLOG_BUSINESS_PARTNER.path +
          "). This page only needs the model: you are hiring local commercial capacity.",
      ],
      bullets: [
        "Plus: existing accounts, local language, import path if they offer it",
        "Plus: you can test without a Japan entity or warehouse lease",
        "Minus: slower feedback if the partner does not share sell-through",
        "Minus: margin you will not keep, and less control of the brand story in-store",
      ],
    },
    {
      heading: "Selling direct",
      paragraphs: [
        "Direct sales in Japan can mean a cross-border shop, a local marketplace, or a salesperson you employ. You keep more of the customer data and the pricing story. You also inherit logistics exceptions, returns, payment methods, and Japanese-language support. Those are not weekend tasks.",
        "Direct can be the right first step for a digital-native brand with a parcel that ships cheaply and a team that can handle Japanese inquiries. It is a hard first step for a heavy, regulated, or high-touch product that Japanese retail still expects to buy through trade.",
      ],
      bullets: [
        "Plus: control of the shopper relationship and the catalog",
        "Plus: you can change price or content without a partner committee",
        "Minus: you fund logistics, ads, and service yourself",
        "Minus: doors that still buy only from domestic wholesalers will not see you",
      ],
    },
    {
      heading: "Language, customs, and who the customer calls",
      paragraphs: [
        "Japanese buyers and consumers expect written answers, clear claims, and a path for defects. A Japan sales partner absorbs much of that. Direct sales puts it on your clock, often in Japanese, across a time zone. Neither model removes product regulations. Direct does not mean you skip an importer of record if the law requires one.",
        "Commercial custom also differs. Trade partners may want a trial before a big story. Direct shoppers may want fast delivery and an easy return. If your team cannot staff that, a partner model is not “less ambitious.” It is a better match.",
      ],
    },
    {
      heading: "Which brands tend to fit which model",
      paragraphs: [
        "A Japan distributor or other sales partner tends to fit brands that need trade placement, have a physical product with real landed-cost math, or lack a Japanese-speaking commercial team. Direct tends to fit brands whose first Japan customer is already online, whose parcel economics work, and who can staff service.",
        "Retail-only tests sit in between: you may sell to a Japanese retail partner without appointing a national distributor. That is still a partner model, not direct-to-consumer. See [how to find Japanese retailers](" +
          EN_BLOG_FIND_RETAILERS.path +
          ") if that is the door you want.",
      ],
      callout:
        "If you cannot name who answers a quality complaint in Japanese next week, you are not ready for a fully direct launch—even if your website already ships worldwide.",
    },
    {
      heading: "Test with a partner, then widen the system",
      paragraphs: [
        "A practical sequence for many overseas brands is: list clear terms, talk to a Japanese sales partner, ship a bounded first order, read sell-through and landed cost, then decide whether to add doors, add a direct channel, or change the SKU. [Japan market entry cost](" +
          EN_BLOG_ENTRY_COST.path +
          ") is easier to control in that order.",
        "You can still choose direct later. What you should not do is sign a wide exclusive and also build a competing direct shop into the same accounts without a written plan. The complete entry guide is the process map. This article is only the fork: partner-led versus self-led commerce.",
      ],
    },
    {
      heading: "How BrandBridge helps you choose with real conversations",
      paragraphs: [
        "BrandBridge is built for the partner-led path. Overseas brands publish product and wholesale conditions. Japanese distributors, retailers, wholesalers, and e-commerce operators can inquire with that context already visible. That does not force you to stay in the partner model forever. It gives you a cheaper way to see whether Japan trade demand exists.",
        "Register to list the brand. Contact us if you need a question answered before you publish. If you already know you need a distributor search playbook or a selling-model guide, those articles are linked below.",
      ],
    },
  ],
  faqs: [
    {
      q: "Is a Japan distributor better than selling direct?",
      a: "It is better when you need local accounts, language, or import capacity you do not have. Direct is better when you can staff Japanese service and the product ships as a simple parcel. The product and the team decide, not the slogan.",
    },
    {
      q: "Can I use a Japanese sales partner and still sell direct later?",
      a: "Yes, if contracts allow it. Define channels and accounts so you do not compete with the partner in the same doors without agreement.",
    },
    {
      q: "Do I need a Japan company for direct sales?",
      a: "Not always. Cross-border e-commerce is used by some brands. Marketplace rules, tax, and importer-of-record duties still apply. Confirm with advisors for your category.",
    },
  ],
  relatedSlugs: [
    EN_BLOG_FIND_DISTRIBUTOR.slug,
    EN_BLOG_BUSINESS_PARTNER.slug,
    EN_BLOG_FIND_RETAILERS.slug,
    EN_BLOG_SELL_PRODUCTS.slug,
  ],
  existingLinks: [...links],
  cta,
};
