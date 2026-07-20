import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "料金",
  description:
    "BrandBridgeの料金表。販売パートナーは無料、商品提供企業はベータ期間のStarterから本格利用のGrowth・Enterpriseまで。",
};

const partnerFreeFeatures = [
  "商品案件の閲覧",
  "商品詳細情報の確認",
  "商品提供企業への問い合わせ",
  "商談申請",
  "チャットでのやり取り",
] as const;

const starterFeatures = [
  "企業プロフィール登録",
  "商品登録（3件まで）",
  "商品情報掲載",
  "販売パートナーからの問い合わせ受付",
  "基本商談管理",
] as const;

const growthFeatures = [
  "Starterの内容に加えて",
  "商品登録数 無制限",
  "詳細条件表示（MOQ / 卸価格 / 独占可否 / 取引条件）",
  "優先表示",
  "商談管理機能",
  "販売パートナーとの継続交渉管理",
] as const;

const enterpriseFeatures = [
  "大量商品登録",
  "複数担当者管理",
  "個別カスタマイズ",
] as const;

const betaBenefits = [
  "優先掲載",
  "初期利用条件の優遇",
  "正式料金開始後の特別条件適用",
] as const;

function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-muted">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(26,138,138,0.35),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(20,111,111,0.25),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <Link
            href="/"
            className="text-sm text-white/65 transition hover:text-white"
          >
            ← トップに戻る
          </Link>
          <p className="mt-6 text-xs font-medium tracking-wider text-teal">
            PRICING
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-shippori)] text-[1.75rem] leading-snug sm:text-3xl md:text-4xl lg:text-5xl">
            料金
          </h1>
        </div>
      </section>

      {/* 販売パートナー */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <p className="text-xs font-medium tracking-wider text-teal">
            販売パートナー
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            Free
          </h2>
          <div className="mt-8 max-w-lg rounded-lg border border-border bg-white px-6 py-7">
            <p className="font-[family-name:var(--font-shippori)] text-3xl text-navy">
              ¥0
              <span className="ml-1 text-base font-normal text-muted">/ 月</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              新しい商材を探したい企業向け
            </p>
            <FeatureList items={partnerFreeFeatures} />
            <div className="mt-7">
              <Button href="/register/partner" className="w-full sm:w-auto">
                販売パートナーとして登録
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 商品提供企業 */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <p className="text-xs font-medium tracking-wider text-teal">
            商品提供企業
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <article className="flex flex-col rounded-lg border border-border bg-white px-6 py-7">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
                  Starter
                </h3>
                <span className="rounded-md border border-teal/40 bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal">
                  ベータ期間限定
                </span>
              </div>
              <p className="mt-4 font-[family-name:var(--font-shippori)] text-3xl text-navy">
                ¥0
                <span className="ml-1 text-base font-normal text-muted">/ 月</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                まずは商品を掲載して反応を見る企業向け
              </p>
              <FeatureList items={starterFeatures} />
              <div className="mt-auto pt-7">
                <Button href="/register/maker" className="w-full">
                  商品提供企業として登録
                </Button>
              </div>
            </article>

            <article className="flex flex-col rounded-lg border-2 border-teal bg-white px-6 py-7 shadow-[0_12px_32px_rgba(26,138,138,0.12)]">
              <h3 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
                Growth
              </h3>
              <p className="mt-4 font-[family-name:var(--font-shippori)] text-3xl text-navy">
                ¥29,800
                <span className="ml-1 text-base font-normal text-muted">/ 月</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                本格的に販売パートナーを探したい企業向け
              </p>
              <FeatureList items={growthFeatures} />
              <div className="mt-auto pt-7">
                <Button href="/contact" className="w-full">
                  お問い合わせ
                </Button>
              </div>
            </article>

            <article className="flex flex-col rounded-lg border border-border bg-white px-6 py-7">
              <h3 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
                Enterprise
              </h3>
              <p className="mt-4 font-[family-name:var(--font-shippori)] text-3xl text-navy">
                個別相談
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                大規模利用企業向け
              </p>
              <FeatureList items={enterpriseFeatures} />
              <p className="mt-4 text-xs leading-relaxed text-muted">
                ※提供内容は今後拡充予定
              </p>
              <div className="mt-auto pt-7">
                <Button href="/contact" variant="outline" className="w-full">
                  個別相談する
                </Button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 成約手数料 */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            成約手数料
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-white px-6 py-6">
              <p className="text-xs font-medium tracking-wider text-teal">
                ベータ期間中
              </p>
              <p className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy">
                成約手数料 0円
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white px-6 py-6">
              <p className="text-xs font-medium tracking-wider text-muted">
                正式提供開始後
              </p>
              <p className="mt-2 text-base leading-relaxed text-navy">
                利用状況を確認しながら設定予定
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ベータ参加特典 */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
            ベータ参加特典
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            先行登録企業には、優先掲載、初期利用条件の優遇、正式料金開始後の特別条件適用を提供。
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {betaBenefits.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-white px-5 py-5 text-sm font-medium text-navy"
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/register/maker" className="w-full sm:w-auto">
              商品提供企業として登録
            </Button>
            <Button
              href="/register/partner"
              variant="outline"
              className="w-full sm:w-auto"
            >
              販売パートナーとして登録
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
