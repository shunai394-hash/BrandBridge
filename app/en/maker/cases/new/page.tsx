import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EnCaseCreateForm } from "@/components/forms/EnCaseCreateForm";
import { getSessionUser } from "@/lib/auth";
import { getProfileById } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "Register a Product | BrandBridge",
  description:
    "Register a product listing for Japanese sales partners on BrandBridge.",
};

export const dynamic = "force-dynamic";

export default async function EnglishNewCasePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/en/login?next=${encodeURIComponent("/en/maker/cases/new")}`);
  }
  if (user.role !== "maker") {
    redirect("/en/cases");
  }

  const profile = await getProfileById(user.id);
  if (!profile?.onboarding_completed) {
    redirect("/en/maker/setup");
  }

  const companyName =
    profile.company_name?.trim() || user.companyName || "your company";

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16" lang="en">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR OVERSEAS BRANDS · PRODUCT
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          Register a product
        </h1>
        <p className="mt-3 text-muted">
          List a product for {companyName}. Japanese partners can review your
          commercial terms after submission.
        </p>
      </header>
      <EnCaseCreateForm
        email={user.email}
        userId={user.id}
        companyName={companyName}
      />
    </div>
  );
}
