import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { NegotiationDetail } from "@/components/negotiations/NegotiationDetail";
import { getSessionUser } from "@/lib/auth";
import { listMessages } from "@/lib/messages";
import {
  getNegotiationById,
  markNegotiationRead,
} from "@/lib/negotiations";

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
    return { title: "Negotiation" };
  }

  const item = await getNegotiationById(id, user);
  if (!item) return { title: "Negotiation" };
  return {
    title: item.topic,
  };
}

export default async function EnglishNegotiationDetailPage({
  params,
}: NegotiationDetailPageProps) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/en/login?next=${encodeURIComponent(`/en/negotiations/${id}`)}`);
  }

  const item = await getNegotiationById(id, user);
  if (!item) {
    notFound();
  }

  await markNegotiationRead(item.id, user.id);

  const messages = await listMessages(item.id, user.id);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16" lang="en">
      <NegotiationDetail
        item={item}
        user={user}
        messages={messages}
        locale="en"
      />
    </div>
  );
}
