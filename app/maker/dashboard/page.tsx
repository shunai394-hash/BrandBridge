import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getSessionUser } from "@/lib/auth";
import { listMyCases } from "@/lib/cases";
import { getProfileById } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "メーカー管理画面 | BrandBridge",
  description:
    "会社情報のセットアップ完了後、商品登録・商品一覧を管理できます。",
};

export const dynamic = "force-dynamic";

/** Japanese maker management home after company onboarding. */
export default async function MakerDashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/maker/dashboard");
  }
  if (!user.isMaker) {
    redirect("/cases");
  }

  const profile = await getProfileById(user.id);
  if (!profile?.onboarding_completed) {
    redirect("/maker/setup");
  }

  const myCases = await listMyCases();
  const companyName =
    profile.company_name?.trim() || user.companyName || "貴社";

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR MAKERS
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          メーカー管理画面
        </h1>
        <p className="mt-3 text-muted">
          {companyName} の会社情報セットアップは完了しています。商品は準備が
          できてから登録できます。
        </p>
      </header>

      <div className="mb-8 rounded-xl border border-border bg-surface px-5 py-5">
        <p className="text-sm text-muted">登録済み商品数</p>
        <p className="mt-1 font-[family-name:var(--font-shippori)] text-3xl text-navy">
          {myCases.length}
        </p>
      </div>

      <div className="space-y-3">
        <Button href="/maker/cases/new" className="w-full sm:w-auto">
          商品を登録する
        </Button>
        <div className="flex flex-wrap gap-3">
          <Button href="/maker/cases" variant="outline">
            商品一覧を見る
          </Button>
          <Button href="/cases" variant="outline">
            公開商品を見る
          </Button>
        </div>
        <p className="pt-2 text-sm text-muted">
          今は商品を登録しない場合は、そのまま{" "}
          <Link
            href="/maker/cases"
            className="font-medium text-teal hover:underline"
          >
            後で登録する
          </Link>
          こともできます。
        </p>
      </div>
    </div>
  );
}
