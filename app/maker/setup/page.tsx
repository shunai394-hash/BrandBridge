import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MakerSetupForm } from "@/components/forms/MakerSetupForm";
import { getSessionUser } from "@/lib/auth";
import { getProfileById } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "商品提供企業情報の設定",
  description: "認証後の商品提供企業情報の入力ページです。",
};

export const dynamic = "force-dynamic";

export default async function MakerSetupPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/maker/setup");
  }

  const profile = await getProfileById(user.id);
  // Completed makers go to dashboard; product registration is /maker/cases/new.
  if (user.isMaker && profile?.onboarding_completed) {
    redirect("/maker/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR MAKERS · SETUP
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          会社情報を登録
        </h1>
        <p className="mt-3 text-muted">
          会社情報を登録して初回セットアップを完了します。商品はセットアップ完了後に登録できます。
        </p>
      </header>
      <MakerSetupForm
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
