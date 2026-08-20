import type { EnBlogArticle } from "@/lib/blog/en-articles/types";
import {
  EN_BLOG_BUSINESS_PARTNER,
  EN_BLOG_ENTER_JAPAN,
  EN_BLOG_ENTRY_COST,
  EN_BLOG_HUB,
  EN_BLOG_MOQ,
} from "@/lib/blog/en-articles/types";

const cta = {
  heading: "Find a Japanese partner before you treat import as a solo project",
  body: "List your brand with product facts and wholesale conditions so Japanese importers, distributors, and other sales partners can review them before they inquire.",
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

export const IMPORT_REQUIREMENTS_ARTICLE: EnBlogArticle = {
  slug: "japan-import-requirements",
  title: "Japan Import Requirements for Overseas Brands",
  seoTitle: "Japan Import Requirements | Overseas Brand Checklist",
  description:
    "Japan import requirements for overseas brands: the basic import flow, category checks for food and cosmetics, labeling, and what to confirm with a Japanese partner before you sell.",
  eyebrow: "JAPAN IMPORT REQUIREMENTS",
  lede: "Japan import requirements are a checklist, not a single license. What you must confirm depends on the product, how it will be sold, and who in Japan will act as importer.",
  intro: [
    "Searches for Japan import requirements, importing products into Japan, or Japan market entry requirements usually mean the same practical question: what must be true before a first shipment can be sold, not how to fill every customs form yourself.",
    "This article is a planning guide for overseas brands. It is not legal, medical, or regulatory advice, and it is not a substitute for a licensed customs broker, a Japanese importer, or a specialist for your category. Food, cosmetics, supplements, electrical goods, and other regulated items do not share one rulebook.",
    "The [complete Japan market entry guide](" +
      EN_BLOG_ENTER_JAPAN.path +
      ") covers sequence and partners. [Japan market entry cost](" +
      EN_BLOG_ENTRY_COST.path +
      ") covers money. This page stays on checks: import flow, category differences, labeling and product facts, and why most brands confirm those items with a Japanese partner rather than trying to process everything from abroad.",
  ],
  hero: {
    id: "consultant",
    alt: "A professional review. Japan import requirements start with product facts, not a slogan",
  },
  sections: [
    {
      heading: "The basic flow of importing products into Japan",
      image: {
        id: "gardenTsukubai",
        alt: "A composed Japanese garden basin. Import into Japan is a sequence of named roles, not one stamp",
      },
      paragraphs: [
        "A typical path is: classify the product, decide Incoterms and who is importer of record, prepare commercial documents, move the goods, clear customs, then make the SKU sellable in Japanese retail or e-commerce. Those steps can sit with different companies. The overseas brand may never file the entry itself.",
        "What changes the path is not “Japan” as a slogan. It is HS classification, whether the goods are food or a cosmetic, whether claims appear on pack, and whether a Japanese company already imports similar items. Until those facts are named, “import products to Japan” is too vague to quote or to schedule.",
      ],
      bullets: [
        "Who is the importer of record, and who holds stock after arrival",
        "Which documents travel with the goods, and in which language the buyer needs facts",
        "Whether the first shipment is samples, a test quantity, or replenishment",
      ],
    },
    {
      heading: "Requirements change by product category",
      paragraphs: [
        "Japan import regulations are category-specific. A home-goods SKU, a packaged food, and a leave-on cosmetic can share a freight forwarder and still need different notifications, labels, and responsible parties in Japan. Copying another brand’s checklist is a common mistake.",
        "Start from what the product is, what it claims, and who the end user is. Then ask which Japanese rules might apply—not which English blog listed a form number last year. Rules and practice also move. Confirm current requirements with people who handle your category, not with a general export article.",
      ],
      cards: [
        {
          title: "General consumer goods",
          body: "Still need accurate specs, safety of materials, and a Japanese-readable fact sheet. Fewer specialized filings does not mean “no checks.”",
        },
        {
          title: "Food and beverage",
          body: "Ingredients, processing, dates, and labeling often matter as much as the brand story. A Japanese importer or specialist should say what must be reviewed.",
        },
        {
          title: "Cosmetics and similar",
          body: "Ingredient lists, claims, and who is responsible in Japan are frequent discussion points. Do not assume a home-market pack is enough.",
        },
      ],
      callout:
        "Product category and selling format change the requirements. Confirm details with qualified specialists and the relevant Japanese parties or authorities for your SKU. This page does not list forms or declare a product “cleared.”",
    },
    {
      heading: "Food, cosmetics, and supplements: points to check",
      paragraphs: [
        "These three groups appear often in foreign-brand searches because they sit closer to health and labeling rules. The points below are discussion prompts, not a clearance path.",
        "For food: what is in it, how it is made, how it is stored, date coding, and whether any health-related wording appears. For cosmetics: full ingredient disclosure in the form Japan expects, pack claims, and who will be named as the responsible party if that is required for your type of product. For supplements: composition, claims, and whether the item is treated more like a food or like something that needs extra review—that distinction is for specialists, not for a marketing page.",
        "If you cannot yet answer those questions in writing, you are not ready to ask a Japanese buyer for a first order. You are ready to ask a partner which expert they use.",
      ],
    },
    {
      heading: "Japanese labeling, product information, and the importer’s checks",
      paragraphs: [
        "Selling in Japan usually needs Japanese-readable facts: what the product is, how to use it, what is inside, and how to reach someone if there is a problem. That may be a sticker, a belly band, a rewritten card, or a full pack change. E-commerce pages need the same facts even when the physical pack is still in English.",
        "The importer or the Japanese sales partner will often ask for specs, safety data if relevant, photos, barcodes, and a statement of who can answer quality questions. They are not being difficult. They are building a file their own compliance or buying team can live with. Incomplete English PDFs slow that file down more than a modest first MOQ.",
      ],
      bullets: [
        "Ingredient or component list that matches the physical goods",
        "Country of origin, net contents, and storage if the category needs it",
        "Claim language you are willing to stand behind in Japanese",
        "Who in Japan receives a quality or labeling question",
      ],
    },
    {
      heading: "What to confirm before you start selling",
      paragraphs: [
        "Importing products into Japan and listing them for sale are related, but not identical. Goods can arrive and still not be ready for a shelf or a product page. Before you treat a first order as a launch, agree who imports, who labels, who holds inventory, and what happens if a fact on the pack is wrong.",
        "Also confirm Incoterms, insurance, and who pays if goods cannot be sold as planned. Japan market entry cost explains why those lines move independently. [MOQ for Japan market entry](" +
          EN_BLOG_MOQ.path +
          ") explains why a small first quantity is often the safer way to learn. Neither replaces a specialist review of the SKU.",
      ],
    },
    {
      heading: "Confirm with a Japanese partner instead of doing every step yourself",
      paragraphs: [
        "Overseas brands rarely need to become their own customs broker on day one. A Japanese importer, distributor, or retailer that already handles similar goods can say which checks are real for that channel. You still own product truth: composition, claims, and whether you can supply the documents they ask for. [How to find a business partner in Japan](" +
          EN_BLOG_BUSINESS_PARTNER.path +
          ") covers how those roles differ.",
        "That split is the practical reading of Japan market entry requirements. You prepare a clean commercial and technical file. The local partner helps map that file onto how Japan actually clears and sells the category. Direct-to-consumer shipping does not remove importer-of-record or labeling questions; it only changes who the customer sees.",
      ],
    },
    {
      heading: "How BrandBridge helps you find a partner for those checks",
      paragraphs: [
        "BrandBridge is a B2B matching platform. Overseas brands list product information and trading conditions. Japanese importers, distributors, retailers, wholesalers, and e-commerce operators can review those conditions before they inquire.",
        "The platform does not clear customs, approve labels, or decide legal fitness. It shortens the gap between “we want to import products to Japan” and a conversation with companies that already sell into Japanese channels. List your brand if you want inbound interest. Use the contact page if you need a question answered first.",
      ],
    },
  ],
  faqs: [
    {
      q: "What are the Japan import requirements for every product?",
      a: "There is no single list. Classification, category, claims, and who imports all change the work. Treat generic checklists as a starting conversation, then confirm with specialists for your SKU.",
    },
    {
      q: "Can my company import into Japan without a local partner?",
      a: "Some brands use a third-party importer or a logistics provider. Others appoint a Japanese sales partner who already imports. The workable option depends on the product and the selling model—not on a blog’s preference.",
    },
    {
      q: "Do I need Japanese on the pack before the first shipment?",
      a: "Often a Japanese-readable method is needed before retail or e-commerce sale, even if the first inbound lot used a temporary sticker. Confirm the method with the partner who will sell the goods.",
    },
  ],
  relatedSlugs: [
    EN_BLOG_ENTER_JAPAN.slug,
    EN_BLOG_ENTRY_COST.slug,
    EN_BLOG_MOQ.slug,
    EN_BLOG_BUSINESS_PARTNER.slug,
  ],
  existingLinks: [...links],
  cta,
};
