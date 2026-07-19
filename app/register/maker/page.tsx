import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthRegisterForm } from "@/components/forms/AuthRegisterForm";
import { getSessionUser } from "@/lib/auth";
import { getProfileById } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "商品を広げたい事業者として登録",
  description:
    "BrandBridgeへ商品を広げたい事業者として登録。メール認証後に会社・商品情報を入力します。",
};

export const dynamic = "force-dynamic";

export default async function MakerRegisterPage() {
  const user = await getSessionUser();
  if (user) {
    if (user.role === "maker") {
      const profile = await getProfileById(user.id);
      if (profile?.onboarding_completed) {
        redirect("/maker/registration-complete");
      }
      redirect("/maker/setup");
    }
    redirect("/cases");
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR MAKERS
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          商品を広げたい事業者として登録
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          メールまたは Google でアカウントを作成します。認証後に会社情報・商品情報を入力します（認証前のデータ保存はありません）。
        </p>
        <p className="mt-2 text-sm text-muted">
          まだ検討中の方は{" "}
          <Link href="/for-makers" className="text-teal hover:underline">
            商品提供事業者向けページ
          </Link>
          をご覧ください。
        </p>
      </header>
      <AuthRegisterForm role="maker" setupPath="/maker/setup" />
    </div>
  );
}
