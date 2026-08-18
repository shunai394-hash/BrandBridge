import type { Metadata } from "next";
import Link from "next/link";
import { BlogImage } from "@/components/blog/BlogImage";
import { Button } from "@/components/ui/Button";
import {
  JA_IMPORT_COST,
  JA_MOQ_GUIDE,
  JA_SUPPLIER_FINDER,
  JA_WHOLESALE_GUIDE,
} from "@/lib/blog/ja-articles/types";
import { selfLanguageAlternates } from "@/lib/hreflang";
import { getSiteUrl } from "@/lib/site";

const PATH = JA_MOQ_GUIDE.path;
const TITLE = JA_MOQ_GUIDE.title;
const DESCRIPTION =
  "海外商品のMOQ（最低発注数量・最低発注金額）の意味と、小ロット仕入れで確認すべき在庫・資金・再発注の見方。単価だけで判断しない手順を解説します。";

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

export default function WhatIsMoqForOverseasProductsPage() {
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
          { "@type": "ListItem", position: 3, name: TITLE, item: pageUrl },
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
            MOQは割引条件ではなく、初回で抱えられる在庫と資金の上限を決める数字です。</p>
          <BlogImage
            id="villageRoad"
            alt="霧の中の通り。小ロットから海外商品の取り扱いを始めるイメージ"
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
              海外ブランドとのやりとりで最初に出てくる数字の一つがMOQです。単価だけを見て「安いから大きいロットで買う」と、売れる前に在庫とキャッシュが固定されます。</p>
            <p>
              卸取引の流れは
              <Link href={JA_WHOLESALE_GUIDE.path} className="text-teal hover:underline">
                仕入れ・卸取引を始める方法
              </Link>
              、仕入れ先の選び方は
              <Link href={JA_SUPPLIER_FINDER.path} className="text-teal hover:underline">
                仕入れ先の比較
              </Link>
              で扱っています。この記事は、最低ロットそのものの見方に絞ります。</p>
          </div>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              MOQの意味
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              Minimum Order Quantityは、一度の発注で求められる最小数量、または最小金額です。生産ロット、輸出梱包、ブランドの在庫方針によって決まります。数量なのか金額なのか、SKU合算なのか単品なのかを、先に確認してください。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              「MOQを下げてほしい」は、相手のコスト構造への変更依頼です。代替として、色やサイズを絞る、初回だけ混ぜる、再発注で単価を見直す、といった話になります。</p>
            <p className="mt-5 rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base">
              安く仕入れられることと、売り切れることは別です。MOQは価格交渉の材料である前に、在庫リスクの上限です。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              最低ロットと最低発注金額
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外仕入れの最低ロットは、ピース、ケース、パレット、金額のいずれかで提示されます。ケース入数が大きいと、ピースMOQが小さく見えても実数は大きくなります。混載できると言われた場合も、色・香り・サイズごとに下限がないかを確認します。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              小ロットで始めるなら、SKUを増やす前に、主力1〜2点で回転を見ます。単価交渉は、数量を約束してからが話になりやすく、初回から大幅な値下げだけを求めると、相手の生産条件と噛み合いません。</p>
            <BulletList
              items={[
                "MOQが数量か金額か、合算か単SKUか",
                "ケース入数と、端数発注の可否",
                "試作品・サンプルと量産でMOQが違うか",
                "再発注時に初回より下がるか、上がるか",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              小ロット仕入れで確認すべきポイント
            </h2>
            <BlogImage
              id="consultant"
              alt="数字を確認する手元。MOQと小ロットの計算イメージ"
            />
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              単価が高くても、売れる見込みの範囲なら、初回は小さくてよいことがあります。見るのは希望小売価格から、卸、送料、関税、国内物流、返品を引いた残りです。費用の内訳は
              <Link href={JA_IMPORT_COST.path} className="text-teal hover:underline">
                輸入・仕入れの費用と条件
              </Link>
              で確認項目を分けています。</p>
            <BulletList
              items={[
                "何個までなら保管できるか",
                "何週間・何か月で売り切る想定か",
                "再発注までの日数と最小単位",
                "SKUをいくつ同時に抱えるか",
                "初回だけ小さくできる例外があるか",
                "サンプルで中身を確認できるか",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              海外の卸MOQで起きやすい誤解
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              ケース単位とピース単位が混ざる、試作品のMOQと量産のMOQが違う、混載できると言われたのに色ごとに最低がある、といったずれがよくあります。発注書に「何のMOQか」を一文残してください。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              掲載でMOQを先に見る
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              <Link href="/cases" className="text-teal hover:underline">
                商品一覧
              </Link>
              の参考MOQは目安です。数字がある場合は、自社の販売計画と突き合わせてから問い合わせると、商談が具体的になります。未記載なら、問い合わせの最初の質問にしてください。分野から絞る場合は
              <Link href="/ja/categories" className="text-teal hover:underline">
                カテゴリー
              </Link>
              も使えます。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              在庫と資金の上限の決め方
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外仕入れの最低ロットを見るときは、倉庫の空きより先に、資金が何週間固定されるかを見ます。入金から入荷、店頭・ECでの回転までの期間が長いほど、同じMOQでも負担は大きくなります。小ロット仕入れは「少量だから安全」ではなく、「売り切るまでの期間が短い数量」を選ぶ、という意味です。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              試しに置くための数量と、継続販売のための数量は分けて考えてください。試し置きはサンプルとごく少ない初回で足りることがあり、継続は再発注単位とリードタイムで決まります。両方を同じMOQで一度に買うと、売れ残りのリスクが初回に集中します。</p>
            <BulletList
              items={[
                "入金から入荷までの日数",
                "入荷から売り切るまでの想定週数",
                "欠品した場合の代替SKUの有無",
                "返品不可の場合の値引き販売の余地",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              MOQ交渉の順序
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外卸のMOQ交渉で最初に出すのは、値下げ要求ではありません。自社の販路、初回で抱えられる上限、再発注の見込みを先に出すと、相手は混載、色の絞り込み、初回例外のどれが現実的かを返しやすくなります。数量の根拠がない値下げは、生産条件と噛み合わず、返信が止まりやすいです。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              交渉結果はチャットの一言で終わらせず、発注書に「何のMOQか」を残します。ピース、ケース、金額、SKU合算のどれかが空だと、出荷直前に数量不足で止まったときに根拠がありません。合意した例外（初回のみ半量など）は、期限と対象SKUも一文で書いてください。
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              小ロットで始める場合でも、再発注の最小単位が初回より大きいことがあります。初回だけ例外で通っても、2回目からケース単位に戻ると、売場の回転と合いません。海外卸に聞くときは、初回MOQと継続MOQを分けて書いてください。
            </p>
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
            MOQの目安が見える掲載から、抱えられる数量の候補を比較できます。</p>
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
