import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PartnerSetupForm } from "@/components/forms/PartnerSetupForm";
import { getSessionUser } from "@/lib/auth";
import { getProfileById } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "パートナープロフィール設定",
  description: "認証後の販売パートナープロフィール入力ページです。",
};

export const dynamic = "force-dynamic";

export default async function PartnerSetupPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/partner/setup");
  }
  if (user.role !== "partner") {
    redirect("/cases");
  }

  const profile = await getProfileById(user.id);
  if (profile?.onboarding_completed) {
    redirect("/cases?welcome=partner");
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR PARTNERS · SETUP
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          プロフィールを登録
        </h1>
        <p className="mt-3 text-muted">
          認証済みアカウントに紐づけて保存します。入力内容は消えません。
        </p>
      </header>
      <PartnerSetupForm email={user.email} userId={user.id} />
    </div>
  );
}
