import type { Metadata } from "next";
import Link from "next/link";
import { BlogImage } from "@/components/blog/BlogImage";
import { Button } from "@/components/ui/Button";
import { pickCanonicalPublicCases } from "@/lib/case-canonical";
import { listOpenCases } from "@/lib/cases";
import { JA_WHOLESALE_GUIDE } from "@/lib/blog/ja-articles/types";
import { selfLanguageAlternates } from "@/lib/hreflang";
import { getSiteUrl } from "@/lib/site";

const PATH = JA_WHOLESALE_GUIDE.path;
const TITLE = JA_WHOLESALE_GUIDE.title;
const DESCRIPTION =
  "海外ブランドの卸・仕入れを始めたい日本の事業者向け。仕入先の探し方、MOQ、卸価格、輸送・輸入条件の確認から、商品一覧での比較まで実務の順に解説します。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...selfLanguageAlternates(PATH, "ja"),
  robots: {
    index: true,
    follow: true,
  },
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

async function listExampleProducts() {
  try {
    const cases = pickCanonicalPublicCases(await listOpenCases());
    return cases.slice(0, 3).map((item) => ({
      href: `/cases/${item.id}`,
      name: item.productName || item.title,
      category: item.category,
    }));
  } catch {
    return [];
  }
}

export default async function HowToStartOverseasBrandWholesalePage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${PATH}`;
  const examples = await listExampleProducts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "ホーム",
            item: siteUrl,
          },
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
            海外ブランドの卸を始めたい卸売業者、小売店、EC事業者、バイヤー向けに、仕入先の探し方からMOQ・輸入条件の確認まで、発注前の実務を順に整理します。
          </p>
          <BlogImage
            id="souvenirShop"
            alt="店頭に並ぶ商品。海外ブランドの卸仕入れを検討するときの売場イメージ"
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
              海外ブランドの仕入れを始めたいとき、最初に詰まりやすいのは「どの輸入仕入先に連絡するか」ではなく、「卸として成立する条件が見えているか」です。
            </p>
            <p>
              海外商品の仕入れは、写真や世界観だけでは判断できません。卸価格、最低発注数量（MOQ）、輸送、輸入時の負担、日本での販売可否を揃えてから、初めて発注の是非を検討できます。
            </p>
            <p>
              この記事では、海外ブランドの卸取引を始める手順を、探し方から確認項目まで実務の順にまとめます。販売チャネルの作り方そのものは、別の
              <Link
                href="/ja/blog/how-to-sell-overseas-brands-in-japan"
                className="text-teal hover:underline"
              >
                日本で販売するガイド
              </Link>
              で扱っています。
            </p>
          </div>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              海外ブランドの探し方
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              仕入先探しは、連絡先の件数より、再販できる地域と数量が見えるかを基準にします。展示会、メーカーへの直接問い合わせ、海外の卸、条件が見える掲載ページなど、ルートは複数あります。
            </p>
            <BlogImage
              id="shoppingStreet"
              alt="日本の商店街。海外ブランドの商品を店頭やECで扱うときの販路イメージ"
            />
            <h3 className="mt-8 font-[family-name:var(--font-shippori)] text-xl text-navy">
              取引条件から比較する
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              問い合わせの前に、
              <Link href="/cases" className="text-teal hover:underline">
                商品一覧
              </Link>
              でカテゴリ、販売形式、MOQ、参考卸価格帯を並べて見ると、自社で抱えられる数量かを先に判断できます。条件が空欄の候補は、連絡しても発注判断まで時間がかかりやすいです。
            </p>
            <h3 className="mt-8 font-[family-name:var(--font-shippori)] text-xl text-navy">
              カテゴリー別に絞り込む
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              食品とコスメでは、期限・表示・サンプルの確認項目が違います。先にカテゴリーページで確認事項を読み、掲載商品へ進むと漏れが減ります。例として
              <Link
                href="/ja/categories/cosmetics"
                className="text-teal hover:underline"
              >
                海外コスメの仕入れ
              </Link>
              や
              <Link
                href="/ja/categories/food"
                className="text-teal hover:underline"
              >
                海外食品の仕入れ
              </Link>
              から、取り扱い分野を絞れます。
            </p>
            {examples.length > 0 ? (
              <>
                <h3 className="mt-8 font-[family-name:var(--font-shippori)] text-xl text-navy">
                  商品詳細で条件を確認する
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
                  一覧で候補を絞ったあと、商品詳細で仕様と取引条件を確認します。以下は現在公開中の掲載例です。数値や売れ行きは記載せず、条件の見え方を見る入口として使ってください。
                </p>
                <ul className="mt-4 space-y-2.5">
                  {examples.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-teal hover:underline">
                        {item.name}
                        {item.category ? `（${item.category}）` : ""}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              卸取引の基本
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外ブランドの卸は、小売価格で買うのではなく、再販を前提にした取引条件で仕入れることです。誰が輸出者か、誰が輸入者か、どの通貨で支払うか、日本のどのチャネルで売ってよいかを、口頭ではなく文書で確認します。
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              メーカー直、海外の卸、現地ディストリビューターでは、同じ商品でも数量と価格が違うことがあります。輸入仕入先を一つに決めなくても、初回はサンプルと小ロット、継続後に直接取引へ移す、という段階はよくあります。
            </p>
            <p className="mt-5 rounded-lg border border-border bg-cream/60 px-5 py-4 text-sm font-medium leading-relaxed text-navy md:text-base">
              卸の成立条件は「安さ」より、再販可能な範囲と、初回数量を売り切る計画が見えていることです。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              MOQの説明
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              MOQは、ブランド側が生産・梱包・輸出を成立させる最低単位です。単価が良く見えても、その数量を自社の販路で回転させられなければ、在庫とキャッシュが先に固定されます。
            </p>
            <BlogImage
              id="consultant"
              alt="取引条件や数字を確認する手元。MOQや卸価格の確認作業"
            />
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              初めての海外ブランド仕入れでは、初回だけ小さくできるか、サンプルで中身を確認できるかを先に聞きます。MOQの考え方の詳細は
              <Link
                href="/ja/blog/what-is-moq-for-overseas-products"
                className="text-teal hover:underline"
              >
                MOQの解説
              </Link>
              も参照できます。
            </p>
            <BulletList
              items={[
                "希望小売価格から、送料・関税・国内物流を足した粗利が残るか",
                "初回数量を、何週間・何か月で売り切る想定か",
                "再発注のリードタイムが、欠品と過剰在庫のどちらに振れやすいか",
              ]}
            />
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              卸価格・輸送・輸入条件の確認ポイント
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              価格表の一行だけでは、着地コストは分かりません。通貨、有効期限、インコタームズ（費用と危険の分岐）、誰が通関するかまで揃えて比較します。用語の解釈は案件ごとに分かれるため、注文請書の文言を優先してください。
            </p>
            <BulletList
              items={[
                "卸価格と通貨、価格の有効期限",
                "ケース入数・梱包単位・概算重量",
                "輸送手段（船便・航空便など）と標準納期",
                "送料・保険の負担者",
                "輸入者名義と、必要な書類の有無",
                "不良・破損時の写真確認と交換ルール",
              ]}
            />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              個別案件の税務・規制は、この記事では断定しません。該当しそうなカテゴリーは、発注前に専門家へ確認してください。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              日本で販売する際の確認事項
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              海外で流通していることと、日本で販売してよいことは別です。食品、化粧品、健康関連、電気製品などは、表示や認証の確認が先になります。効能や売上を断定せず、「自社チャネルで扱えるか」を先に調べます。
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              あわせて、日本国内の既存販売先と独占の範囲を確認します。すでに独占契約がある場合、新しい卸として入れないことがあります。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              仕入先選定時のチェックポイント
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              輸入仕入先を選ぶときは、連絡の速さより、条件が後から変わらないかを見ます。
            </p>
            <BlogImage
              id="gardenTsukubai"
              alt="日本庭園の手水鉢。仕入先の条件を丁寧に確認するイメージ"
            />
            <BulletList
              items={[
                "日本への再販が契約上許されているか",
                "MOQと初回例外の有無",
                "サンプルの可否と送料負担",
                "納期のばらつきと再発注単位",
                "返品・不良の責任分界が文書にあるか",
                "既存の日本販売制限がないか",
              ]}
            />
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              条件の確認で行き詰まった場合は、
              <Link href="/contact" className="text-teal hover:underline">
                お問い合わせ
              </Link>
              から掲載や取引の進め方を質問できます。
            </p>
          </section>

          <section className="mt-12 border-t border-border pt-10">
            <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy md:text-3xl">
              BrandBridgeを利用するメリット
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              BrandBridgeは、海外ブランドと日本の販売パートナーが、商品情報と取引条件を確認してから商談へ進む場です。紹介だけで終わらせず、MOQや卸の目安が見える状態で候補を比較できます。
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              掲載条件は目安であり、最終条件は個別確認です。写真や世界観だけで決めず、数量と着地コストから逆算してください。仕入れルート全般の整理は
              <Link
                href="/ja/blog/how-to-source-overseas-brands"
                className="text-teal hover:underline"
              >
                仕入れ方法のガイド
              </Link>
              もあわせて読めます。
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
            MOQや卸条件を確認しながら、取り扱い候補を比較できます。
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              href="/cases"
              className="w-full py-3.5 text-base sm:w-auto sm:min-w-[200px]"
            >
              商品一覧を見る
            </Button>
            <Button
              href="/contact"
              variant="outline"
              className="w-full border-white/40 py-3.5 text-base text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-[180px]"
            >
              問い合わせる
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
