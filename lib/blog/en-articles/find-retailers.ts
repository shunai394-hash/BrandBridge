import type { EnBlogArticle } from "@/lib/blog/en-articles/types";
import {
  EN_BLOG_BUSINESS_PARTNER,
  EN_BLOG_DISTRIBUTOR_VS_DIRECT,
  EN_BLOG_ENTER_JAPAN,
  EN_BLOG_FIND_DISTRIBUTOR,
  EN_BLOG_HUB,
  EN_BLOG_SELL_PRODUCTS,
} from "@/lib/blog/en-articles/types";

const cta = {
  heading: "Let Japanese retail partners see your terms first",
  body: "List your brand so retailers, wholesalers, and other sales partners in Japan can review product details and wholesale conditions before they inquire.",
  primary: { href: "/en/register/maker", label: "List Your Brand" },
  secondary: { href: "/en/contact", label: "Contact BrandBridge" },
} as const;

const links = [
  { href: EN_BLOG_HUB.path, label: EN_BLOG_HUB.label },
  { href: "/en/japan-market-entry", label: "Japan Market Entry hub" },
  {
    href: "/en/japan-market-entry/how-to-find-japanese-retailers",
    label: "Guide to finding Japanese retailers",
  },
  { href: "/en/how-to-sell-in-japan", label: "How to Sell in Japan" },
  { href: "/en/cases", label: "Japan expansion opportunities" },
  { href: "/en/register/maker", label: "List your brand" },
  { href: "/en/contact", label: "Contact" },
] as const;

