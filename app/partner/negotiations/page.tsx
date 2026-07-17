import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NegotiationInbox } from "@/components/negotiations/NegotiationInbox";
import { getSessionUser } from "@/lib/auth";
import { listNegotiationsForUser } from "@/lib/negotiations";

export const metadata: Metadata = {
  title: "交渉一覧（パートナー）",
  description: "申し込み済みの交渉スレッドをメール形式で確認できます。",
};

export const dynamic = "force-dynamic";

export default async function PartnerNegotiationsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/partner/negotiations");
  }
  if (user.role === "maker") {
    redirect("/maker/negotiations");
  }
  if (user.role !== "partner") {
    redirect("/admin/negotiations");
  }

  const items = await listNegotiationsForUser(user);
  const unread = items.filter((i) => (i.unreadCount ?? 0) > 0).length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          交渉一覧
        </h1>
        <p className="mt-3 text-muted">
          パートナー向けの交渉インボックスです。案件詳細から交渉を開始すると、メーカーとすぐにメッセージをやり取りできます。
        </p>
        <p className="mt-2 text-sm text-navy">
          交渉件数: <span className="font-medium">{items.length}</span>
          {unread > 0 ? (
            <>
              {" · "}
              未読スレッド:{" "}
              <span className="font-medium text-teal">{unread}</span>
            </>
          ) : null}
        </p>
      </header>
      <NegotiationInbox
        items={items}
        emptyHint="案件詳細から「交渉する」とここに表示されます。"
      />
    </div>
  );
}
