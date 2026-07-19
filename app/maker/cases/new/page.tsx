import type { Metadata } from "next";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { CaseCreateForm } from "@/components/forms/CaseCreateForm";
import { StaleMakerCreateFormGuard } from "@/components/forms/StaleMakerCreateFormGuard";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "商品を登録",
  description: "商品提供企業向け商品登録ページです。",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewCasePage() {
  noStore();
  const hdrs = await headers();
  const uiProbe =
    process.env.NODE_ENV === "development" &&
    hdrs.get("x-bb-admin-ui-probe") === "1";

  const user = await getSessionUser();

  if (!user && !uiProbe) {
    redirect("/login?next=/maker/cases/new");
  }

  if (user && user.role !== "maker" && !uiProbe) {
    redirect("/cases");
  }

  const companyName = user?.companyName ?? "確認用商品提供企業";

  return (
    <div
      className="mx-auto max-w-xl px-5 py-12 md:py-16"
      data-maker-create-page="product-v6"
    >
      <StaleMakerCreateFormGuard />
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          商品を登録
        </h1>
        <p className="mt-3 text-muted">
          {companyName} として、販売パートナー向けの商品を公開します。
        </p>
      </header>
      <CaseCreateForm />
    </div>
  );
}
