import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "商品を広げたい事業者の方へ",
  description:
    "商品を広げたい事業者向け。あなたの商品を日本の販売パートナーへ。BrandBridgeで商品を登録し、新しい販路開拓の機会をつくります。登録無料・初期費用なし。",
};

const pains = [
  "日本市場で商品を広げたいが販売先が見つからない",
  "展示会や営業だけでは新しい販売パートナー開拓が難しい",
  "自社商品に合う販売チャネルを探したい",
  "代理店や卸先を増やしたい",
];

const capabilities = [
  {
    step: "STEP1",
    title: "商品を登録",
    body: "商品画像、カテゴリ、価格、販売条件などを登録できます。",
  },
  {
    step: "STEP2",
    title: "販売パートナーとの接点を作る",
    body: "商品ジャンルや条件に合った販売パートナーとの出会いを作ります。",
  },
  {
    step: "STEP3",
    title: "商談・条件確認",
    body: "取り扱い条件や販売方法について確認できます。",
  },
  {
    step: "STEP4",
    title: "販路拡大につなげる",
    body: "新しい販売チャネル開拓をサポートします。",
  },
];

const flow = [
  "商品を広げたい事業者として登録",
  "メール認証",
  "事業者情報入力",
  "商品登録",
  "販売パートナーとの商談",
];

const merits = [
  "登録無料",
  "商品情報を整理して掲載できる",
  "新しい販売先を探せる",
  "販売パートナーとの接点を増やせる",
];

const faqs = [
  {
    q: "登録費用はかかりますか？",
    a: "登録・商品掲載は無料です。",
  },
  {
    q: "どんな商品を登録できますか？",
    a: "食品、コスメ、健康、美容、雑貨、家電など幅広いカテゴリに対応します。",
  },
  {
    q: "海外の事業者でも利用できますか？",
    a: "利用できる設計にしています。",
  },
];

export default function ForMakersPage() {
  return (
    <div>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(26,138,138,0.35),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(20,111,111,0.25),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <Link
            href="/#for-you"
            className="text-sm text-white/65 transition hover:text-white"
          >
            ← トップに戻る
          </Link>
          <p className="mt-6 text-xs font-medium tracking-wider text-teal">
            FOR MAKERS
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-shippori)] text-[1.75rem] leading-snug sm:text-3xl md:text-4xl lg:text-5xl">
            あなたの商品を、日本の販売パートナーへ届けませんか？
          </h1>
          <div className="mt-5 max-w-2xl space-y-4 text-base leading-relaxed text-white/85 md:text-lg">
            <p>
              BrandBridgeは、商品を広げたい事業者と、新しい商材を探している販売パートナーをつなぐBtoBマッチングサービスです。
            </p>
            <p>
              商品情報を登録することで、新しい販売チャネル開拓の機会を作れます。
            </p>
          </div>
          <div className="mt-9 flex w-full max-w-md flex-col gap-3">
            <Button
              href="/register/maker"
              className="w-full py-3.5 text-base shadow-[0_12px_32px_rgba(26,138,138,0.4)] sm:w-auto sm:min-w-[240px]"
            >
              無料で商品を登録する
            </Button>
            <p className="text-sm text-white/70">登録無料・初期費用なし</p>
          </div>
        </div>
      </section>

      {/* 2. Pains */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            こんな悩みはありませんか？
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {pains.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-border bg-background px-5 py-5 text-sm leading-relaxed text-navy shadow-[0_8px_24px_rgba(20,32,51,0.04)] md:text-base"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. What you can do */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            BrandBridgeでできること
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            商品登録から販路拡大まで、4つのステップで進められます。
          </p>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((item) => (
              <li
                key={item.step}
                className="rounded-xl border border-border bg-surface p-5 md:p-6"
              >
                <p className="text-xs font-medium tracking-wider text-teal">
                  {item.step}
                </p>
                <h3 className="mt-3 font-[family-name:var(--font-shippori)] text-lg text-navy">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Registration flow */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            商品を広げたい事業者として登録する流れ
          </h2>
          <ol className="mt-10 flex flex-col gap-0 md:flex-row md:items-stretch md:gap-0">
            {flow.map((label, i) => (
              <li
                key={label}
                className="flex flex-1 flex-col items-stretch md:flex-row md:items-center"
              >
                <div className="flex flex-1 items-center gap-4 rounded-xl border border-border bg-background px-5 py-4 md:flex-col md:justify-center md:px-4 md:py-6 md:text-center">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-medium text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-navy md:text-[0.95rem]">
                    {label}
                  </span>
                </div>
                {i < flow.length - 1 ? (
                  <div
                    className="flex items-center justify-center py-2 text-teal md:px-1 md:py-0"
                    aria-hidden
                  >
                    <span className="md:hidden">↓</span>
                    <span className="hidden md:inline">→</span>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. Merits */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            登録メリット
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {merits.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-teal/20 bg-surface px-5 py-6 text-center"
              >
                <p className="font-medium text-navy">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            よくある質問
          </h2>
          <dl className="mt-8 space-y-6">
            {faqs.map((item) => (
              <div key={item.q} className="border-b border-border pb-6">
                <dt className="font-medium text-navy">Q：{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">
                  A：{item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 50%, rgba(26,138,138,0.55), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(20,111,111,0.35), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl leading-snug md:text-3xl">
            あなたの商品を、新しい販売先へ届けませんか？
          </h2>
          <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-center gap-3">
            <Button
              href="/register/maker"
              className="w-full py-3.5 text-base shadow-[0_12px_32px_rgba(26,138,138,0.4)] sm:w-auto sm:min-w-[240px]"
            >
              商品を広げたい事業者として登録を開始する
            </Button>
            <p className="text-sm text-white/65">登録無料・初期費用なし</p>
          </div>
        </div>
      </section>
    </div>
  );
}
