import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MakerCaseList } from "@/components/maker/MakerCaseList";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { listMyCases } from "@/lib/cases";

export const metadata: Metadata = {
  title: "マイ案件",
  description: "登録した案件の一覧・編集・取り下げ",
};

export const dynamic = "force-dynamic";

export default async function MakerCasesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/maker/cases");
  }

  const items = await listMyCases();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
            マイ案件
          </h1>
          <p className="mt-2 text-sm text-muted">
            登録案件の管理（{items.length} 件）。案件番号で問い合わせ・サポート対応できます。
          </p>
        </div>
        <Button href="/maker/cases/new">新規登録</Button>
      </header>
      <MakerCaseList items={items} />
    </div>
  );
}
