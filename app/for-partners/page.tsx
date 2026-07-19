import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "販売パートナー・バイヤーの方へ",
  description:
    "売れる商品を探す時間を効率化。BrandBridgeで販売パートナー向けに新しい取り扱い商材の発見をサポート。登録無料・初期費用なし。",
};

const pains = [
  "新しく取り扱える商品を探しているが、良い商品提供事業者が見つからない",
  "Amazon、EC、店舗で販売できる商材を増やしたい",
  "海外や新規ブランドとの取引に不安がある",
  "代理店や独占販売できる商品を探している",
];

const capabilities = [
  {
    step: "STEP1",
    title: "販売ジャンル・販路を登録",
    body: "あなたの得意な販売ジャンル、販売チャネル、希望条件を登録します。",
  },
  {
    step: "STEP2",
    title: "条件に合う商品を探す",
    body: "登録情報をもとに、取り扱い候補の商品を確認できます。",
  },
  {
    step: "STEP3",
    title: "商品提供事業者と商談する",
    body: "商品条件、販売条件、契約内容を確認できます。",
  },
  {
    step: "STEP4",
    title: "新しい商材として販売開始",
    body: "新しい商品の取り扱い、販路拡大につなげます。",
  },
];

const flow = [
  "パートナー登録",
  "メール認証",
  "プロフィール入力",
  "販売実績・希望条件入力",
  "商品提案・確認",
];

const merits = [
  "新しい商品との出会い",
  "取り扱い商品の幅を広げられる",
  "商品提供事業者との直接取引機会",
  "販売条件を確認してから検討できる",
];

const profileItems = [
  {
    title: "販売ジャンル",
    body: "美容・食品・雑貨など、得意な取り扱い分野を登録できます。",
  },
  {
    title: "販売チャネル",
    body: "Amazon、EC、店舗、卸など、実際に持っている販路を記載します。",
  },
  {
    title: "対応可能エリア",
    body: "国内エリアや海外展開の可否など、対応範囲を明示できます。",
  },
  {
    title: "希望する商品カテゴリ",
    body: "これから増やしたい商材カテゴリを登録し、マッチングに活かします。",
  },
  {
    title: "希望する取引条件",
    body: "卸・代理店・独占可否など、検討しやすい条件を整理できます。",
  },
];

const faqs = [
  {
    q: "個人でも登録できますか？",
    a: "個人EC事業者、フリーランス、店舗運営者も登録できます。",
  },
  {
    q: "登録費用はかかりますか？",
    a: "登録・商品検索は無料です。",
  },
  {
    q: "海外の事業者の商品も扱えますか？",
    a: "対応可能な商品の掲載を予定しています。",
  },
];

export default function ForPartnersPage() {
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
            FOR PARTNERS / BUYERS
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-shippori)] text-[1.75rem] leading-snug sm:text-3xl md:text-4xl lg:text-5xl">
            売れる商品を探す時間を、もっと効率化しませんか？
          </h1>
          <div className="mt-5 max-w-2xl space-y-4 text-base leading-relaxed text-white/85 md:text-lg">
            <p>
              BrandBridgeは、販売チャネルを持つバイヤー・店舗・EC事業者と、商品を広げたい事業者をつなぐBtoBマッチングサービスです。
            </p>
            <p>
              あなたの販売ジャンルや得意な販路に合わせて、新しい取り扱い商品の発見をサポートします。
            </p>
          </div>
          <div className="mt-9 flex w-full max-w-md flex-col gap-3">
            <Button
              href="/cases"
              className="w-full py-3.5 text-base shadow-[0_12px_32px_rgba(26,138,138,0.4)] sm:w-auto sm:min-w-[240px]"
            >
              無料で商品を探す
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
            販路の登録から新しい商材の取り扱い開始まで、4つのステップで進められます。
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
            販売パートナー登録の流れ
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

      {/* 6. Profile fields */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            登録後に入力するプロフィール
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            販売パートナーとしての強みや希望条件を整理しておくと、合う商品を見つけやすくなります。
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profileItems.map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-border bg-background px-5 py-5"
              >
                <h3 className="font-medium text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="border-t border-border bg-background">
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

      {/* 8. Final CTA */}
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
            あなたに合う新しい商材を探しませんか？
          </h2>
          <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-center gap-3">
            <Button
              href="/register/partner"
              className="w-full py-3.5 text-base shadow-[0_12px_32px_rgba(26,138,138,0.4)] sm:w-auto sm:min-w-[280px]"
            >
              販売パートナー登録を開始する
            </Button>
            <p className="text-sm text-white/65">登録無料・初期費用なし</p>
          </div>
        </div>
      </section>
    </div>
  );
}
