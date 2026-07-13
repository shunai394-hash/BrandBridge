import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CaseCreateForm } from "@/components/forms/CaseCreateForm";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "案件を登録",
  description: "メーカー向け案件登録ページです。",
};

export const dynamic = "force-dynamic";

export default async function NewCasePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?next=/maker/cases/new");
  }

  if (user.role !== "maker") {
    redirect("/cases");
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          案件を登録
        </h1>
        <p className="mt-3 text-muted">
          {user.companyName} として、販売パートナー向けの案件を公開します。
        </p>
      </header>
      <CaseCreateForm />
    </div>
  );
}
