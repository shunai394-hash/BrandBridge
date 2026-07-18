import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { reviewStatusLabels, salesFormatLabel } from "@/lib/types";

export const metadata: Metadata = {
  title: "商品登録内容の確認",
  description: "メーカー登録で保存した商品情報を確認します。",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ created?: string }>;
};

export default async function MakerRegistrationCompletePage({
  searchParams,
}: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/maker/registration-complete");
  }
  if (user.role !== "maker") {
    redirect("/cases");
  }

  const { created } = await searchParams;
  const supabase = await createClient();
  const [{ data: profile }, { data: cases, error: casesError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "company_name, contact_name, industry, description, product_overview",
        )
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("cases")
        .select(
          "id, title, product_name, product_image_url, category, summary, region, partner_channels, sales_format, sales_terms, offer, is_exclusive, review_status, created_at",
        )
        .eq("maker_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const latest =
    (created
      ? cases?.find((c) => c.id === created)
      : undefined) ??
    cases?.[0] ??
    null;

  console.info("[MakerRegistrationComplete] page render", {
    userId: user.id,
    createdParam: created ?? null,
    latestCaseId: latest?.id ?? null,
    reviewStatus: latest?.review_status ?? null,
    caseCount: cases?.length ?? 0,
    casesError: casesError?.message ?? null,
    saveSuccess: Boolean(latest),
  });

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR MAKERS
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          登録内容を確認しました
        </h1>
        <p className="mt-3 text-muted">
          メーカー情報と商品は保存済みです。商品一覧で内容を確認できます（自動承認が無効の場合、他ユーザーへの公開は運営承認後です）。
        </p>
      </header>

      {latest ? (
        <div className="mb-6 rounded-xl border border-teal/40 bg-cream px-5 py-4">
          <p className="font-medium text-navy">保存に成功しました</p>
          <p className="mt-1 text-sm text-muted">
            作成された商品ID:{" "}
            <Link
              href={`/cases/${latest.id}`}
              className="font-mono text-teal hover:underline"
            >
              {latest.id}
            </Link>
          </p>
          <p className="mt-1 text-sm text-muted">
            審査ステータス:{" "}
            {reviewStatusLabels[latest.review_status as keyof typeof reviewStatusLabels] ??
              latest.review_status}
          </p>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="font-medium text-red-800">商品データが見つかりません</p>
          <p className="mt-1 text-sm text-red-700">
            保存に失敗した可能性があります。もう一度商品登録をお試しください。
            {created ? `（指定ID: ${created}）` : null}
          </p>
        </div>
      )}

      <ol className="mb-8 space-y-2 rounded-xl border border-border bg-cream/70 px-5 py-4 text-sm text-navy">
        <li>1. 登録・メール認証</li>
        <li>2. 商品登録（完了）</li>
        <li>3. 商品公開申請（審査待ち）</li>
        <li>4. 販売パートナーから応募</li>
      </ol>

      <section className="mb-6 rounded-xl border border-border bg-surface p-5 md:p-6">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          メーカー情報
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          {[
            ["会社名", profile?.company_name],
            ["担当者", profile?.contact_name],
            ["業種", profile?.industry],
            ["会社概要", profile?.description],
          ].map(([label, value]) => (
            <div key={label as string} className="grid gap-1 sm:grid-cols-[7rem_1fr]">
              <dt className="text-muted">{label}</dt>
              <dd className="whitespace-pre-wrap text-navy">
                {(value as string | null)?.trim() || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-8 rounded-xl border border-border bg-surface p-5 md:p-6">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          商品情報・販売条件
        </h2>
        {!latest ? (
          <p className="mt-4 text-sm text-muted">
            まだ商品がありません。続けて商品を登録できます。
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {latest.product_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={latest.product_image_url}
                alt={latest.product_name}
                className="max-h-56 w-full rounded-lg border border-border object-cover"
              />
            ) : null}
            <dl className="space-y-3 text-sm">
              {[
                ["商品名", latest.product_name],
                ["カテゴリ", latest.category],
                ["商品概要", latest.summary],
                ["販売希望地域", latest.region],
                ["販売チャネル", latest.partner_channels],
                [
                  "希望取引形式",
                  `${salesFormatLabel(latest.sales_format as never)}${
                    latest.is_exclusive ? "（独占希望）" : ""
                  }`,
                ],
                ["希望条件", latest.sales_terms || latest.offer],
                [
                  "審査ステータス",
                  reviewStatusLabels[
                    latest.review_status as keyof typeof reviewStatusLabels
                  ] ?? latest.review_status,
                ],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="grid gap-1 sm:grid-cols-[7rem_1fr]"
                >
                  <dt className="text-muted">{label}</dt>
                  <dd className="whitespace-pre-wrap text-navy">
                    {(value as string | null)?.trim() || "—"}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted">
              商品ID:{" "}
              <Link
                href={`/cases/${latest.id}`}
                className="font-mono text-teal hover:underline"
              >
                {latest.id}
              </Link>
            </p>
          </div>
        )}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href="/cases" className="w-full sm:w-auto">
          商品一覧で確認する
        </Button>
        <Button href="/maker/cases/new" variant="outline" className="w-full sm:w-auto">
          別の商品を追加登録
        </Button>
        <Button href="/profile/edit" variant="ghost" className="w-full sm:w-auto">
          プロフィール編集
        </Button>
      </div>
    </div>
  );
}
