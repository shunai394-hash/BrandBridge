import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EnMakerSetupForm } from "@/components/forms/EnMakerSetupForm";
import { StaleEnMakerSetupGuard } from "@/components/forms/StaleEnMakerSetupGuard";
import { getSessionUser } from "@/lib/auth";
import { getProfileById } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "Product supplier setup",
  description:
    "Complete your company and product listing on BrandBridge to connect with Japanese sales partners.",
};

export const dynamic = "force-dynamic";

export default async function EnglishMakerSetupPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/en/maker/setup")}`);
  }
  if (user.role !== "maker") {
    redirect("/en/cases");
  }

  const profile = await getProfileById(user.id);

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16" lang="en">
      <StaleEnMakerSetupGuard />
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR OVERSEAS BRANDS · SETUP
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          List your product
        </h1>
        <p className="mt-3 text-muted">
          Complete your company profile and product details. Saved information
          stays linked to your BrandBridge account.
        </p>
      </header>
      <EnMakerSetupForm
        email={user.email}
        userId={user.id}
        initialCompanyName={profile?.company_name ?? ""}
        initialContactName={profile?.contact_name ?? ""}
        initialIndustry={profile?.industry ?? ""}
        initialCompanyOverview={profile?.description ?? ""}
      />
    </div>
  );
}
