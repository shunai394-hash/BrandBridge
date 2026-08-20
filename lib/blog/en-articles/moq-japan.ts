import type { EnBlogArticle } from "@/lib/blog/en-articles/types";
import {
  EN_BLOG_BUSINESS_PARTNER,
  EN_BLOG_ENTER_JAPAN,
  EN_BLOG_ENTRY_COST,
  EN_BLOG_HUB,
  EN_BLOG_IMPORT_REQUIREMENTS,
  EN_BLOG_SELL_PRODUCTS,
} from "@/lib/blog/en-articles/types";

const cta = {
  heading: "Put a first-order MOQ where Japanese partners can see it",
  body: "List your brand with a test quantity and reorder quantity so importers, distributors, and retailers can judge whether a first Japan order is actually workable.",
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

export const MOQ_JAPAN_ARTICLE: EnBlogArticle = {
  slug: "moq-japan-market-entry",
  title:
    "MOQ for Entering the Japanese Market: What Overseas Brands Should Know",
  seoTitle: "MOQ for Japan Market Entry | What Brands Should Know",
  description:
    "MOQ for Japan market entry: why minimum order quantity matters for a first shipment, how test orders differ from replenishment, and how to discuss wholesale MOQ with a Japanese partner.",
  eyebrow: "JAPAN MARKET ENTRY MOQ",
  lede: "MOQ for Japan is a commercial design choice. A first test should be small enough to learn and large enough to ship, pack, and sell without pretending there is one national minimum.",
  intro: [
    "Searches for MOQ Japan, Japan wholesale MOQ, or Japan market entry MOQ often hope for a number. There is no honest single figure. Minimum order quantity depends on how you produce, how you pack, how the goods move, how long they last, and how a Japanese partner can actually sell the first lot.",
    "This article is for overseas brands planning a first Japan shipment. It does not quote a required carton count, pallet size, or yen total. Those belong in a quote for your SKU. It explains why MOQ matters, how a test differs from a standing wholesale order, and what to look at when you talk with a Japanese company.",
    "Japan market entry cost covers the money around a first order. How to sell products in Japan covers assortment and test design. How to find a business partner in Japan covers who you are talking to. This page stays on quantity: first order versus reorder, and how not to let factory MOQ silently become a Japan strategy.",
  ],
  hero: {
    id: "analytics",
    alt: "Planning figures on a screen. Japan market entry MOQ is a quantity you can defend, not a slogan",
  },
  sections: [
    {
      heading: "What MOQ means",
      paragraphs: [
        "MOQ—minimum order quantity—is the smallest amount a seller will accept for a production run, a shipment, or a wholesale invoice. Factories, brands, and Japanese partners can each have a different MOQ. They are not automatically the same number.",
        "For Japan market entry, you usually need two figures, not one: the smallest first order you can produce and ship as a test, and the smallest reorder you can support if that test sells. Mixing them in the first email makes a Japanese buyer guess whether you want a trial or a warehouse fill.",
      ],
    },
    {
      heading: "Why MOQ matters when you enter Japan",
      image: {
        id: "fujiSakura",
        alt: "Mount Fuji with cherry blossom. A first Japan quantity should match a season you can actually read",
      },
      paragraphs: [
        "Japanese partners plan from landed cost and sell-through, not from your global forecast. If the first quantity is far above what a first door or a first e-commerce listing can move before the next season, the leftover becomes their problem—or yours, sitting in storage.",
        "If the first quantity is too small to pack, clear, and replenish, the partner cannot run even a modest test. MOQ is where production reality meets channel reality. That is why it belongs in the first commercial pack, next to price and Incoterms, not in a later “operations” appendix.",
      ],
    },
    {
      heading: "First orders versus ongoing orders",
      paragraphs: [
        "A first Japan order is a learning lot: enough units to put on a shelf or a page, to see returns and questions, and to measure whether the price survived freight and margin. An ongoing order is replenishment once that signal exists.",
        "Many overseas brands quote only the factory’s standing MOQ. Japanese companies then assume every invoice will look like a full production run. If you can cut a smaller export pack for a first season, say so. If you cannot, say that too, and expect the partner to judge whether the risk is acceptable. Do not invent a “Japan standard quantity.” Category, brand, and channel decide.",
      ],
      cards: [
        {
          title: "Test / first shipment",
          body: "Bounded quantity, a review date, and a written plan for leftover or reorder. Learning is the job.",
        },
        {
          title: "Reorder",
          body: "Often closer to your normal production MOQ once sell-through and lead time are known.",
        },
        {
          title: "Not a national fill",
          body: "A first MOQ is not a promise to stock every prefecture. Coverage comes after a signal.",
        },
      ],
    },
    {
      heading: "Test selling versus a large first shipment",
      paragraphs: [
        "Test selling and a large first shipment fail for opposite reasons. A test that is too tiny may not justify freight or a listing. A first container that looks “serious” can fund unsold stock before anyone knows whether Japanese shoppers want the SKU.",
        "How to sell products in Japan describes a small first assortment. This page only adds the quantity rule: match units to the partner’s first channel, not to your home-market case pack out of habit. Exclusive deals that require a large opening inventory belong after a test, not instead of one.",
      ],
    },
    {
      heading: "What to look at when you discuss MOQ",
      paragraphs: [
        "Japan wholesale MOQ is never only “how many pieces.” It is a bundle of constraints. Bring them into the same conversation so nobody is surprised at the warehouse.",
      ],
      bullets: [
        "Unit, inner pack, and outer carton—partners order in the pack they can actually receive",
        "Whether a mixed SKU carton is possible for a first test",
        "Production calendar versus the partner’s selling season",
        "Who pays if the leftover cannot be sold as planned",
      ],
    },
    {
      heading: "Price, logistics, packing, lots, and shelf life",
      paragraphs: [
        "Unit cost often falls as quantity rises. Freight per unit usually does too—until you pay to store what did not sell. Packing and labeling in Japanese can have their own minimums if a printer or a sticker run is involved.",
        "Lot codes and expiry or best-before dates matter for food and some cosmetics. A quantity that looks efficient at the factory can be too large if the goods will not be sold while they are still in date after ocean transit and domestic distribution. Confirm that math with the partner and, where needed, with people who handle your category. Japan import requirements covers those checks without turning this page into a labeling manual.",
      ],
      callout:
        "There is no universal “Japan MOQ” in pieces or yen. Factory, pack, freight, shelf life, and selling method all move the number. Anyone quoting one quantity for every brand is guessing.",
    },
    {
      heading: "How to talk about MOQ with a Japanese partner",
      paragraphs: [
        "Offer two quantities when you can: a first-order idea and a reorder idea. Explain what is hard to change (production batch) and what is flexible (export packing). Ask what quantity their first door or first listing can reasonably take, then look for overlap.",
        "If your factory MOQ is far above a test, say what would have to be true to split a lot, hold remainder at origin, or share a container. Do not apologize with a discount that destroys the Japan price architecture. Japan market entry cost is the companion for landed-cost thinking. How to find a business partner in Japan is the companion for who should be in that conversation.",
      ],
    },
    {
      heading: "Start small enough to read the market",
      paragraphs: [
        "A practical Japan sequence for many overseas brands is: one SKU, a named partner role, a first quantity you can read, then a reorder or a second door. That still has a real MOQ. It is simply not the same as filling a national pipeline on the first invoice.",
        "BrandBridge is built for that conversation to happen with terms visible. Overseas brands list products and trading conditions, including quantity intent. Japanese companies can inquire without guessing whether you only sell in full-container lots. Listing does not set your MOQ. It makes the MOQ you already have easier to judge.",
      ],
    },
  ],
  faqs: [
    {
      q: "What is a typical MOQ for Japan market entry?",
      a: "There is no typical number that fits every brand. Production, packing, freight, shelf life, and the partner’s first channel all change it. Ask for a first-order quantity and a reorder quantity, not one slogan figure.",
    },
    {
      q: "Can I enter Japan with a small MOQ?",
      a: "Often that is the point of a test—if the quantity can still be packed, shipped, and sold. “Small” still has to be operationally real for your factory and the partner.",
    },
    {
      q: "Is Japan wholesale MOQ higher than in other markets?",
      a: "Not as a rule. Some Japanese partners prefer a cautious first lot. Some cannot work below a case-pack they already use. Compare against your SKU, not against a rumor about “Japan.”",
    },
  ],
  relatedSlugs: [
    EN_BLOG_ENTRY_COST.slug,
    EN_BLOG_SELL_PRODUCTS.slug,
    EN_BLOG_ENTER_JAPAN.slug,
    EN_BLOG_BUSINESS_PARTNER.slug,
    EN_BLOG_IMPORT_REQUIREMENTS.slug,
  ],
  existingLinks: [...links],
  cta,
};
