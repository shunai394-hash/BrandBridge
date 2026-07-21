import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EnMakerRegisterForm } from "@/components/forms/EnMakerRegisterForm";
import { getSessionUser } from "@/lib/auth";
import { getProfileById } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "Register Your Product",
  description:
    "Register your brand and product information to find Japanese sales partners on BrandBridge.",
};

export const dynamic = "force-dynamic";

export default async function EnglishMakerRegisterPage() {
  const user = await getSessionUser();
  if (user) {
    if (user.role === "maker") {
      const profile = await getProfileById(user.id);
      if (profile?.onboarding_completed) {
        redirect("/en/products");
      }
      // English register success path: always continue to English maker setup.
      redirect("/en/maker/setup");
    }
    // Logged-in non-maker: keep form available so they can switch accounts;
    // do not send English registration traffic to /cases.
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR OVERSEAS BRANDS
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          Register Your Product
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          Register your brand and product information to find Japanese sales
          partners.
        </p>
        <p className="mt-2 text-sm text-muted">
          Prefer to ask first?{" "}
          <Link href="/en/contact" className="text-teal hover:underline">
            Contact BrandBridge
          </Link>
        </p>
      </header>
      <EnMakerRegisterForm />
      <p className="mt-8 text-sm text-muted">
        Japanese registration:{" "}
        <Link href="/register/maker" className="text-teal hover:underline">
          Japanese supplier registration
        </Link>
      </p>
    </div>
  );
}
