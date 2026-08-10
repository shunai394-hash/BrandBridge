import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getSessionUser } from "@/lib/auth";
import { listMyCases } from "@/lib/cases";
import { getProfileById } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "Maker Dashboard | BrandBridge",
  description:
    "Manage your BrandBridge company profile and product listings for Japanese partners.",
};

export const dynamic = "force-dynamic";

/** English maker management home after company onboarding. */
export default async function EnglishMakerDashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/en/login?next=${encodeURIComponent("/en/maker/dashboard")}`);
  }
  if (user.role !== "maker") {
    redirect("/en/cases");
  }

  const profile = await getProfileById(user.id);
  if (!profile?.onboarding_completed) {
    redirect("/en/maker/setup");
  }

  const myCases = await listMyCases();
  const companyName = profile.company_name?.trim() || user.companyName || "your company";

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16" lang="en">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR OVERSEAS BRANDS
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          Maker Dashboard
        </h1>
        <p className="mt-3 text-muted">
          Company setup is complete for {companyName}. Register a product when
          you are ready, or explore your listings anytime.
        </p>
      </header>

      <div className="mb-8 rounded-xl border border-border bg-surface px-5 py-5">
        <p className="text-sm text-muted">Products registered</p>
        <p className="mt-1 font-[family-name:var(--font-shippori)] text-3xl text-navy">
          {myCases.length}
        </p>
      </div>

      <div className="space-y-3">
        <Button href="/en/maker/cases/new" className="w-full sm:w-auto">
          Register a product
        </Button>
        <div className="flex flex-wrap gap-3">
          <Button href="/en/maker/cases" variant="outline">
            View products
          </Button>
          <Button href="/en/cases" variant="outline">
            Browse English listings
          </Button>
        </div>
        <p className="pt-2 text-sm text-muted">
          Prefer to add products later? You can stay here and{" "}
          <Link href="/en/maker/cases" className="font-medium text-teal hover:underline">
            register later
          </Link>{" "}
          from My Products whenever you are ready.
        </p>
      </div>
    </div>
  );
}
