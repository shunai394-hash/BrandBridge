import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Partner Inquiry",
  description:
    "Contact BrandBridge about becoming a sales partner for overseas brands in Japan.",
};

/**
 * English partner entry. Full partner onboarding remains Japanese-only for now;
 * this page keeps English navigation on /en/* without linking to /register/partner.
 */
export default function EnglishPartnerRegisterPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-12 md:py-16" lang="en">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR PARTNERS
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          Partner Inquiry
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          Interested in distributing overseas brands in Japan? Tell us about
          your channels and we will follow up.
        </p>
      </header>
      <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
        <p className="text-sm leading-relaxed text-muted">
          Partner self-registration is currently available in Japanese. English
          speakers can contact BrandBridge directly and we will guide the next
          steps.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/en/contact" className="w-full sm:w-auto">
            Contact BrandBridge
          </Button>
          <Button href="/en/cases" variant="outline" className="w-full sm:w-auto">
            Browse products
          </Button>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted">
        Japanese partner registration:{" "}
        <Link href="/register/partner" className="text-teal hover:underline">
          Japanese partner registration
        </Link>
      </p>
    </div>
  );
}
