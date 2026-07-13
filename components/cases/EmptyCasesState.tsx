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

  const isHome = variant === "home";

  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-12 md:px-10">
      <p className="font-[family-name:var(--font-shippori)] text-xl text-navy md:text-2xl">
        {isHome
          ? "まだ公開案件はありません"
          : "公開中の案件はまだありません"}
      </p>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        BrandBridge
        は、製品を広げたいメーカーと、良い商材を探す販売パートナーをつなぐマッチングの場です。案件が公開されると、ここに一覧が表示されます。
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "案件を探す",
            body: "カテゴリや販売形式から、取り扱い候補を比較できます。",
          },
          {
            title: "交渉を始める",
            body: "気になる案件に申し込み、条件をすり合わせられます。",
          },
          {
            title: "成約まで伴走",
            body: "承認後のメッセージと成約プロセスで、取引を進められます。",
          },
        ].map((item) => (
          <li key={item.title} className="border-l-2 border-teal/40 pl-4">
            <p className="text-sm font-medium text-navy">{item.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/register/maker">メーカーとして案件を掲載</Button>
        <Button href="/register/partner" variant="outline">
          パートナー登録
        </Button>
        {!isHome ? (
          <Button href="/" variant="ghost">
            トップへ戻る
          </Button>
        ) : (
          <Link
            href="/cases"
            className="inline-flex items-center px-2 text-sm text-teal hover:underline"
          >
            案件一覧を見る
          </Link>
        )}
      </div>
    </div>
  );
}
