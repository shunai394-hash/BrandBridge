import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Connect global brands with Japanese sales partners",
  description:
    "BrandBridge helps overseas brands find distributors, retailers, and sales partners in Japan. Display product information and sales conditions, then start business discussions directly.",
};

const features = [
  {
    title: "Find Japanese business partners",
    body: "Connect with distributors, retailers, and sales partners looking for new products in Japan.",
  },
  {
    title: "Display product information and sales conditions",
    body: "Share MOQ, wholesale pricing, exclusivity, and other terms so partners can evaluate fit before contacting you.",
  },
  {
    title: "Start business discussions directly",
    body: "Move from discovery to inquiry and negotiation in one B2B platform—not introductions that stop at a referral.",
  },
] as const;

export default function EnglishHomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(26,138,138,0.35),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(20,111,111,0.25),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <p className="text-xs font-medium tracking-wider text-teal">
            FOR OVERSEAS BRANDS
          </p>
          <p className="mt-5 font-[family-name:var(--font-shippori)] text-[2.5rem] leading-none tracking-wide text-white sm:text-5xl md:text-6xl">
            BrandBridge
          </p>
          <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-shippori)] text-[1.45rem] leading-[1.4] text-white sm:text-3xl md:mt-8 md:text-4xl">
            Connect global brands with Japanese sales partners.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            BrandBridge helps overseas brands find distributors, retailers, and
            sales partners in Japan.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
            Enter the Japanese market with clear product information, sales
            conditions, and a path to negotiate with the right partners.
          </p>
          <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              href="/en/register/maker"
              className="w-full px-6 py-3.5 text-base shadow-[0_12px_32px_rgba(26,138,138,0.45)] sm:w-auto"
            >
              Register Your Product
            </Button>
            <Button
              href="/en/cases"
              variant="outline"
              className="w-full border-white/40 px-6 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              Browse Listings
            </Button>
            <Button
              href="/en/contact"
              variant="outline"
              className="w-full border-white/40 px-6 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              Contact Us
            </Button>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium tracking-wide text-teal">
              How does it work?
            </p>
            <Link
              href="/en/how-to-sell-in-japan"
              className="mt-1 inline-flex text-sm text-white/85 underline-offset-4 transition hover:text-white hover:underline"
            >
              Learn how to sell in Japan
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <div className="max-w-2xl rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              New to selling in Japan?
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              Learn how to connect with Japanese sales partners and start
              selling.
            </p>
            <div className="mt-6">
              <Button
                href="/en/how-to-sell-in-japan"
                className="w-full sm:w-auto"
              >
                Learn How to Sell in Japan
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Built for market entry into Japan
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            BrandBridge is a B2B matching and negotiation platform for product
            suppliers and Japanese sales partners—helping you explore
            distribution, retail, and partner channels with visible terms.
          </p>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-border bg-white px-5 py-6"
              >
                <h3 className="font-medium text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Sales partner discovery &amp; deal management
          </h2>
          <div className="mt-6 max-w-2xl space-y-4 text-sm leading-relaxed text-muted md:text-base">
            <p>
              List your products so Japanese partners can review category,
              conditions, and fit before reaching out.
            </p>
            <p>
              When interest aligns, continue discussions and negotiation
              management on the platform—from first contact toward commercial
              next steps.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 50%, rgba(26,138,138,0.55), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(20,111,111,0.35), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl leading-snug md:text-3xl">
            Ready to introduce your brand to Japan?
          </h2>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              href="/en/register/maker"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[200px]"
            >
              Register Your Product
            </Button>
            <Button
              href="/en/contact"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-[160px]"
            >
              Contact Us
            </Button>
          </div>
          <p className="mt-6 text-sm text-white/65">
            <Link href="/" className="underline-offset-2 hover:underline">
              Back to Japanese home
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
