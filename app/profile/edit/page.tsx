import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/profiles/ProfileEditForm";
import { getSessionUser } from "@/lib/auth";
import { getProfileById } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "プロフィール編集",
  description: "会社情報・信頼情報を編集します。",
};

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/profile/edit");
  }

  const profile = await getProfileById(user.id);
  if (!profile) {
    redirect("/login?next=/profile/edit");
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          プロフィール編集
        </h1>
        <p className="mt-3 text-muted">
          会社情報と信頼情報を充実させると、交渉相手からの信頼につながります。
        </p>
      </header>
      <ProfileEditForm profile={profile} />
    </div>
  );
}
