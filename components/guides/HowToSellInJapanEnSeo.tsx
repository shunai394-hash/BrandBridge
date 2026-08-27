import Link from "next/link";

/**
 * EN-only SEO / education blocks for /en/how-to-sell-in-japan.
 * Kept separate so the Japanese guide UI stays unchanged.
 * Parent page role: how to sell in Japan overall (not how to find a distributor).
 */
export function HowToSellInJapanEnSeoEarly() {
  return (
    <>
      <section className="border-b border-black/8 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-center text-[11px] font-medium tracking-[0.22em] text-[#C4A35A] uppercase">
            SELLING PRODUCTS IN JAPAN
          </p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-shippori)] text-3xl text-black md:text-4xl">
            Selling Products in Japan: What Overseas Brands Need to Decide
          </h2>
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-black/65 md:text-base">
            <p>
              If you are asking how do I sell in Japan, start with the commercial
              model, not only with finding a contact. Selling products in Japan
              usually means choosing who sells, who imports, and which channels
              you will enter first.
            </p>
            <p>
              Many overseas brands sell to Japan without opening a local company.
              Instead, they work with a Japanese sales partner who already
              understands local buyers, logistics, and retail or ecommerce
              expectations. For a broader map of entry options, see{" "}
              <Link
                href="/en/japan-market-entry"
                className="font-medium text-[#C4A35A] hover:underline"
              >
                Japan Market Entry
              </Link>
              .
            </p>
            <p>
              BrandBridge is built for that path: list your product with clear
              terms, then connect with Japanese partners who can evaluate fit
              before outreach turns into endless email. When you are ready to
              begin,{" "}
              <Link
                href="/en/register/maker"
                className="font-medium text-[#C4A35A] hover:underline"
              >
                List Your Brand
              </Link>{" "}
              and publish the commercial details partners need.
            </p>
          </div>
          <ul className="mt-8 space-y-3 rounded-2xl border border-black/8 bg-[#FAFAF8] p-5 md:p-6">
            {[
              "Decide whether you need a distributor, importer, wholesaler, retailer, or ecommerce partner",
              "Prepare wholesale price, MOQ, shipping terms, and exclusivity options",
              "Start with a controlled first order rather than a nationwide launch",
              "Use a structured marketplace when you are ready to meet partners",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-black/70 md:text-base"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C4A35A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-black/8 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-center text-[11px] font-medium tracking-[0.22em] text-[#C4A35A] uppercase">
            JAPANESE DISTRIBUTOR AND PARTNER TYPES
          </p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-shippori)] text-3xl text-black md:text-4xl">
            When a Japanese Distributor Fits and When Another Partner Is Better
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-black/60 md:text-base">
            A Japanese distributor is one common option for selling in Japan, but
            it is not the only model. Choose the partner type based on inventory,
            channel access, and how much local sales work you need. Partner
            models are also summarized in{" "}
            <Link
              href="/en/japan-market-entry"
              className="font-medium text-[#C4A35A] hover:underline"
            >
              Japan Market Entry
            </Link>
            .
          </p>

          <div className="mt-10 space-y-5">
            {[
              {
                title: "Japanese distributor",
                body: "Often fits when you need import support, inventory handling, and sales into retail or wholesale channels. Useful when you want a partner who can develop the market locally over time.",
              },
              {
                title: "Importer / wholesaler",
                body: "Can fit when you need a Japan-side company to bring goods in and supply retailers or regional buyers, especially if you are not ready to manage local inventory yourself.",
              },
              {
                title: "Sales agent",
                body: "Can fit when you want introductions and local negotiation support without handing over inventory ownership. Better when you can ship and invoice under clearer brand-controlled terms.",
              },
              {
                title: "Retailer (direct)",
                body: "May fit specialty or department retail when your brand already has proof of demand and can support retail pricing, packaging, and replenishment expectations.",
              },
              {
                title: "Ecommerce partner",
                body: "Often useful for controlled market testing online before wider retail expansion. Helpful when you want sell-through data before committing to broader distribution.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-6"
              >
                <h3 className="font-[family-name:var(--font-shippori)] text-xl text-black">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-black/65 md:text-base">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-black/60 md:text-base">
            When you select Japanese sales partners, also review what buyers
            typically look for. The{" "}
            <Link
              href="/en/japan-partner-demand-snapshot"
              className="font-medium text-[#C4A35A] hover:underline"
            >
              Japan Partner Demand Snapshot
            </Link>{" "}
            summarizes how partners evaluate overseas brands across categories.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-black/60 md:text-base">
            This page explains how selling in Japan works overall, including when
            a distributor, importer, wholesaler, retailer, or ecommerce partner
            may fit. For the practical search process once a distributor is the
            right model, read{" "}
            <Link
              href="/en/japan-market-entry/how-to-find-japanese-distributors"
              className="font-medium text-[#C4A35A] hover:underline"
            >
              How to Find Japanese Distributors
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-b border-black/8 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-center text-[11px] font-medium tracking-[0.22em] text-[#C4A35A] uppercase">
            SELLING ONLINE IN JAPAN
          </p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-shippori)] text-3xl text-black md:text-4xl">
            Selling Online in Japan: Ecommerce as a First Channel
          </h2>
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-black/65 md:text-base">
            <p>
              Selling online in Japan is often the most practical first step for
              overseas brands that want sell-through data before a wider retail
              or distributor rollout. A Japanese ecommerce partner can evaluate
              your wholesale price, MOQ, and shipping terms the same way a
              retailer would—then place a controlled first order.
            </p>
            <p>
              Online is still a sales channel with Japanese partner expectations:
              clear product information, realistic first-order quantities, and
              packaging that can support customer service. It is not only a
              marketing website launch from overseas.
            </p>
            <p>
              Many brands combine ecommerce with specialty retail later. For the
              wider entry map—including distributors and retailers—see{" "}
              <Link
                href="/en/japan-market-entry"
                className="font-medium text-[#C4A35A] hover:underline"
              >
                Japan Market Entry
              </Link>
              .
            </p>
          </div>
          <ul className="mt-8 space-y-3 rounded-2xl border border-black/8 bg-[#FAFAF8] p-5 md:p-6">
            {[
              "Use ecommerce to test demand with a limited SKU set",
              "Confirm who handles import, warehousing, and customer returns",
              "Align online price presentation with any future retail partners",
              "Review sell-through before expanding territory or exclusivity",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-black/70 md:text-base"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C4A35A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/en/register/maker"
              className="inline-flex items-center justify-center rounded-md bg-[#C4A35A] px-6 py-3 text-sm font-medium text-black transition hover:bg-[#d4b56e]"
            >
              List Your Brand
            </Link>
            <Link
              href="/en/cases"
              className="inline-flex items-center justify-center rounded-md border border-black/15 bg-white px-6 py-3 text-sm font-medium text-black transition hover:border-black/30"
            >
              Browse English Listings
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-black/8 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-center text-[11px] font-medium tracking-[0.22em] text-[#C4A35A] uppercase">
            BRAND EXAMPLES
          </p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-shippori)] text-3xl text-black md:text-4xl">
            See How Brands Present Themselves for Japan
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-black/65 md:text-base">
            Before you sell products in Japan, it helps to see how overseas
            brands present assortment, positioning, and commercial readiness for
            Japanese partners. Browse{" "}
            <Link
              href="/en/product-showcase"
              className="font-medium text-[#C4A35A] hover:underline"
            >
              Featured Brands
            </Link>{" "}
            to explore brand examples, then return here when you are ready to
            choose a selling model and{" "}
            <Link
              href="/en/register/maker"
              className="font-medium text-[#C4A35A] hover:underline"
            >
              List Your Brand
            </Link>
            .
          </p>
          <p className="mt-4 text-center">
            <Link
              href="/en/product-showcase"
              className="inline-flex items-center justify-center rounded-md border border-black/15 bg-[#FAFAF8] px-6 py-3 text-sm font-medium text-black transition hover:border-black/30"
            >
              Explore Brands
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

export function HowToSellInJapanEnSeoLate() {
  return (
    <>
      <section className="border-b border-black/8 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-center text-[11px] font-medium tracking-[0.22em] text-[#C4A35A] uppercase">
            COMMERCIAL PREPARATION
          </p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-shippori)] text-3xl text-black md:text-4xl">
            Terms Japanese Partners Usually Want to See
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-black/60 md:text-base">
            Before you sell to Japan, prepare commercial details partners can
            review quickly. Clear terms reduce back-and-forth and help both sides
            judge fit early. For a partner-side view of priorities, see the{" "}
            <Link
              href="/en/japan-partner-demand-snapshot"
              className="font-medium text-[#C4A35A] hover:underline"
            >
              Japan Partner Demand Snapshot
            </Link>
            .
          </p>
          <ul className="mt-8 space-y-3">
            {[
              {
                label: "Wholesale price",
                detail:
                  "A price band or quote basis that leaves room for Japanese channel margins.",
              },
              {
                label: "MOQ",
                detail:
                  "A minimum order quantity that can support a first test order, not only a full launch.",
              },
              {
                label: "Shipping and Incoterms",
                detail:
                  "Who arranges freight, insurance, and delivery milestones. The Incoterms cards above cover common options.",
              },
              {
                label: "Import responsibility",
                detail:
                  "In many partnerships, the Japanese side handles import procedures. Confirm this before the first shipment.",
              },
              {
                label: "Exclusivity",
                detail:
                  "Nationwide exclusivity is not always required. Scope by channel, region, and review period when needed.",
              },
              {
                label: "Payment terms",
                detail:
                  "Wire, Wise, or other methods both companies can operate with in practice.",
              },
            ].map((item) => (
              <li
                key={item.label}
                className="rounded-2xl border border-black/8 bg-white p-5 md:p-6"
              >
                <h3 className="font-[family-name:var(--font-shippori)] text-lg text-black">
                  {item.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/65">
                  {item.detail}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-black/45 md:text-sm">
            Import duties, taxes, labeling, and product regulations vary by
            product and category. This guide is practical orientation, not legal
            or tax advice. Confirm requirements with your Japanese partner or
            qualified advisors for your category.
          </p>
        </div>
      </section>

      <section className="border-b border-black/8 bg-white py-12 md:py-14">
        <div className="mx-auto max-w-3xl px-5 text-sm leading-relaxed text-black/65 md:text-base">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-black md:text-3xl">
            Related Japan Market Entry Guides
          </h2>
          <ul className="mt-6 space-y-3">
            <li>
              <Link
                href="/en/blog/how-to-enter-the-japanese-market"
                className="font-medium text-[#C4A35A] hover:underline"
              >
                How to Enter the Japanese Market
              </Link>
              <span className="text-black/50">
                {" "}
                - complete guide for foreign brands
              </span>
            </li>
            <li>
              <Link
                href="/en/blog/how-to-sell-products-in-japan"
                className="font-medium text-[#C4A35A] hover:underline"
              >
                How to Sell Products in Japan
              </Link>
              <span className="text-black/50">
                {" "}
                - selling models, first SKU, and retail tests
              </span>
            </li>
            <li>
              <Link
                href="/en/japan-market-entry"
                className="font-medium text-[#C4A35A] hover:underline"
              >
                Japan Market Entry
              </Link>
              <span className="text-black/50">
                {" "}
                - overview for overseas brands entering Japan
              </span>
            </li>
            <li>
              <Link
                href="/en/japan-partner-demand-snapshot"
                className="font-medium text-[#C4A35A] hover:underline"
              >
                Japan Partner Demand Snapshot
              </Link>
              <span className="text-black/50">
                {" "}
                - what Japanese sales partners look for
              </span>
            </li>
            <li>
              <Link
                href="/en/product-showcase"
                className="font-medium text-[#C4A35A] hover:underline"
              >
                Featured Brands
              </Link>
              <span className="text-black/50">
                {" "}
                - brand examples for the Japan market
              </span>
            </li>
            <li>
              <Link
                href="/en/japan-market-entry/how-to-find-japanese-distributors"
                className="font-medium text-[#C4A35A] hover:underline"
              >
                How to Find Japanese Distributors
              </Link>
              <span className="text-black/50">
                {" "}
                - identify, research, and approach distributor candidates
              </span>
            </li>
            <li>
              <Link
                href="/en/japan-market-entry/how-to-find-japanese-retailers"
                className="font-medium text-[#C4A35A] hover:underline"
              >
                How to Find Japanese Retailers for Your Brand
              </Link>
              <span className="text-black/50">
                {" "}
                - when retail partners are the next step
              </span>
            </li>
            <li>
              <Link
                href="/en/register/maker"
                className="font-medium text-[#C4A35A] hover:underline"
              >
                List Your Brand
              </Link>
              <span className="text-black/50">
                {" "}
                - start selling in Japan on BrandBridge
              </span>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
