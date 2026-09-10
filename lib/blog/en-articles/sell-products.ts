import type { EnBlogArticle } from "@/lib/blog/en-articles/types";
import {
  EN_BLOG_BUSINESS_PARTNER,
  EN_BLOG_DISTRIBUTOR_VS_DIRECT,
  EN_BLOG_ENTER_JAPAN,
  EN_BLOG_FIND_DISTRIBUTOR,
  EN_BLOG_FIND_RETAILERS,
  EN_BLOG_HUB,
  EN_BLOG_IMPORT_REQUIREMENTS,
  EN_BLOG_MOQ,
} from "@/lib/blog/en-articles/types";

const cta = {
  heading: "Need a Japanese sales partner?",
  body: "Explore BrandBridge and connect with potential Japanese business partners. List your product, wholesale terms, and first-order quantity so distributors, retailers, and e-commerce operators can judge fit before they write.",
  primary: { href: "/en/register/maker", label: "List Your Brand" },
  secondary: { href: "/en/cases", label: "See Japan opportunities" },
} as const;

const links = [
  { href: EN_BLOG_HUB.path, label: EN_BLOG_HUB.label },
  { href: "/en/japan-market-entry", label: "Japan Market Entry hub" },
  {
    href: "/en/japan-market-entry/how-to-enter-the-japanese-market",
    label: "How to enter the Japanese market",
  },
  { href: "/en/cases", label: "Japan expansion opportunities" },
  { href: "/en/register/maker", label: "List your brand" },
  { href: "/en/contact", label: "Contact" },
] as const;

