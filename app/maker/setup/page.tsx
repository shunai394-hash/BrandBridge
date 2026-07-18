import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MakerSetupForm } from "@/components/forms/MakerSetupForm";
import { getSessionUser } from "@/lib/auth";
import { getProfileById } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "メーカー情報の設定",
  description: "認証後のメーカー情報・商品の入力ページです。",
};

export const dynamic = "force-dynamic";

export default async function MakerSetupPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/maker/setup");
  }
  if (user.role !== "maker") {
    redirect("/cases");
  }

  const profile = await getProfileById(user.id);
  if (profile?.onboarding_completed) {
    redirect("/maker/registration-complete");
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR MAKERS · SETUP
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          メーカー情報・商品を登録
        </h1>
        <p className="mt-3 text-muted">
          認証済みアカウントに紐づけて保存します。入力内容は消えません。
        </p>
      </header>
      <MakerSetupForm email={user.email} userId={user.id} />
    </div>
  );
}
