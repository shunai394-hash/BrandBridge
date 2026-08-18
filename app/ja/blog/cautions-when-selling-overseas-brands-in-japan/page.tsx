import type { Metadata } from "next";
import Link from "next/link";
import { BlogImage } from "@/components/blog/BlogImage";
import { Button } from "@/components/ui/Button";
import {
  EXISTING_JA_BLOG,
  JA_JAPAN_ENTRY,
  JA_SALES_CAUTIONS,
} from "@/lib/blog/ja-articles/types";
import { selfLanguageAlternates } from "@/lib/hreflang";
import { getSiteUrl } from "@/lib/site";

const PATH = JA_SALES_CAUTIONS.path;
const TITLE = JA_SALES_CAUTIONS.title;
const DESCRIPTION =
  "海外ブランドを日本で販売するときの注意点。食品・化粧品・雑貨で先に確認したい表示、輸入、チャネル制限の実務項目を整理します。適法性は断定しません。";

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

export default function CautionsWhenSellingOverseasBrandsInJapanPage() {
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
            海外ブランド向け日本市場ガイド
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-shippori)] text-[1.55rem] leading-[1.3] text-white sm:text-3xl md:text-4xl">
            {TITLE}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
            海外で流通していることと、日本で販売してよいことは別です。カテゴリーごとに先に見る項目を整理します。</p>
          <BlogImage
            id="gardenTsukubai"
            alt="日本庭園の手水鉢。日本販売前に条件を丁寧に確認するイメージ"
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
            海外ブランド向け
          </p>
          <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted md:text-base">
            <p>
              海外ブランドの輸入販売では、効能や売上の見込みより先に、「日本のどのチャネルで、誰の名義で売るか」と「表示・書類が足りるか」が問題になります。</p>
            <p>
              販売チャネルと契約の基本は
              <Link href={EXISTING_JA_BLOG.path} className="text-teal hover:underline">
                日本で販売する方法
              </Link>
              、パートナー探しは
              <Link href={JA_JAPAN_ENTRY.path} className="text-teal hover:underline">
                日本進出と販売パートナー
              </Link>
              で扱っています。この記事は注意点に絞り、適法性は断定しません。該当しそうな場合は専門家・関係機関へ確認してください。</p>
          </div>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              カテゴリーを問わず先に確認すること
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              日本国内の既存販売先、独占の範囲、誰が輸入者になるか、日本語の商品情報があるかです。ここが空のままパートナーを探すと、興味はあっても取り扱い判断に進みません。カテゴリー固有の論点は後段に分けます。</p>
            <BulletList
              items={[
                "日本での既存販売・越境ECの有無",
                "販売可能なチャネルの制限",
                "輸入者名義と必要書類の所在",
                "日本語の仕様、成分、注意書きの有無",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              食品で確認したいこと
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              期限、保存温度、原材料の開示、添加物、アレルゲン表示の要否が論点になりやすいです。賞味期限が入荷後に短すぎると、卸も小売も在庫を持てません。詳細な可否は、この記事では判断しません。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外で通っているレシピや包装を、日本向けにそのまま使う前提で話を進めると、入荷後に店頭へ出せない、という順序になります。原材料表、製造者情報、保存方法が英語のままでよいかは、この記事では断定しません。日本の販売パートナーが先に見たいのは、期限の残り日数と、温度帯が自社物流に載るかです。カテゴリー別の仕入れ入口は
              <Link href="/ja/categories/food" className="text-teal hover:underline">
                海外食品のページ
              </Link>
              からも確認できます。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              化粧品で確認したいこと
            </h2>
            <BlogImage
              id="kimono"
              alt="日本の装い。化粧品や雑貨が現地の売場に合うかを見極めるイメージ"
            />
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              全成分、効能のうたい方、容器表示、サンプルと量産の差が論点になりやすいです。海外の広告表現をそのまま日本語にすると、日本側が掲載を止めざるを得ないことがあります。表現の適法性は専門家へ確認してください。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外ブランド側が用意できる全成分表の言語、更新日、対象SKUの対応が曖昧だと、日本側は店頭・ECの原稿を作れません。サンプルの香りや色が量産と違う場合、化粧品は返品対応の負担が大きくなりやすいです。受け入れ基準を発注前に一文残してください。<Link href="/ja/categories/cosmetics" className="text-teal hover:underline">
                海外コスメのページ
              </Link>
              では、仕入れ前の確認項目もまとめています。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              雑貨で確認したいこと
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              材質、対象年齢、電池・電気、塗装、梱包サイズと重量が、売場より先に物流コストを決めます。ホーム・ライフスタイルは
              <Link href="/ja/categories/home" className="text-teal hover:underline">
                海外ホーム商品のページ
              </Link>
              も参照できます。電圧や安全表示が必要な製品は、販売前に関係機関・専門家へ確認してください。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              表示・広告・サンプルで食い違いやすい点
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外の商品ページやSNSの表現を、そのまま日本語の店頭・ECに載せるのは避けます。効能、対象者、使用方法の書き方が、日本側の掲載ルールと合わないことがあります。断定せず、表現案は日本の販売パートナーと専門家の確認を挟んでください。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              サンプルと量産で、色、香り、パッケージ印刷、付属品が変わることもあります。差が出たときの写真確認と、受け入れ基準を発注前に一文あるだけで、後のトラブルが減ります。食品・化粧品は期限と保存条件も、サンプル時点で開示されているかを見ます。</p>
            <BulletList
              items={[
                "日本語で残す注意書きの担当（ブランドか輸入者か）",
                "広告・店頭・ECで使う表現の確認ルート",
                "サンプルと量産の差分を誰が写真で確認するか",
                "期限・ロット番号の追跡方法",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              パートナーと条件を先に見せる
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              日本の事業者は
              <Link href="/cases" className="text-teal hover:underline">
                商品一覧
              </Link>
              のように、取引条件を先に見ます。注意点を隠したまま掲載すると、問い合わせのあとで話が止まります。進め方は
              <Link href="/for-makers" className="text-teal hover:underline">
                商品提供企業の方へ
              </Link>
              から確認できます。</p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              輸入者名義とチャネル制限
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外ブランドの日本販売では、誰が輸入者になるかが後回しにされやすいです。ブランド本体、日本の卸、小売、EC事業者が、それぞれ別の名義になり得ます。名義が決まらないまま「日本で売れる」と伝えると、書類と表示の担当が空欄のまま商談だけが進みます。適法性は断定せず、関係機関・専門家への確認を挟んでください。</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              チャネル制限も、注意点の中心です。店舗可・EC不可、百貨店のみ、既存代理店の地域がある、といった条件は、食品・化粧品・雑貨のどれでも先に出します。隠したまま掲載すると、問い合わせのあとで取り扱い不可になり、双方の時間が失われます。</p>
            <BulletList
              items={[
                "輸入者候補と、書類の保管場所",
                "店舗・EC・卸再販の可否",
                "既存の日本販売先と独占の範囲",
                "日本語表示の作成担当",
              ]}
            />
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
            日本の販売パートナーを探す
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            注意点を踏まえた商品情報と取引条件を先に揃え、日本の卸・小売・ECとの接点を作れます。</p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              href="/for-makers"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[200px]"
            >
              日本の販売パートナーを探す
            </Button>
            <Button
              href="/register/maker"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-[180px]"
            >
              商品提供企業として登録
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