export const SELL_PRODUCTS_ARTICLE: EnBlogArticle = {
  slug: "how-to-sell-products-in-japan",
  title: "How to Sell Products in Japan: A Practical Guide for Foreign Brands",
  seoTitle:
    "How to Sell Products in Japan: Distributors, Retailers & E-commerce",
  description:
    "Learn how foreign brands can sell products in Japan through distributors, retailers, e-commerce and local sales partners. Explore pricing, MOQ and market entry options.",
  eyebrow: "SELLING PRODUCTS IN JAPAN",
  lede: "Foreign brands can sell products in Japan through distributors, retailers, e-commerce, or local sales partners. The right approach depends on the product category, pricing, MOQ, import requirements, and how much local support the brand needs.",
  intro: [
    "Searches for selling products in Japan, selling online in Japan, or “how do I sell in Japan” usually mean one practical question: how does the product actually reach a Japanese customer? The answer is a selling model, not a single meeting. You choose who sells, which SKU goes first, and how you will know a first order worked.",
    "This page is not a full [Japan market entry](" +
      EN_BLOG_ENTER_JAPAN.path +
      ") sequence, and it is not a hunt for one [distributor](" +
      EN_BLOG_FIND_DISTRIBUTOR.path +
      ") or one [retailer](" +
      EN_BLOG_FIND_RETAILERS.path +
      "). Entry is the overall process. Partner search is a separate job. Selling is the commercial path: wholesale into Japanese distributors, direct to Japanese retailers, e-commerce, or a local sales partner—plus the first SKU, wholesale price, and MOQ that make that path readable.",
  ],
  hero: {
    id: "shoppingStreet",
    alt: "A Japanese shopping street. Selling products in Japan starts with a channel you can explain",
  },
  sections: [
    {
      heading: "How can a foreign brand sell products in Japan?",
      paragraphs: [
        "Most overseas brands sell in Japan without opening a local company first. They work through a Japanese company that already buys, imports, or sells in the category. Four models cover almost every first conversation. Pick one primary model for the first six months so you can read the result.",
      ],
      subsections: [
        {
          heading: "Japanese distributors",
          paragraphs: [
            "A Japanese distributor sells into accounts it already serves—retailers, wholesalers, or regional buyers. You supply product, wholesale terms, and replenishment. The distributor usually owns the trade relationship. This model fits brands that want coverage beyond one shop and can support a repeatable first order. For how to search, see [how to find a distributor in Japan](" +
              EN_BLOG_FIND_DISTRIBUTOR.path +
              "). For when a distributor is the wrong first move, see [distributor versus direct sales](" +
              EN_BLOG_DISTRIBUTOR_VS_DIRECT.path +
              ").",
          ],
        },
        {
          heading: "Japanese retailers",
          paragraphs: [
            "A Japanese retailer buys for its own stores or site. Specialty shops, department stores, drugstores, and multi-brand retailers do not share one buying calendar. A retailer test gives you shelf or page proof, but it is not national wholesale coverage. Keep the first SKU easy to explain and easy to restock. Channel-specific search is in [how to find Japanese retailers](" +
              EN_BLOG_FIND_RETAILERS.path +
              ").",
          ],
        },
        {
          heading: "E-commerce",
          paragraphs: [
            "Selling online in Japan can mean a Japanese online retailer, a marketplace listing run with a local operator, or a brand shop with a Japan-side partner. E-commerce is often the cleanest demand test if parcel size, returns, and page content work. It is rarely a full substitute for wholesale if you want physical retail. Confirm who imports, who holds stock, and who answers Japanese customers before you treat a listing as “selling in Japan.”",
          ],
        },
        {
          heading: "Local sales partners",
          paragraphs: [
            "A local sales partner—sometimes called a sales agent or Japan sales partner—introduces the brand and supports negotiations without always taking inventory. This can fit when you can ship and invoice on clearer brand-controlled terms, and you need someone who already speaks to buyers in your category. Name the job in writing: introductions, account coverage, or ongoing selling. [How to find a business partner in Japan](" +
              EN_BLOG_BUSINESS_PARTNER.path +
              ") helps you separate that role from importer, wholesaler, and retailer.",
          ],
        },
      ],
      callout:
        "Name one primary model for the first six months. Mixing distributor, retailer, and e-commerce on day one makes it hard to see which path paid for the freight.",
    },
    {
      heading: "What is the difference between an importer, a distributor, and a retailer?",
      paragraphs: [
        "Foreign brands often use these words as if they were the same Japanese company. They are different jobs. Some firms combine two of them. Many do not. Write the functions you need before you send a first email.",
      ],
      cards: [
        {
          title: "Importer",
          body: "Brings goods into Japan and is often the named party for clearance. An importer may or may not sell onward to retail. Import checks still depend on the product.",
        },
        {
          title: "Distributor",
          body: "Sells into trade accounts it already calls on. May import itself, or buy from an importer. The core job is the commercial relationship with Japanese buyers, not only freight.",
        },
        {
          title: "Retailer",
          body: "Buys for its own shelf or product page. Useful for a visible test. Not a substitute for a distributor if you need many doors or wholesale coverage.",
        },
      ],
      callout:
        "[Japan import requirements](" +
        EN_BLOG_IMPORT_REQUIREMENTS.path +
        ") cover what must be true before a first shipment can be sold. This page stays on who sells after the goods can land.",
    },
    {
      heading: "Which first SKU should you sell in Japan?",
      image: {
        id: "souvenirShop",
        alt: "Products on a Japanese shelf. First SKU choice drives whether a retail partner can say yes",
      },
      paragraphs: [
        "Selling products in Japan usually fails at assortment, not at brand fame. A full colorway or a 20-SKU range can exceed what a first distributor or retailer will risk. Choose the SKU that is easiest to explain, easiest to store, and closest to a price band you already see on similar Japanese shelves or product pages.",
        "If two sizes exist, start with the one that survives import and still looks normal next to local competitors. Keep a second SKU in reserve for a reorder, not for the opening invoice.",
      ],
      bullets: [
        "One hero SKU plus at most a small supporting set",
        "Pack size that fits Japanese retail shelves or parcel constraints",
        "Shelf life that still works after ocean or air freight",
        "A product story that does not depend on in-store staff",
      ],
    },
    {
      heading: "How should you set a wholesale price for Japan?",
      paragraphs: [
        "Japanese consumers see tax-included prices. Trade buyers think in remaining margin after their cost. If your wholesale idea was copied from a euro, dollar, or pound list, the Japan shelf price may land in a dead zone: too high for everyday, too low to look premium.",
        "Work backwards from a handful of real Japanese listings in your category, then subtract channel margin and a realistic landed cost. You do not need a perfect tariff calculation on this page. You do need a wholesale price a Japanese distributor or retailer can defend in an internal meeting. Pair that number with a first-order quantity you can actually ship. [MOQ for Japan market entry](" +
          EN_BLOG_MOQ.path +
          ") covers how test quantity and reorder quantity differ.",
      ],
    },
    {
      heading: "What MOQ should you set for Japanese buyers?",
      paragraphs: [
        "There is no honest single MOQ for Japan. Minimum order quantity depends on how you produce, how you pack, how the goods move, how long they last, and how a Japanese partner can sell the first lot. A factory carton count is not a Japan strategy.",
        "Set a test MOQ small enough to learn and large enough to ship without wasting freight. Keep a separate reorder quantity for if the first lot moves. If the only quantity you can offer is a full-year production run, say so early. Many Japanese buyers will pass rather than pretend they can take it.",
      ],
    },
    {
      heading: "How do you test the Japanese market before you scale?",
      paragraphs: [
        "A test can be a small wholesale drop to a distributor, a pop-in with a specialty retailer, or a limited e-commerce assortment. Define the window and the signal before you ship: sell-through, a second order, or a written request to reorder.",
        "Do not treat a quiet first month as proof that Japan is closed. It may mean the SKU, the season, or the channel was wrong. Change one variable at a time. The [complete Japan market entry guide](" +
          EN_BLOG_ENTER_JAPAN.path +
          ") covers launch sequence. The selling rule here is simpler: a test without a metric is just a shipment.",
      ],
      cta: {
        heading: "Need a Japanese sales partner?",
        body: "Explore BrandBridge and connect with potential Japanese business partners. Publish the SKU, wholesale price, and MOQ so the right companies can review them first.",
        primary: { href: "/en/register/maker", label: "List Your Brand" },
        secondary: { href: "/en/contact", label: "Contact BrandBridge" },
      },
    },
    {
      heading: "How can I find Japanese sales partners?",
      paragraphs: [
        "Finding a Japanese sales partner is easier when the selling model is already named. “Anyone in Japan who likes our brand” is not a brief. Say whether you need a distributor, a retailer, an e-commerce operator, or a local sales partner, then send a file a buyer can take to a meeting: first SKU, suggested retail range, wholesale price, MOQ, ship-from terms, and who would import.",
        "Look at companies already selling in your category. Trade shows, existing retail shelves, and introductions still matter. BrandBridge is built for the commercial object: overseas brands [list a product with wholesale conditions](/en/register/maker), and Japanese partners can review fit before outreach turns into a long email chain. You can also browse [Japan expansion opportunities](/en/cases) to see how other brands present terms.",
        "If the missing piece is coverage into many accounts, use [how to find a distributor in Japan](" +
          EN_BLOG_FIND_DISTRIBUTOR.path +
          "). If you want a specific banner or online retailer, use [how to find Japanese retailers](" +
          EN_BLOG_FIND_RETAILERS.path +
          "). If you are still choosing the role, start with [how to find a business partner in Japan](" +
          EN_BLOG_BUSINESS_PARTNER.path +
          ").",
      ],
    },
    {
      heading: "What does Japan market entry look like when you are ready to sell?",
      paragraphs: [
        "Selling products in Japan sits inside a short market-entry loop. Keep it basic here, then use the dedicated guides for the full sequence.",
      ],
      bullets: [
        "Confirm the product can be imported and sold in the intended channel",
        "Choose one selling model: distributor, retailer, e-commerce, or local sales partner",
        "Lock a first SKU, a Japan-ready wholesale price, and a test MOQ",
        "Find a Japanese partner who already works in that model and category",
        "Ship a first order with a sell-through or reorder metric",
        "Scale the channel that worked instead of adding every channel at once",
      ],
      callout:
        "For the full process map, use the [Japan market entry hub](/en/japan-market-entry) or the [complete market entry guide](" +
        EN_BLOG_ENTER_JAPAN.path +
        "). This article stays on how selling actually works once you are ready to choose a path.",
    },
    {
      heading: "Common mistakes foreign brands make when selling in Japan",
      paragraphs: [
        "Most failed first seasons are commercial, not mysterious. The product may be fine. The selling plan is not.",
      ],
      bullets: [
        "Emailing “distributors in Japan” before choosing a selling model",
        "Opening with a full home-market catalog instead of a first SKU",
        "Copying a home-market wholesale price without checking the Japan shelf",
        "Setting MOQ at factory minimum and calling it a Japan test",
        "Mixing retailer, distributor, and e-commerce on day one with no metric",
        "Offering exclusivity before a first order has taught you anything",
        "Treating an online listing as market entry without an importer of record",
      ],
    },
    {
      heading: "How BrandBridge helps you sell products in Japan",
      paragraphs: [
        "BrandBridge lets overseas brands list products with wholesale conditions that Japanese retail, wholesale, and e-commerce partners can read first. That supports selling products in Japan by making the commercial object visible. BrandBridge does not run stores, buy inventory, or place ads for you. Agreements stay between the two companies.",
        "Use [registration](/en/register/maker) to publish a listing. Use [contact](/en/contact) if you need a human answer before you publish. Review [live opportunities](/en/cases) to see how other brands present terms to Japanese partners.",
      ],
    },
  ],
  faqs: [
    {
      q: "How can a foreign company sell products in Japan?",
      a: "A foreign company can sell products in Japan through a Japanese distributor, retailer, e-commerce operator, or local sales partner. Many brands do this without opening a Japan entity. The workable path depends on category, wholesale price, MOQ, import requirements, and how much local selling support you need.",
    },
    {
      q: "Do I need a Japanese distributor?",
      a: "Not always. A distributor fits when you need trade coverage into accounts you cannot call on yourself. A retailer or e-commerce partner may be better for a first shelf or demand test. Choose the model before you search for a name.",
    },
    {
      q: "What is the difference between a distributor and an importer?",
      a: "An importer brings goods into Japan and is often the named party for clearance. A distributor sells into Japanese trade accounts. The same company may do both, but you should say which job you are hiring for. Import checks are covered in the [Japan import requirements](" +
        EN_BLOG_IMPORT_REQUIREMENTS.path +
        ") guide.",
    },
    {
      q: "Can foreign brands sell directly through e-commerce in Japan?",
      a: "Yes, often with a Japanese online retailer or a local operator. Direct-to-consumer from abroad can work for some parcels, but returns, page content, payment, and import responsibility still need a clear owner. E-commerce is a valid test; it is not automatically a full retail strategy.",
    },
    {
      q: "How should I set a wholesale price for Japan?",
      a: "Work backwards from comparable Japanese retail prices, then subtract channel margin and landed cost. Do not convert your home-market wholesale price and hope the shelf looks right. Japanese buyers need a number they can defend internally.",
    },
    {
      q: "What MOQ should I set for Japanese buyers?",
      a: "Set a test quantity small enough to learn and large enough to ship, then a separate reorder quantity. There is no single Japan MOQ. Factory minimums are a production constraint, not a market-entry plan.",
    },
    {
      q: "How can I find Japanese sales partners?",
      a: "Name the role you need, prepare first-SKU terms, and talk to companies already in your category. BrandBridge lets you list wholesale conditions so Japanese distributors, retailers, and e-commerce partners can review fit before they inquire.",
    },
  ],
  relatedSlugs: [
    EN_BLOG_ENTER_JAPAN.slug,
    EN_BLOG_IMPORT_REQUIREMENTS.slug,
    EN_BLOG_MOQ.slug,
    EN_BLOG_BUSINESS_PARTNER.slug,
    EN_BLOG_FIND_DISTRIBUTOR.slug,
    EN_BLOG_FIND_RETAILERS.slug,
  ],
  existingLinks: [...links],
  cta,
};
