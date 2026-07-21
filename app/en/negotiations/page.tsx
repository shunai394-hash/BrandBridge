import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NegotiationInbox } from "@/components/negotiations/NegotiationInbox";
import { getSessionUser } from "@/lib/auth";
import { negotiationInboxCopy } from "@/lib/negotiation-ui";
import { listNegotiationsForUser } from "@/lib/negotiations";

export const metadata: Metadata = {
  title: "Negotiations",
  description:
    "Your BrandBridge negotiation inbox. Open a conversation to reply and manage attachments.",
};

export const dynamic = "force-dynamic";

export default async function EnglishNegotiationsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/en/login?next=${encodeURIComponent("/en/negotiations")}`);
  }
  if (user.role === "admin") {
    redirect("/admin/negotiations");
  }
  if (user.role !== "maker" && user.role !== "partner") {
    redirect("/en/cases");
  }

  const items = await listNegotiationsForUser(user);
  const unread = items.filter((i) => (i.unreadCount ?? 0) > 0).length;
  const t = negotiationInboxCopy.en;
  const emptyHint =
    user.role === "maker" ? t.emptyHintMaker : t.emptyHintPartner;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16" lang="en">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          {t.title}
        </h1>
        <p className="mt-3 text-muted">{t.subtitle}</p>
        <p className="mt-2 text-sm text-navy">
          {t.countLabel(items.length)}
          {unread > 0 ? (
            <>
              {" · "}
              <span className="font-medium text-teal">
                {t.unreadThreads(unread)}
              </span>
            </>
          ) : null}
        </p>
      </header>
      <NegotiationInbox items={items} locale="en" emptyHint={emptyHint} />
    </div>
  );
}
