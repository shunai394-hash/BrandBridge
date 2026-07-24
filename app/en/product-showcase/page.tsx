import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Featured Brands | BrandBridge",
  description:
    "BrandBridge is onboarding founding international brands for Japan. List your brand for qualified Japanese distributors and retailers.",
};

export default function EnglishProductShowcasePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <p className="text-xs font-medium tracking-wider text-teal">
        FEATURED BRANDS
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
        Featured Brands
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        We&apos;re currently onboarding founding brands.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Join the Founding Manufacturer Program and list your products for
        qualified Japanese distributors, retailers, wholesalers, and e-commerce
        partners.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button href="/en/register/maker" className="w-full sm:w-auto">
          List Your Brand
        </Button>
        <Button
          href="/en/how-to-sell-in-japan"
          variant="outline"
          className="w-full sm:w-auto"
        >
          Learn How It Works
        </Button>
      </div>
      <p className="mt-10 text-sm text-muted">
        <Link href="/en" className="text-teal hover:underline">
          ← Back to English home
        </Link>
      </p>
    </div>
  );
}