export const FIND_RETAILERS_ARTICLE: EnBlogArticle = {
  slug: "how-to-find-japanese-retailers",
  title: "How to Find Japanese Retailers for Your Brand",
  seoTitle: "How to Find Japanese Retailers | Guide for Foreign Brands",
  description:
    "How to find Japanese retailers and retail buyers for an overseas brand. Where to look, what to prepare, and how retail differs from distributors.",
  eyebrow: "JAPANESE RETAIL PARTNERS",
  lede: "Finding Japanese retailers is a buyer conversation: category fit, pack, price band, and a first quantity a store or e-commerce team can actually stock.",
  intro: [
    "Searches for Japanese retailers, Japan retail buyers, or a Japanese retail partner usually mean one thing: you want a company that sells to Japanese consumers under its own banner, not a wholesaler that supplies many banners.",
    "This article is written for overseas brands that want to sell to Japanese retailers. It is not a translation of a Japanese sourcing guide, and it is not the same job as [finding a Japan distributor](" +
      EN_BLOG_FIND_DISTRIBUTOR.path +
      "). Retail buyers judge shelf or page fit. Distributors judge whether they can place you into accounts they already call on. If you are still choosing among importer, retailer, and sales partner, start with [how to find a business partner in Japan](" +
      EN_BLOG_BUSINESS_PARTNER.path +
      ").",
    "You do not need a Japan office to start. You do need a file a buyer can take to an internal meeting: first SKU, suggested retail range, MOQ, ship-from terms, and who would import.",
  ],
  hero: {
    id: "kyotoStreet",
    alt: "A shopping street in Japan. Retail buyers judge products for a specific customer and shelf",
  },
  sections: [
    {
      heading: "How Japan’s retail market tends to buy",
      image: {
        id: "souvenirShop",
        alt: "Goods on a Japanese shop shelf. Pack size and explanation matter as much as the brand story",
      },
      paragraphs: [
        "Japanese retail is dense and specialized. Department stores, specialty independents, drugstores, variety stores, and pure e-commerce operators do not share one buying calendar or one pack preference. A product that fits a concept shop in a large city may be the wrong size, scent, or price for a national chain.",
        "Buyers often work from a category they already own. They compare your SKU with what is next to it on the shelf or on a product page: tax-included price, pack copy volume, date coding, and whether staff can explain it in a few sentences. Fame in another country is useful context. It is rarely the decision.",
      ],
      cards: [
        {
          title: "Specialty and concept retail",
          body: "Fewer doors, more story. Buyers care about assortment discipline and whether the pack looks right in a small space.",
        },
        {
          title: "Chain and drugstore",
          body: "Volume and replenishment matter. Case packs, lead time, and a price that survives their margin are the first filters.",
        },
        {
          title: "E-commerce retailers",
          body: "Images, spec sheets, shipping size, and returns paths decide whether a listing can go live.",
        },
      ],
    },
    {
      heading: "Where to look for Japanese retailers and retail buyers",
      paragraphs: [
        "Trade shows in Japan still work when you bring samples and a one-page terms sheet. Category shows beat general “export to Japan” booths if your product already has a home. Warm introductions from a current customer who sells into Japan are stronger than a cold English website form.",
        "Direct outreach to a head-office buying team is possible, but the message has to name the banner, the category, and the first SKU. “We want retailers in Japan” is hard to route. “We are looking for a Japanese retail partner for a single skincare SKU in specialty beauty, non-exclusive for a first season” is easier.",
        "B2B listings help when several Japanese companies can see the same wholesale range and MOQ before they write. BrandBridge is built for that pattern: Japanese sales partners review commercial terms, then inquire.",
      ],
      bullets: [
        "Shows and buyer missions where your category already has Japanese visitors",
        "Specialty groups that already import a neighbouring product, not a random trading company",
        "E-commerce operators that list comparable pack sizes and price bands",
        "Platforms where MOQ and ship-from location are visible before a call",
      ],
    },
    {
      heading: "Retailer, distributor, and wholesaler are different jobs",
      paragraphs: [
        "A Japanese retail partner buys for its own stores or site. A distributor usually supplies multiple accounts. A wholesaler focuses on volume into trade. Mixing the words in the first email forces the other side to guess which meeting they should book. Before choosing a distributor, you may also want to understand the [difference between using a Japanese distributor and selling directly](" +
          EN_BLOG_DISTRIBUTOR_VS_DIRECT.path +
          ").",
        "If you need national wholesale coverage, you are probably looking for a distributor. If you want one banner to test a shelf story, you are looking for retailers. Some companies do both. Ask who invoices the store, who holds stock, and who is the importer of record.",
      ],
      callout:
        "If the company cannot name the first doors or the first online category it would pitch, you may be talking to a general trader, not a retail buyer.",
    },
    {
      heading: "What to confirm before you sell to Japanese retailers",
      paragraphs: [
        "Retail conversations stall on missing facts more often than on brand taste. Prepare the same pack you would give a distributor, then add what a store team needs: suggested retail range including tax, inner and outer pack sizes, and whether Japanese copy or a sticker can be added later.",
      ],
      bullets: [
        "First SKU list, not the full home-market catalog",
        "Wholesale idea and a realistic Japan shelf or page price band",
        "MOQ for a first order and for a reorder",
        "Incoterms, ship-from location, and sample policy",
        "Shelf life after freight, storage, and any category-sensitive claims",
        "Who would be the importer if the retailer does not import itself",
      ],
    },
    {
      heading: "A typical path from first contact to a first order",
      paragraphs: [
        "Most overseas brands do not go from a cold email to a national listing. A common path is a sample, a small first quantity, a review of sell-through, then a second SKU or a second door. Chains may need longer internal reviews than independents.",
        "Agree what “good” looks like for the test: a reorder window, a sell-through range, or a decision date. Keep price, MOQ, and quality-claim handling in writing. [How to sell products in Japan](" +
          EN_BLOG_SELL_PRODUCTS.path +
          ") covers assortment and test design in more detail. [How to find a distributor in Japan](" +
          EN_BLOG_FIND_DISTRIBUTOR.path +
          ") covers the wholesale search if retail-only is not the right first step.",
      ],
    },
    {
      heading: "How BrandBridge helps you find a Japanese retail partner",
      paragraphs: [
        "BrandBridge is a B2B matching platform. Overseas brands list product information and trading conditions. Japanese retailers, distributors, wholesalers, and e-commerce operators can review those conditions before they inquire.",
        "The platform does not buy shelf space, run stores, or decide legal fitness. It shortens the gap between “we want Japanese retailers” and a conversation that already includes MOQ and channel intent. List your brand if you want inbound interest. Use the contact page if you need a question answered first.",
      ],
    },
  ],
  faqs: [
    {
      q: "How do I find retailers in Japan without introductions?",
      a: "Use a specific banner type, a short commercial pack, and more than one path: category shows, companies already in your shelf set, and B2B listings with visible terms. Vague “retailers in Japan” emails are easy to ignore.",
    },
    {
      q: "Do I need a distributor before I talk to Japanese retail buyers?",
      a: "Not always. Some retailers import or work with their own importer. Some expect a domestic distributor. Ask who invoices the store and who is the importer of record.",
    },
    {
      q: "What do Japan retail buyers look at first?",
      a: "Category fit, a price that can sit next to local competitors after landed cost, pack size, and whether the first order quantity is small enough to test.",
    },
  ],
  relatedSlugs: [
    EN_BLOG_BUSINESS_PARTNER.slug,
    EN_BLOG_SELL_PRODUCTS.slug,
    EN_BLOG_FIND_DISTRIBUTOR.slug,
    EN_BLOG_DISTRIBUTOR_VS_DIRECT.slug,
  ],
  existingLinks: [...links],
  cta,
};
