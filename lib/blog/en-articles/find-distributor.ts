import type { EnBlogArticle } from "@/lib/blog/en-articles/types";
import {
  EN_BLOG_BUSINESS_PARTNER,
  EN_BLOG_DISTRIBUTOR_VS_DIRECT,
  EN_BLOG_ENTER_JAPAN,
  EN_BLOG_FIND_RETAILERS,
  EN_BLOG_HUB,
  EN_BLOG_SELL_PRODUCTS,
} from "@/lib/blog/en-articles/types";

const cta = {
  heading: "Let Japanese partners see your terms first",
  body: "A distributor conversation in Japan moves faster when wholesale range, MOQ, and channel intent are already on the listing.",
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

export const FIND_DISTRIBUTOR_ARTICLE: EnBlogArticle = {
  slug: "how-to-find-a-distributor-in-japan",
  title: "How to Find a Distributor in Japan",
  seoTitle: "How to Find a Distributor in Japan | Foreign Brands",
  description:
    "How to find a Japan distributor or distribution partner. Where to search, what to send, how to judge fit, and when exclusivity can wait.",
  eyebrow: "JAPAN DISTRIBUTOR GUIDE",
  lede: "Finding a Japanese distributor is a search-and-qualification job: name the role, show commercial terms, and talk to partners who already sell into the channel you need.",
  intro: [
    "Searches for “Japan distributor” and “Japanese distributor” usually mean one of three things: an importer who can clear goods, a wholesaler who supplies retail, or a sales company that will represent the brand to accounts. Japanese companies mix these words. Your first task is to say which job you are hiring for. If the question is still which type of Japanese company you need, start with [how to find a business partner in Japan](" +
      EN_BLOG_BUSINESS_PARTNER.path +
      ").",
    "This article is the search playbook. It does not repeat the [full Japan market entry sequence](" +
      EN_BLOG_ENTER_JAPAN.path +
      "), and it does not cover how to run a first retail test. Use those companion guides for process and [selling models](" +
      EN_BLOG_SELL_PRODUCTS.path +
      "). Here the focus is how to find a distribution partner, how to approach them, and how to avoid locking the brand into the wrong exclusive.",
  ],
  hero: {
    id: "handshake",
    alt: "A handshake. Finding a Japanese distributor starts with a clear commercial discussion",
  },
  sections: [
    {
      heading: "What a Japan distributor actually does",
      paragraphs: [
        "A working Japanese distributor typically buys or commits to volume, holds or programs inventory, and sells into accounts it already calls on. Some also import. Some only sell after another company imports. If you need both import and retail placement, say so. If you only need someone to introduce the brand, you may be describing an agent, not a distributor. If you need one banner rather than wholesale coverage, see [how to find Japanese retailers](" +
          EN_BLOG_FIND_RETAILERS.path +
          ").",
      ],
      cards: [
        {
          title: "Importer-distributor",
          body: "Handles bringing goods into Japan and selling onward. Useful when you have no importer of record.",
        },
        {
          title: "Domestic wholesaler",
          body: "Buys from an importer or from you under DDP-like terms and supplies retailers or foodservice.",
        },
        {
          title: "Brand sales company",
          body: "Focuses on pitching accounts and managing the relationship. Confirm who holds stock and who invoices retail.",
        },
      ],
      callout:
        "Ask who invoices the retailer, who holds stock, and who is the importer. Those three answers tell you more than the English job title on a website.",
    },
    {
      heading: "Where to look for a Japanese distribution partner",
      paragraphs: [
        "Trade shows in Japan and in your home region still work when you have samples and a one-page terms sheet. Industry associations and existing customers who already export to Japan can introduce names. Direct websites and LinkedIn work only if the message is specific.",
        "B2B matching platforms are useful when you want several Japanese partners to see the same commercial snapshot instead of repeating the same PDF by email. BrandBridge is built for that pattern: Japanese distributors and other sales partners review listed terms before they inquire.",
      ],
      bullets: [
        "Shows and buyer missions where your category already has Japanese visitors",
        "Warm introductions from a current importer in another Asian market",
        "Japanese companies that already list a close category, not a random trading house",
        "Platforms where MOQ and wholesale range can be compared before a call",
      ],
    },
    {
      heading: "What to send in the first outreach",
      image: {
        id: "analytics",
        alt: "A planning workspace. Japanese distributors need a file they can take to an internal meeting",
      },
      paragraphs: [
        "Japanese teams forward a short pack, not a 40-page brand book. Lead with the product, the first SKU, who it is for in Japan, and the commercial box: wholesale idea, MOQ, ship-from, Incoterms, sample policy.",
        "Write the role you want in one sentence. “We are looking for a Japanese distributor to supply specialty food retail in Kanto, non-exclusive for a first year” is easier to route than “seeking a Japan partner.”",
      ],
      bullets: [
        "One-page product and buyer profile",
        "Wholesale range or a clear “quote after volume” note, not a blank",
        "MOQ for a first order and for a repeat order",
        "Whether you can support Japanese packaging or stickers later",
        "Any existing Japan sales you must disclose",
      ],
    },
    {
      heading: "How to judge fit before you talk exclusivity",
      paragraphs: [
        "Category overlap is the first filter. A distributor of industrial parts will not place a cosmetics line. Channel overlap is the second: drugstore, department store, specialty, and pure e-commerce are different call patterns.",
        "Ask which accounts they could realistically pitch in 90 days, not which famous banners they once visited. Ask how they handle slow movers and quality claims. A Japan distribution partner who cannot describe a trial plan is not ready, even if the English website looks international.",
      ],
    },
    {
      heading: "Exclusive rights can wait",
      paragraphs: [
        "Foreign brands often offer Japan-wide exclusivity to sound serious. Japanese companies sometimes ask for it equally early. Both sides should wait until a trial quantity, a channel list, and a review date exist. Before you treat a distributor as the only path, you may also want to understand the [difference between using a Japanese distributor and selling directly](" +
          EN_BLOG_DISTRIBUTOR_VS_DIRECT.path +
          ").",
        "If you do discuss exclusivity, define territory, channel, minimum purchase, and what happens if those minimums are missed. The longer Japan market entry guide covers when exclusivity belongs in the overall sequence. This page only needs the search rule: do not use exclusive rights as the opening bid.",
      ],
    },
    {
      heading: "How BrandBridge helps you find a distributor in Japan",
      paragraphs: [
        "On BrandBridge, overseas brands publish product and trading conditions. Japanese distributors, wholesalers, retailers, and e-commerce operators can filter and inquire with that context already visible.",
        "That does not replace a meeting, a factory audit, or a contract. It reduces the number of messages that die because MOQ or ship-from was missing. List the brand if you want inbound interest. Contact us if you need a question answered before you list.",
      ],
    },
  ],
  faqs: [
    {
      q: "How do I find a distributor in Japan if I have no introductions?",
      a: "Use a specific role, a short commercial pack, and more than one search path: shows, category-relevant companies, and B2B listings. Vague “Japan distributor wanted” emails are easy to ignore.",
    },
    {
      q: "Is a Japanese distributor the same as an importer?",
      a: "Not always. Some distributors import. Some buy after another company imports. Confirm importer of record before you plan the first shipment.",
    },
    {
      q: "Should I appoint one exclusive Japan distributor immediately?",
      a: "Usually no. A non-exclusive trial, or exclusivity limited to a channel or region, is easier to unwind if the partner does not place goods.",
    },
    {
      q: "What do Japanese distributors look for from a foreign brand?",
      a: "A clear first SKU, a price that can survive Japanese margins, a realistic MOQ, and someone who answers specification questions in writing.",
    },
  ],
  relatedSlugs: [
    EN_BLOG_BUSINESS_PARTNER.slug,
    EN_BLOG_DISTRIBUTOR_VS_DIRECT.slug,
    EN_BLOG_ENTER_JAPAN.slug,
    EN_BLOG_SELL_PRODUCTS.slug,
    EN_BLOG_FIND_RETAILERS.slug,
  ],
  existingLinks: [
    ...links,
    {
      href: "/en/japan-market-entry/how-to-find-japanese-distributors",
      label: "How to find Japanese distributors",
    },
    {
      href: "/en/japan-market-entry/how-to-find-a-japanese-distributor",
      label: "How to evaluate a Japanese distributor",
    },
  ],
  cta,
};
