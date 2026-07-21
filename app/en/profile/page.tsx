import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/profiles/ProfileEditForm";
import { getSessionUser } from "@/lib/auth";
import { enProfileCopy } from "@/lib/en-account-ui";
import { getProfileById } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "My Profile",
  description: enProfileCopy.subtitle,
};

export const dynamic = "force-dynamic";

export default async function EnglishProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/en/login?next=${encodeURIComponent("/en/profile")}`);
  }

  const profile = await getProfileById(user.id);
  if (!profile) {
    redirect(`/en/login?next=${encodeURIComponent("/en/profile")}`);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12 md:py-16" lang="en">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          {enProfileCopy.title}
        </h1>
        <p className="mt-3 text-muted">{enProfileCopy.subtitle}</p>
      </header>
      <ProfileEditForm profile={profile} locale="en" />
    </div>
  );
}
