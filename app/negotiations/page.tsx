import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { negotiationsListPath } from "@/lib/negotiation-paths";

export const metadata: Metadata = {
  title: "交渉管理",
  description: "交渉一覧へ移動します。",
};

export const dynamic = "force-dynamic";

/** Shared entry → role-specific inbox */
export default async function NegotiationsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/negotiations");
  }
  redirect(negotiationsListPath(user.role));
}
