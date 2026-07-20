import Link from "next/link";
import { Button } from "@/components/ui/Button";

type EmptyCasesStateProps = {
  variant: "list" | "filtered";
};

export function EmptyCasesState({ variant }: EmptyCasesStateProps) {
  if (variant === "filtered") {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
        <p className="font-medium text-navy">
          条件に一致する商品がありません
        </p>
        <p className="mt-2 text-sm text-muted">
          キーワードや絞り込み条件を変えて、もう一度お試しください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-10 text-center">
        <p className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          公開商品を順次オープン予定です
        </p>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          まもなく商品が並び始めます。先行してアカウントを作成しておくと、公開後すぐにマッチングを始められます。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "商品提供企業の方",
            body: "製品・条件を整えて登録。審査後に商品公開できます。",
          },
          {
            title: "販売パートナーの方",
            body: "公開と同時に商品を比較・申し込みできる状態に。",
          },
          {
            title: "すでにアカウントがある方",
            body: "商品一覧の更新もチェックできます。",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-border bg-cream/40 px-4 py-5"
          >
            <p className="font-medium text-navy">{item.title}</p>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/register/maker">商品提供企業として登録</Button>
        <Button href="/register/partner" variant="outline">
          パートナー登録
        </Button>
        <a href="/cases" className="text-sm text-teal hover:underline">
          商品一覧を見る
        </a>
      </div>
    </div>
  );
}
