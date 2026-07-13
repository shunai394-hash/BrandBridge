import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NegotiationList } from "@/components/negotiations/NegotiationList";
import { getSessionUser } from "@/lib/auth";
import { listNegotiationsForUser } from "@/lib/negotiations";

export const metadata: Metadata = {
  title: "交渉管理",
  description: "交渉の一覧とステータスを確認できます。",
};

export const dynamic = "force-dynamic";

export default async function NegotiationsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/negotiations");
  }

  const items = await listNegotiationsForUser(user);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          交渉管理
        </h1>
        <p className="mt-3 text-muted">
          {user.role === "maker"
            ? "自社案件への交渉申込を確認し、承認・却下できます。"
            : "申し込み済みの交渉と、承認後のメッセージを確認できます。"}
        </p>
      </header>
      <NegotiationList items={items} />
    </div>
  );
}
