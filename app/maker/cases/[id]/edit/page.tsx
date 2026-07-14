import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CaseEditForm } from "@/components/forms/CaseEditForm";
import { getCaseById } from "@/lib/cases";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const caseItem = await getCaseById(id);
  return { title: caseItem ? `編集: ${caseItem.title}` : "案件編集" };
}

export default async function MakerCaseEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/maker/cases/${id}/edit`);
  }

  const caseItem = await getCaseById(id);
  if (!caseItem) notFound();

  // Ownership: maker_id = auth.uid() only
  if (caseItem.makerId !== user.id) {
    redirect("/maker/cases");
  }

  if (caseItem.reviewStatus === "withdrawn") {
    redirect("/maker/cases");
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12 md:py-16">
      <Link href="/maker/cases" className="text-sm text-teal hover:underline">
        ← マイ案件
      </Link>
      <header className="mb-8 mt-4">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          案件を編集
        </h1>
        <p className="mt-2 text-sm text-muted font-mono">{caseItem.id}</p>
      </header>
      <CaseEditForm caseItem={caseItem} />
    </div>
  );
}
