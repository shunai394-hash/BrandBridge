import type { Metadata } from "next";
import Link from "next/link";
import { BlogImage } from "@/components/blog/BlogImage";
import { Button } from "@/components/ui/Button";
import {
  JA_IMPORT_COST,
  JA_MOQ_GUIDE,
  JA_SALES_CAUTIONS,
  JA_SUPPLIER_FINDER,
  JA_WHOLESALE_GUIDE,
} from "@/lib/blog/ja-articles/types";
import { selfLanguageAlternates } from "@/lib/hreflang";
import { getSiteUrl } from "@/lib/site";

const PATH = JA_SUPPLIER_FINDER.path;
const TITLE = JA_SUPPLIER_FINDER.title;
const DESCRIPTION =
  "海外商品の仕入れ先を、メーカー直・海外卸・展示会・マッチングで比較する実務ガイド。再販条件の見え方と、問い合わせ前に揃える情報を整理します。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...selfLanguageAlternates(PATH, "ja"),
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    locale: "ja_JP",
    type: "article",
  },
};

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 list-none space-y-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2.5 text-sm leading-relaxed text-muted md:text-base"
        >
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const routes = [
  {
    title: "メーカーから直接仕入れる",
    body: "当事者同士で卸価格や独占の可否を確認しやすい一方、英語での条件確認と、初回のMOQが大きくなりやすいです。自社で輸入者と在庫の責任を持てる事業者向きです。口頭合意だけで発注しないことが前提です。",
  },
  {
    title: "海外の卸から仕入れる",
    body: "複数ブランドをまとめて見られることがあります。メーカー公式条件と卸の条件が違うことがあるため、日本への再販許可、対象チャネル、不良時の窓口を必ず切り分けます。すでに輸入ルートがある事業者向きです。",
  },
  {
    title: "展示会・商談会で探す",
    body: "実物と担当者に会える利点があります。その場の印象で発注し、帰ってからMOQや納期が曖昧になる失敗が起きやすいです。名刺交換後に、価格・数量・納期を文書で取り直してください。",
  },
  {
    title: "条件が見えるマッチングを使う",
    body: "商品情報と取引条件を並べて比較しやすいです。掲載は目安であり、最終条件は個別確認です。写真や世界観だけで決めず、数量と着地コストから逆算します。",
  },
] as const;

