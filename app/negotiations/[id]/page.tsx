import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { NegotiationDetail } from "@/components/negotiations/NegotiationDetail";
import { getSessionUser } from "@/lib/auth";
import { listMessages } from "@/lib/messages";
import { getNegotiationById } from "@/lib/negotiations";

type NegotiationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: NegotiationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return { title: "交渉詳細" };
  }

  const item = await getNegotiationById(id, user);
  return {
    title: item ? item.caseTitle : "交渉詳細",
  };
}

export default async function NegotiationDetailPage({
  params,
}: NegotiationDetailPageProps) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?next=/negotiations/${id}`);
  }

  const item = await getNegotiationById(id, user);
  if (!item) {
    notFound();
  }

  const messages =
    item.applicationStatus === "accepted"
      ? await listMessages(item.id, user.id)
      : [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <NegotiationDetail item={item} user={user} messages={messages} />
    </div>
  );
}
