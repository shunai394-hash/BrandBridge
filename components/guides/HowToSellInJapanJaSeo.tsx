import Link from "next/link";
import { JA_MOQ_GUIDE, JA_BLOG_HUB } from "@/lib/blog/ja-articles/types";

function GoldLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-[#C4A35A] hover:underline">
      {children}
    </Link>
  );
}

/**
 * JA-only SEO / education blocks for /how-to-sell-in-japan.
 * Mirrors the English guide's depth without changing /en/how-to-sell-in-japan.
 */
export function HowToSellInJapanJaSeoEarly() {
  return (
    <>
      <section className="border-b border-black/8 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-center text-[11px] font-medium tracking-[0.22em] text-[#C4A35A] uppercase">
            日本で販売する
          </p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-shippori)] text-3xl text-black md:text-4xl">
            海外ブランドが日本で販売する方法
          </h2>
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-black/65 md:text-base">
            <p>
              日本市場は、品質・表示・納期・説明の厚みを先に見る買い手が少なくありません。海外で売れていることだけでは、卸も小売も採用を決めにくいです。最初に決めるのは「誰が売り、誰が輸入し、どのチャネルから試すか」です。
            </p>
            <p>
              日本法人を置かずに販売する海外ブランドは多くあります。その場合、日本の販売パートナーが輸入・店頭・EC・卸のどれかを担います。全体の進め方は{" "}
              <GoldLink href="/ja/blog/how-overseas-brands-enter-japan">
                海外ブランドの日本進出
              </GoldLink>
              でも整理しています。
            </p>
            <p>
              BrandBridgeは、商品と取引条件を先に見せてから、日本の卸・小売・ECと商談する場です。輸入代行や在庫の買い取りは行いません。条件が見える状態で
              <GoldLink href="/register/maker">商品を登録</GoldLink>
              するか、日本側は
              <GoldLink href="/cases">商品一覧</GoldLink>
              から探せます。
            </p>
          </div>
          <ul className="mt-8 space-y-3 rounded-2xl border border-black/8 bg-[#FAFAF8] p-5 md:p-6">
            {[
              "代理店・卸・小売・EC・インポーターのうち、最初の役割を一つに近づける",
              "MOQ、卸価格、独占、輸送、支払を、空欄のまま問い合わせない",
              "全国一斉発売より、初回数量を区切ったテスト販売から入る",
              "条件が見える商品ページで、日本の販売パートナーと商談する",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-black/70 md:text-base"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C4A35A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-black/8 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-center text-[11px] font-medium tracking-[0.22em] text-[#C4A35A] uppercase">
            販売パートナーの種類
          </p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-shippori)] text-3xl text-black md:text-4xl">
            代理店・卸・小売・EC・インポーターの違い
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-black/60 md:text-base">
            「日本の代理店」は一つの選択肢です。在庫、販路、誰が輸入するかを見ると、別の役割の方が合うことがあります。種類の整理は{" "}
            <GoldLink href="/ja/blog/who-fits-as-japan-sales-partner">
              どんな販売パートナーが向くか
            </GoldLink>
            も参照してください。
          </p>
          <div className="mt-10 space-y-5">
            {[
              {
                title: "販売代理店",
                body: "日本側が販路開拓と販売を担う形です。在庫を持つか、紹介中心かは契約で分かれます。中長期で市場を育てたいときに検討されます。",
              },
              {
                title: "卸売業者",
                body: "ロットで仕入れ、小売や業務先へ供給します。MOQと希望小売の差、返品、再発注の間隔が先に見られます。",
              },
              {
                title: "インポーター",
                body: "輸入者として通関・保管を担い、その後に卸や小売へ流す役割です。ブランド側が日本の在庫を持たないときに使われます。",
              },
              {
                title: "小売（直取引）",
                body: "専門店・百貨店などが直接仕入れる形です。売場の世界観、納品単位、補充の速さに耐えるSKUが求められます。",
              },
              {
                title: "EC事業者",
                body: "モールや自社ECでテスト販売しやすい相手です。写真・説明文・問い合わせ対応の厚みが、店頭より先に効きます。",
              },
              {
                title: "美容サロン・専門チャネル",
                body: "コスメや機器など、説明しながら売る販路です。サンプル、施術との相性、業務用の入数が、量販とは別の条件になります。",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-6"
              >
                <h3 className="font-[family-name:var(--font-shippori)] text-xl text-black">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-black/65 md:text-base">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm leading-relaxed text-black/60 md:text-base">
            代理店の探し方は{" "}
            <GoldLink href="/ja/blog/how-to-find-japanese-distributor">
              日本の販売代理店の探し方
            </GoldLink>
            、卸先は{" "}
            <GoldLink href="/ja/blog/how-to-find-japan-wholesalers">
              日本の卸売業者の探し方
            </GoldLink>
            です。日本側が海外商品を仕入れる手順は{" "}
            <GoldLink href="/ja/blog/how-to-start-overseas-brand-wholesale">
              海外ブランドの仕入れ・卸取引
            </GoldLink>
            にまとめています。
          </p>
        </div>
      </section>
    </>
  );
}

export function HowToSellInJapanJaSeoLate() {
  return (
    <>
      <section className="border-b border-black/8 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-center text-[11px] font-medium tracking-[0.22em] text-[#C4A35A] uppercase">
            販売条件
          </p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-shippori)] text-3xl text-black md:text-4xl">
            日本向けに先に揃える取引条件
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-black/60 md:text-base">
            日本の販売パートナーは、世界観の前に数字を見ます。空欄が多いと、問い合わせ以前に候補から外れます。
          </p>
          <ul className="mt-8 space-y-3">
            {[
              {
                label: "MOQ（最低発注数量）",
                detail:
                  "初回テストに耐える数量か、本発注と同じかを分けて書いてください。",
                href: JA_MOQ_GUIDE.path,
                linkLabel: JA_MOQ_GUIDE.title,
              },
              {
                label: "卸価格・希望小売・マージン",
                detail:
                  "参考卸価格帯でも構いません。希望小売の目安があると、日本側は粗利を計算できます。",
                href: "/ja/blog/how-to-set-wholesale-price-for-japan",
                linkLabel: "日本向け卸価格の考え方",
              },
              {
                label: "独占販売と販売地域",
                detail:
                  "全国・全チャネルの独占は、実績がない段階では重いです。地域・チャネル・期間を区切ると話し合いやすいです。",
              },
              {
                label: "輸送条件・Incoterms",
                detail:
                  "EXW / FOB / CIF / DDP のどれか、出荷元、リードタイムを書いてください。関税込みかどうかで着地コストが変わります。",
              },
              {
                label: "支払条件",
                detail:
                  "銀行送金、Wise など、双方が実務で使える方法を先に示します。サイト上のカードは一例です。",
              },
            ].map((item) => (
              <li
                key={item.label}
                className="rounded-2xl border border-black/8 bg-white p-5 md:p-6"
              >
                <h3 className="font-[family-name:var(--font-shippori)] text-lg text-black">
                  {item.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/65">
                  {item.detail}
                  {"href" in item && item.href ? (
                    <>
                      {" "}
                      詳しくは
                      <GoldLink href={item.href}>{item.linkLabel}</GoldLink>
                      を参照してください。
                    </>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-black/8 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-center text-[11px] font-medium tracking-[0.22em] text-[#C4A35A] uppercase">
            日本進出の実務
          </p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-shippori)] text-3xl text-black md:text-4xl">
            法規制・表示・輸入・契約で先に確認すること
          </h2>
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-black/65 md:text-base">
            <p>
              食品、化粧品、サプリ、電気用品などは、売り方によって表示や届出の確認が必要です。このページでは個別の適法性を断定しません。カテゴリー別の視点は{" "}
              <GoldLink href="/ja/blog/cautions-when-selling-overseas-brands-in-japan">
                海外ブランドを日本で販売する際の注意点
              </GoldLink>
              と、コスメ・食品のガイドを先に見てください。
            </p>
            <p>
              輸入・通関・リードタイム・サンプルの費用感は{" "}
              <GoldLink href="/ja/blog/logistics-lead-time-samples-for-import">
                海外商品の輸入で確認すべき費用と条件
              </GoldLink>
              です。日本語の販売資料（成分、サイズ、使い方、注意）が薄いと、店頭もECも公開が遅れます。
            </p>
            <p>
              契約では、販売地域、チャネル、独占の範囲、不良時の扱い、中途解約を先に書きます。商談前のチェックリストは{" "}
              <GoldLink href="/ja/blog/japan-product-information-checklist">
                日本企業へ渡す商品情報チェックリスト
              </GoldLink>
              と{" "}
              <GoldLink href="/ja/blog/how-to-contact-japanese-sales-partners">
                日本の販売パートナーへの問い合わせ方
              </GoldLink>
              です。
            </p>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-black/45 md:text-sm">
            関税、消費税、表示義務は品目と売り方で変わります。実務の方向性であり、税務・法務の助言ではありません。
          </p>
        </div>
      </section>

      <section className="border-b border-black/8 py-12 md:py-14">
        <div className="mx-auto max-w-3xl px-5 text-sm leading-relaxed text-black/65 md:text-base">
          <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-black md:text-3xl">
            関連する日本語ガイド
          </h2>
          <ul className="mt-6 space-y-3">
            {[
              {
                href: "/ja/blog/how-to-sell-overseas-brands-in-japan",
                label: "海外ブランドを日本で販売する方法",
                note: "チャネル・契約・輸入の基本",
              },
              {
                href: "/ja/blog/how-to-find-japanese-distributor",
                label: "日本の販売代理店の探し方",
                note: "代理店を選ぶときの実務",
              },
              {
                href: JA_MOQ_GUIDE.path,
                label: "海外商品のMOQとは",
                note: "小ロット仕入れで見る点",
              },
              {
                href: "/ja/blog/how-to-sell-overseas-cosmetics-in-japan",
                label: "海外コスメブランドの日本進出",
                note: "美容・コスメの確認視点",
              },
              {
                href: "/ja/blog/how-to-sell-overseas-food-brands-in-japan",
                label: "海外食品ブランドの日本進出",
                note: "食品・飲料の確認視点",
              },
              {
                href: JA_BLOG_HUB.path,
                label: JA_BLOG_HUB.label,
                note: "仕入れ・卸・日本進出の記事一覧",
              },
            ].map((item) => (
              <li key={item.href}>
                <GoldLink href={item.href}>{item.label}</GoldLink>
                <span className="text-black/50"> — {item.note}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/register/maker"
              className="inline-flex items-center justify-center rounded-md bg-[#C4A35A] px-6 py-3 text-sm font-medium text-black transition hover:bg-[#d4b56e]"
            >
              海外ブランドとして商品を登録
            </Link>
            <Link
              href="/cases"
              className="inline-flex items-center justify-center rounded-md border border-black/15 bg-white px-6 py-3 text-sm font-medium text-black transition hover:border-black/30"
            >
              日本で販売可能な商品を見る
            </Link>
            <Link
              href="/register/partner"
              className="inline-flex items-center justify-center rounded-md border border-black/15 bg-white px-6 py-3 text-sm font-medium text-black transition hover:border-black/30"
            >
              販売パートナーとして登録
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
