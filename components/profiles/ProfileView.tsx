import Link from "next/link";
import { TrustInfoList } from "@/components/profiles/TrustInfoList";
import { Button } from "@/components/ui/Button";
import type { Case, PublicProfile } from "@/lib/types";

type ProfileViewProps = {
  profile: PublicProfile;
  openCases: Case[];
  isOwner: boolean;
};

export function ProfileView({ profile, openCases, isOwner }: ProfileViewProps) {
  const roleLabel = profile.role === "maker" ? "メーカー" : "販売パートナー";

  return (
    <article className="animate-fade-up space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-teal">{roleLabel}</p>
          <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
            {profile.companyName}
          </h1>
          <p className="mt-2 text-sm text-muted">担当: {profile.contactName}</p>
        </div>
        {isOwner ? (
          <Button href="/profile/edit" variant="outline">
            プロフィールを編集
          </Button>
        ) : null}
      </header>

      <section className="rounded-lg border border-border bg-surface p-5 md:p-6">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          会社紹介
        </h2>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed text-foreground/90">
          {profile.description?.trim() || "紹介文はまだ登録されていません。"}
        </p>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 md:p-6">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          信頼情報
        </h2>
        <div className="mt-4">
          <TrustInfoList profile={profile} />
        </div>
      </section>

      {profile.role === "maker" ? (
        <section className="rounded-lg border border-border bg-surface p-5 md:p-6">
          <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
            取り扱い・業種
          </h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-xs font-medium text-muted">業種</dt>
              <dd className="mt-1 text-sm text-navy">
                {profile.industry || "未登録"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">取り扱い商品概要</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {profile.productOverview || "未登録"}
              </dd>
            </div>
          </dl>
        </section>
      ) : (
        <section className="rounded-lg border border-border bg-surface p-5 md:p-6">
          <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
            販売パートナー情報
          </h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-xs font-medium text-muted">区分</dt>
              <dd className="mt-1 text-sm text-navy">
                {profile.entityType === "corporate"
                  ? "法人"
                  : profile.entityType === "individual"
                    ? "個人"
                    : "未登録"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">販売ジャンル</dt>
              <dd className="mt-1 text-sm text-navy">
                {profile.salesGenres || "未登録"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">販売チャネル</dt>
              <dd className="mt-1 text-sm text-navy">
                {profile.salesChannel || "未登録"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">対応エリア</dt>
              <dd className="mt-1 text-sm text-navy">{profile.area || "未登録"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">希望商品カテゴリ</dt>
              <dd className="mt-1 text-sm text-navy">
                {profile.preferredCategories || "未登録"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">希望取引条件</dt>
              <dd className="mt-1 text-sm text-navy">
                {profile.preferredDealTypes || "未登録"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">強み</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {profile.strength || "未登録"}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <section className="rounded-lg border border-border bg-surface p-5 md:p-6">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          実績
        </h2>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed text-foreground/90">
          {profile.achievements?.trim() || "実績情報はまだ登録されていません。"}
        </p>
      </section>

      {profile.role === "maker" ? (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
              掲載中の商品
            </h2>
            <a href="/cases" className="text-sm text-teal hover:underline">
              商品一覧へ
            </a>
          </div>
          {openCases.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-surface px-5 py-8 text-center text-sm text-muted">
              公開中の商品はまだありません。
            </p>
          ) : (
            <ul className="space-y-3">
              {openCases.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/cases/${item.id}`}
                    className="block rounded-lg border border-border bg-surface p-4 transition hover:border-teal/40"
                  >
                    <p className="font-medium text-navy">{item.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.category} / {item.region}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </article>
  );
}
