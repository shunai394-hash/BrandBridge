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

const PATH = JA_IMPORT_COST.path;
const TITLE = JA_IMPORT_COST.title;
const DESCRIPTION =
  "海外商品の輸入・仕入れで確認すべき費用と条件。輸送、保険、インコタームズ、支払、納期、サンプルを、税率を断定せず実務の確認項目として整理します。";

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

export default function LogisticsLeadTimeSamplesForImportPage() {
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
            卸価格の外にある輸送・保険・通関・国内配送を、発注前の確認項目として並べます。</p>
          <BlogImage
            id="chureitoPagoda"
            alt="五重塔と富士。国境を越えて商品が届くまでの距離を示すイメージ"
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
              海外仕入れの費用は、価格表の一行では終わりません。誰が輸出するか、保険は誰が付保するか、通関後の国内配送は誰が手配するかで、着地コストが変わります。税率や関税額は案件ごとに異なるため、この記事では金額を示しません。</p>
            <p>
              卸の始め方は
              <Link href={JA_WHOLESALE_GUIDE.path} className="text-teal hover:underline">
                仕入れ・卸取引を始める方法
              </Link>
              、仕入れ先の比較は
              <Link href={JA_SUPPLIER_FINDER.path} className="text-teal hover:underline">
                仕入れ先の探し方
              </Link>
              、ロットは
              <Link href={JA_MOQ_GUIDE.path} className="text-teal hover:underline">
                MOQの解説
              </Link>
              を参照してください。</p>
          </div>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              費用として確認する項目
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              卸価格、通貨、有効期限のほか、梱包単位あたりの概算重量、輸送手段、保険料、通関手数料、国内配送を分けて聞くと、利益計算が崩れにくくなります。関税・消費税の適用は、必要に応じて通関業者や専門家へ確認してください。</p>
            <BulletList
              items={[
                "卸価格の対象SKUと、税込みか税別か",
                "ケース入数・梱包サイズ・概算重量",
                "船便・航空便の想定と見積の前提",
                "保険の付保者と補償範囲",
                "輸入者名義と、書類作成の負担",
                "日本到着後の国内配送と保管",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              海外卸の取引条件で見るポイント
            </h2>
            <BlogImage
              id="consultant"
              alt="条件表を確認する手元。輸送と費用の分岐を見るイメージ"
            />
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              インコタームズは、費用と危険の分岐を整理する方法です。EXWとFOBでは、現地での引き取り負担が違います。用語が出てきたら、注文請書の文言を優先してください。支払条件（前払い、デポジット、信用状など）を変えると価格が動くこともあります。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              日本販売そのものの注意は
              <Link href={JA_SALES_CAUTIONS.path} className="text-teal hover:underline">
                食品・化粧品・雑貨の注意点
              </Link>
              を先に見て、輸入してから売れない、を防ぎます。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              納期とサンプル
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              生産リードタイム、輸送日数、通関、国内配送を分けて聞くと、販売計画に載せられます。繁忙期や連休前後は、同じ「4週間」でも着日がずれます。サンプルは有償か、送料はどちらか、量産と同じ仕様かを確認します。</p>
            <p className="mt-5 rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base">
              販売開始日は、入荷確定のあとで決める方が安全です。広告を先に出す場合は、遅延時の案内も用意します。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              見積の前提を揃える
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外仕入れの輸送見積は、重量・容積・出荷地・着地・貨物の種類が揃っていないと比較できません。同じ「送料込み」でも、通関後までか、港までかが違うことがあります。見積の前提を一文で残し、複数の仕入れ先を同じ前提で比べてください。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              支払が前払いの場合、生産遅延のときの扱いも確認します。デポジット比率、残金のタイミング、キャンセル時の扱いが空だと、キャッシュだけが先に出ます。金額の相場はこの記事では示しません。</p>
            <BulletList
              items={[
                "見積の対象（工場出し、港、通関後、国内倉庫）",
                "有効期限と、燃油・為替の変動の扱い",
                "前払い・デポジットの比率と残金時期",
                "遅延・欠品時の連絡期限",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              掲載条件を起点にする
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              <Link href="/cases" className="text-teal hover:underline">
                商品一覧
              </Link>
              に納期や送料の目安がある場合は、それを起点に不足分を質問します。BrandBridgeは輸入代行を行いません。通関や税の判断は専門家へ確認してください。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              着地コストの組み立て方
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外商品の輸入費用は、卸単価に送料を足すだけでは足りません。工場出し、輸出港、海上・航空、保険、通関、国内配送、保管を分けて並べると、どこが未確定かが分かります。未確定の項目を「たぶん安い」と仮定すると、販売価格を先に決めたあとに利益が消えます。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              小ロットほど、輸送の最低料金が単価を押し上げます。MOQを下げた結果、1個あたりの送料が膨らむことがあります。ロットの話と輸送の話は同時に見てください。税率や関税額は案件ごとに異なるため、金額の相場は示しません。必要に応じて通関業者や専門家へ確認してください。</p>
            <BulletList
              items={[
                "工場出しから港までの現地費用",
                "本船・航空の運賃と最低料金",
                "通関後の国内配送と保管",
                "小ロット時の1個あたり送料",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              保険と危険負担
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外仕入れの輸送では、破損・遅延・紛失のときに誰が動くかが、費用と同じくらい重要です。保険の付保者が空欄だと、到着後の写真確認だけが進み、補償の窓口がありません。インコタームズ上の危険の移転と、実際の保険証券が一致しているかを、発注前に一文で確認します。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              食品は温度、化粧品は漏れ、雑貨は塗装や電池の扱いが、クレームの起点になりやすいです。
              <Link href={JA_SALES_CAUTIONS.path} className="text-teal hover:underline">
                日本販売の注意点
              </Link>
              を先に見たうえで、輸送条件に温度帯や梱包強度を書き足してください。BrandBridgeは輸入代行を行いません。補償の可否は契約と保険の内容によります。</p>
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
            費用と条件の確認項目を持ったうえで、掲載の取引条件から候補を比較できます。</p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              href="/cases"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[200px]"
            >
              商品一覧を見る
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
