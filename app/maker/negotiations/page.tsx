import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NegotiationInbox } from "@/components/negotiations/NegotiationInbox";
import { getSessionUser } from "@/lib/auth";
import { listNegotiationsForUser } from "@/lib/negotiations";

export const metadata: Metadata = {
  title: "交渉一覧 | BrandBridge",
  description: "メーカー向けの交渉一覧です。",
};

export const dynamic = "force-dynamic";

export default async function MakerNegotiationsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/maker/negotiations");
  }
  if (!user.isMaker) {
    if (user.isPartner) {
      redirect("/partner/negotiations");
    }
    redirect("/admin/negotiations");
  }

  const items = await listNegotiationsForUser(user);
  const unread = items.filter((i) => (i.unreadCount ?? 0) > 0).length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          莠､貂我ｸ隕ｧ
        </h1>
        <p className="mt-3 text-muted">
          蝠・刀謠蝉ｾ帑ｼ∵･ｭ蜷代￠縺ｮ莠､貂峨う繝ｳ繝懊ャ繧ｯ繧ｹ縺ｧ縺吶ゅせ繝ｬ繝・ラ繧帝幕縺・※霑比ｿ｡繝ｻ豺ｻ莉倥〒縺阪∪縺吶・        </p>
        <p className="mt-2 text-sm text-navy">
          莠､貂我ｻｶ謨ｰ: <span className="font-medium">{items.length}</span>
          {unread > 0 ? (
            <>
              {" ﾂｷ "}
              譛ｪ隱ｭ繧ｹ繝ｬ繝・ラ:{" "}
              <span className="font-medium text-teal">{unread}</span>
            </>
          ) : null}
        </p>
      </header>
      <NegotiationInbox
        items={items}
        emptyHint="パートナーからの申請があると、ここに表示されます。" />
    </div>
  );
}



