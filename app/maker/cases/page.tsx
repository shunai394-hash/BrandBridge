import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MakerCaseList } from "@/components/maker/MakerCaseList";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { listMyCases } from "@/lib/cases";

export const metadata: Metadata = {
  title: "マイ商品",
  description: "登録した商品の一覧・編集・取り下げ",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MakerCasesPage() {
  noStore();
  const hdrs = await headers();
  const uiProbe =
    process.env.NODE_ENV === "development" &&
    hdrs.get("x-bb-admin-ui-probe") === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !uiProbe) {
    redirect("/login?next=/maker/cases");
  }

  const items = uiProbe && !user ? [] : await listMyCases();

  return (
    <div
      className="mx-auto max-w-6xl px-5 py-12 md:py-16"
      data-maker-cases-page="sku-v2"
    >
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
            マイ商品
          </h1>
          <p className="mt-2 text-sm text-muted">
            登録商品の管理（{items.length}{" "}
            件）。先頭列は商品番号（SKU）です。
          </p>
        </div>
        <Button href="/maker/cases/new">新規登録</Button>
      </header>
      <MakerCaseList key="maker-list-sku-v2" items={items} />
    </div>
  );
}