export default function HowToFindOverseasWholesaleSuppliersPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${PATH}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "日本語ガイド",
            item: `${siteUrl}/ja/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: TITLE,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "Article",
        headline: TITLE,
        description: DESCRIPTION,
        inLanguage: "ja",
        mainEntityOfPage: pageUrl,
        url: pageUrl,
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(26,138,138,0.35),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(20,111,111,0.25),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 py-14 md:py-20">
          <p className="text-xs font-medium tracking-wider text-teal">
            販売パートナー向けガイド
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            {TITLE}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            海外ブランドの仕入れ先は、連絡先の数より、再販条件が見えるかどうかで選びます。</p>
          <BlogImage
            id="souvenirShop"
            alt="店頭に並ぶ商品。海外商品の仕入れ先を比較するときの売場イメージ"
            variant="hero"
            look="onDark"
            priority
          />
        </div>
      </section>

      <article className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          <p className="text-xs text-muted">
            <Link href="/ja/blog" className="text-teal hover:underline">
              日本語ガイド
            </Link>
            <span aria-hidden> / </span>
            販売パートナー向け
          </p>
          <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted md:text-base">
            <p>
              海外商品の仕入れ先を探すとき、メーカー公式サイトだけでは卸条件にたどり着けないことがよくあります。海外メーカー、海外の卸、展示会、マッチングは、得られる情報の粒度が違います。</p>
            <p>
              卸取引の始め方全体は
              <Link href={JA_WHOLESALE_GUIDE.path} className="text-teal hover:underline">
                仕入れ・卸取引を始める方法
              </Link>
              で扱っています。この記事では、仕入れ先の種類を比較し、問い合わせ前に何を揃えるかに絞ります。</p>
          </div>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              仕入れ先を比較する前に決めること
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              相手に連絡する前に、自社の販路、希望小売価格帯、初回で抱えられる数量を持っておくと、海外卸もメーカーも可否を返しやすくなります。MOQの見方は
              <Link href={JA_MOQ_GUIDE.path} className="text-teal hover:underline">
                海外商品のMOQ
              </Link>
              を参照してください。</p>
            <BulletList
              items={[
                "どのチャネルで売るか（店舗、EC、卸の再販）",
                "初回で保管・資金的に抱えられる数量",
                "サンプル確認を必須にするか",
                "日本での販売制限がありそうなカテゴリーか",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              メーカー・卸・展示会・マッチングの比較
            </h2>
            <BlogImage
              id="shoppingStreet"
              alt="日本の商店街。仕入れ先の違いが店頭の品揃えに出るイメージ"
            />
            <ul className="mt-8 grid gap-4">
              {routes.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-border bg-background px-5 py-5"
                >
                  <h3 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-muted md:text-base">
              ルートは一つに決めなくても構いません。初回はマッチングや展示会で候補を絞り、継続後にメーカー直へ移す、という段階はよくあります。海外メーカー仕入れでは、価格表が届いても再販地域が空欄のまま、ということがあります。その場合は発注せず、日本向けに売ってよいかを先に文書で取ります。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              問い合わせ前に揃える情報
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外卸もメーカーも、「興味があります」だけでは卸可否を判断できません。自社の販路、想定する初回数量、希望する納期の幅、サンプルの要否を先に出すと、条件の返信が具体的になります。</p>
            <BulletList
              items={[
                "販売チャネルと、店舗かECかの別",
                "初回で検討できる数量の上限",
                "希望する着日の幅（確定日ではなく幅）",
                "日本語の仕様書が必要か",
                "既存の競合取り扱いの有無",
              ]}
            />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              展示会で名刺を交換したあとも、同じ項目をメールで送り直します。その場の口頭は、後から「聞いていた条件と違う」になりやすいです。仕入れ先が複数ある場合は、同じ質問票で比較すると、単価以外の差が見えます。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              仕入れ先を見極める観点
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              単価の安さだけで選ぶと、納期と不良対応で利益が消えることがあります。日本販売時の確認は
              <Link href={JA_SALES_CAUTIONS.path} className="text-teal hover:underline">
                食品・化粧品・雑貨の注意点
              </Link>
              もあわせて見てください。</p>
            <BulletList
              items={[
                "日本への再販が契約上許されているか",
                "対象チャネル（ECのみ、店舗不可など）",
                "リードタイムのばらつき",
                "最小ロットと再発注単位",
                "不良時の写真確認と交換ルール",
                "成分、サイズ、電圧など日本向け情報の有無",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              条件が見える一覧から候補を絞る
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              <Link href="/cases" className="text-teal hover:underline">
                商品一覧
              </Link>
              では、カテゴリやMOQ、参考卸価格帯を先に比較できます。
              <Link href="/ja/categories" className="text-teal hover:underline">
                カテゴリー
              </Link>
              から食品やコスメなど分野を絞ることもできます。未記載の項目は、商談で埋める前提でリスト化してください。掲載条件は目安です。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              よくある選び間違い
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外商品の仕入れ先探しで多いのは、連絡先の件数を増やすこと自体を目的にしてしまうことです。メーカー公式の問い合わせフォーム、展示会の名刺、SNSのDMは、同じ「候補」でも、再販条件が残る確率が違います。返事が早くても、日本向けの数量・チャネル・不良対応が空欄なら、仕入れ先としてはまだ未確定です。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              もう一つの誤りは、海外メーカーと海外卸を同じ窓口として扱うことです。メーカーは生産とブランド方針、卸は在庫と複数ブランドの取りまとめ、という役割の差があります。卸経由で安く見えても、日本再販の権限が卸側にないことがあります。権限の所在が曖昧なまま発注すると、販売開始後に差し止めの話が出ることがあります。</p>
            <BulletList
              items={[
                "名刺の枚数を、条件が見えた件数と混同する",
                "メーカー直と卸を、同じ確認項目で済ませる",
                "展示会の口頭を、発注条件だとみなす",
                "写真の印象だけで、着地コストを後回しにする",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              返信が来ないときの見直し
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外卸・海外メーカーへ問い合わせても返信がない場合、相手の怠慢より先に、自社側の情報が足りないことが多いです。販路、初回数量、希望着日の幅、サンプルの要否が無いメールは、優先度が下がりやすいです。同じ内容を短く再送する前に、質問票を一枚にまとめてください。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              マッチングの掲載から入る場合は、未記載の項目を先にリスト化し、商談で埋める順を決めておきます。仕入れ先比較の次に見るのは、ロットと着地コストです。
              <Link href={JA_MOQ_GUIDE.path} className="text-teal hover:underline">
                MOQの見方
              </Link>
              と
              <Link href={JA_IMPORT_COST.path} className="text-teal hover:underline">
                輸入費用の確認項目
              </Link>
              をセットで持っておくと、候補を減らす判断が速くなります。</p>
          </section>
        </div>
      </article>

      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 50%, rgba(26,138,138,0.55), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(20,111,111,0.35), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 py-14 text-center md:py-16">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl leading-snug md:text-3xl">
            海外ブランドの商品を探す
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            仕入れ先を決める前に、取引条件が見える掲載から候補を比較できます。</p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              href="/cases"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[200px]"
            >
              海外ブランドの商品を探す
            </Button>
            <Button
              href="/register/partner"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-[180px]"
            >
              販売パートナーとして登録
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
