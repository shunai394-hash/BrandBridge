import Link from "next/link";
import { Button } from "@/components/ui/Button";

type EmptyCasesStateProps = {
  variant?: "home" | "list" | "filtered";
};

export function EmptyCasesState({ variant = "list" }: EmptyCasesStateProps) {
  if (variant === "filtered") {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-12 text-center">
        <p className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          条件に一致する案件がありません
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          カテゴリや国・販売形式の条件をゆるめると、見つかることがあります。
        </p>
      </div>
    );
  }

  if (variant === "home") {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_16px_40px_rgba(20,32,51,0.06)]">
        <div className="border-b border-border bg-[linear-gradient(120deg,#0c1524_0%,#146f6f_100%)] px-6 py-8 text-white md:px-10 md:py-10">
          <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide">
            ベータ公開中 · 掲載準備中
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-shippori)] text-2xl leading-snug md:text-3xl">
            公開案件を順次オープン予定です
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
            いまは先行登録のタイミングです。メーカーは掲載枠の確保、パートナーは公開時にすぐ動ける準備ができます。
          </p>
        </div>

        <div className="grid gap-6 px-6 py-8 md:grid-cols-3 md:px-10 md:py-10">
          {[
            {
              title: "メーカー向け",
              body: "製品・条件を整えて登録。審査後に案件公開できます。",
              href: "/register/maker",
              cta: "先行登録する",
            },
            {
              title: "パートナー向け",
              body: "公開と同時に案件を比較・申し込みできる状態に。",
              href: "/register/partner",
              cta: "先行登録する",
            },
            {
              title: "掲載・提携の相談",
              body: "カテゴリやエリアのご相談はお問い合わせください。",
              href: "/contact",
              cta: "相談する",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col">
              <p className="font-medium text-navy">{item.title}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
              <Link
                href={item.href}
                className="mt-4 text-sm font-medium text-teal hover:underline"
              >
                {item.cta} →
              </Link>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border bg-cream/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <p className="text-sm text-muted">
            すでにアカウントがある方は、案件一覧の更新もチェックできます。
          </p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button href="/cases" variant="outline" className="w-full sm:w-auto">
              案件一覧を見る
            </Button>
            <Button href="/register/maker" className="w-full sm:w-auto">
              メーカー登録
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-12 md:px-10">
      <p className="inline-flex rounded-full border border-teal/25 bg-teal/10 px-3 py-1 text-xs font-medium text-teal-dark">
        ベータ公開中
      </p>
      <p className="mt-4 font-[family-name:var(--font-shippori)] text-xl text-navy md:text-2xl">
        公開中の案件は準備中です
      </p>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        まもなく案件が並び始めます。先行してアカウントを作成しておくと、公開後すぐにマッチングを始められます。
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button href="/register/maker" className="w-full sm:w-auto">
          メーカーとして先行登録
        </Button>
        <Button href="/register/partner" variant="outline" className="w-full sm:w-auto">
          パートナー先行登録
        </Button>
        <Button href="/" variant="ghost" className="w-full sm:w-auto">
          トップへ戻る
        </Button>
      </div>
    </div>
  );
}
