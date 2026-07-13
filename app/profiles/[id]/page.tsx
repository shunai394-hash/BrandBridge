import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profiles/ProfileView";
import { getSessionUser } from "@/lib/auth";
import { listOpenCasesByMaker } from "@/lib/cases";
import { getProfileById, toPublicProfile } from "@/lib/profiles";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) {
    return { title: "プロフィール" };
  }
  return {
    title: profile.company_name,
    description: profile.description ?? `${profile.company_name} のプロフィール`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const profile = await getProfileById(id);

  if (!profile) {
    notFound();
  }

  const user = await getSessionUser();
  const openCases =
    profile.role === "maker" ? await listOpenCasesByMaker(profile.id, 5) : [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <ProfileView
        profile={toPublicProfile(profile)}
        openCases={openCases}
        isOwner={user?.id === profile.id}
      />
    </div>
  );
}
