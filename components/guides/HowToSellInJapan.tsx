"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Locale = "en" | "ja";

type HowToSellInJapanProps = {
  locale: Locale;
};

const gold = "#C4A35A";

function Arrow({ className = "" }: { className?: string }) {
  return (
    <span
      className={`guide-arrow inline-flex items-center justify-center ${className}`}
      aria-hidden
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12h12M13 6l6 6-6 6"
          stroke={gold}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function FlowNode({ label }: { label: string }) {
  return (
    <div className="flex min-w-[7.5rem] flex-col items-center gap-2 text-center sm:min-w-[8.5rem]">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#C4A35A]/55 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#C4A35A]" />
      </div>
      <p className="text-sm font-medium tracking-wide text-black">{label}</p>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-[11px] font-medium tracking-[0.22em] text-[#C4A35A] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-shippori)] text-3xl text-black md:text-4xl">
        {title}
      </h2>
      {body ? (
        <p className="mt-4 text-sm leading-relaxed text-black/60 md:text-base">
          {body}
        </p>
      ) : null}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-black/8 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

function EmojiMarquee() {
  const items = ["🇺🇸", "📦", "✈️", "🇯🇵", "🏪", "🛒"] as const;
  const sequence = [...items, ...items];

  return (
    <div
      className="guide-marquee relative mt-10 overflow-hidden border-y border-black/8 bg-white py-8"
      aria-hidden
    >
      <div className="guide-marquee-track flex w-max items-center gap-6 md:gap-10">
        {sequence.map((emoji, i) => (
          <div key={`${emoji}-${i}`} className="flex items-center gap-6 md:gap-10">
            <span className="text-4xl md:text-5xl">{emoji}</span>
            <span className="text-2xl text-[#C4A35A] md:text-3xl">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncotermCards({
  items,
  hint,
}: {
  items: { code: string; blurb: string }[];
  hint: string;
}) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      <p className="mb-4 text-center text-xs text-black/45">{hint}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const active = open === item.code;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setOpen(active ? null : item.code)}
              className={[
                "rounded-2xl border bg-white p-5 text-left transition",
                active
                  ? "border-[#C4A35A] shadow-[0_12px_32px_rgba(196,163,90,0.18)]"
                  : "border-black/8 shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:border-black/20",
              ].join(" ")}
              aria-expanded={active}
            >
              <p className="font-[family-name:var(--font-shippori)] text-2xl text-black">
                {item.code}
              </p>
              <p
                className={[
                  "mt-3 text-sm leading-relaxed text-black/60 transition",
                  active ? "opacity-100" : "opacity-0",
                ].join(" ")}
              >
                {active ? item.blurb : "\u00a0"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const copy = {
  en: {
    eyebrow: "USA → Japan Import Guide",
    title: "How to Sell in Japan",
    lead: "A clear path for overseas manufacturers—from product registration to shipping and selling with Japanese partners. Understand the flow in about five minutes.",
    introTitle: "New to selling in Japan?",
    introBody: "Don't worry. This guide explains everything in simple steps.",
    step1Title: "The journey",
    step1Nodes: [
      "USA Manufacturer",
      "Register Product",
      "BrandBridge",
      "Japanese Sales Partner",
      "Customers",
    ],
    step2Title: "How it works",
    step2Steps: [
      "Register your product",
      "Japanese partners discover it",
      "Receive inquiries",
      "Negotiate",
      "Agree on terms",
      "Ship",
      "Start selling in Japan",
    ],
    step3Title: "Who does what?",
    roles: [
      {
        title: "Manufacturer",
        items: ["Register product", "Provide quotation", "Ship products"],
      },
      {
        title: "Japanese Partner",
        items: ["Marketing", "Sales", "Distribution"],
      },
      {
        title: "BrandBridge",
        items: ["Matching", "Messaging", "Negotiation"],
      },
    ],
    step4Title: "Shipping",
    step4Body:
      "Any major international courier can be used. Your partner receives goods in Japan and handles local distribution.",
    carriers: ["FedEx", "UPS", "DHL", "EMS"],
    step5Title: "Payments",
    step5Body:
      "Partners pay manufacturers directly. Choose the method that fits both sides.",
    payments: ["Wire Transfer", "Wise", "PayPal", "Stripe"],
    step6Title: "Import procedure",
    step6Body:
      "In most cases, your Japanese sales partner handles the import process.",
    step7Title: "Customs & Taxes",
    step7Body:
      "Import duties and taxes depend on the product category. Your Japanese sales partner can assist with customs procedures.",
    marketTitle: "Japan market at a glance",
    marketCards: [
      { icon: "🇯🇵", title: "125M Consumers" },
      { icon: "🛒", title: "Large E-commerce Market" },
      { icon: "🏪", title: "Retail Distribution" },
      { icon: "🤝", title: "Business Partners" },
    ],
    incotermsTitle: "Incoterms (simple)",
    incotermsHint: "Tap a card for a one-line explanation.",
    incoterms: [
      {
        code: "EXW",
        blurb: "Buyer picks up from your factory—you handle almost nothing after that.",
      },
      {
        code: "FOB",
        blurb: "You deliver goods to the port/airport; buyer takes over shipping from there.",
      },
      {
        code: "CIF",
        blurb: "You cover cost, insurance, and freight to the destination port.",
      },
      {
        code: "DDP",
        blurb: "You deliver to the buyer’s door, including duties and taxes.",
      },
    ],
    compareTitle: "Why BrandBridge?",
    compareUsual: "Usual way",
    compareUsualItems: ["Email outreach", "Trade shows", "Agency hunting"],
    compareBb: "BrandBridge",
    compareBbItems: [
      "Free to list",
      "Japanese companies contact you",
      "Built-in negotiation",
    ],
    whyBb: [
      "Free product registration",
      "Direct inquiries",
      "MOQ negotiation",
      "Exclusive distribution discussions",
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        q: "Do I need a company in Japan?",
        a: "No.",
      },
      {
        q: "Can I ship directly from the USA?",
        a: "Yes.",
      },
      {
        q: "Who handles customs?",
        a: "Usually your Japanese sales partner.",
      },
      {
        q: "How much does it cost?",
        a: "Registration is free.",
      },
      {
        q: "Does BrandBridge import or purchase products?",
        a: "No. BrandBridge connects overseas brands with Japanese sales partners. Business agreements are made directly between both companies.",
      },
    ],
    ctaBadges: [
      "Free Registration",
      "About 5 Minutes",
      "No Japanese Company Required",
    ],
    finalTitle: "Ready to sell in Japan?",
    ctaButton: "Register Product",
    ctaHref: "/en/register/maker",
  },
  ja: {
    eyebrow: "USA → 日本 輸入ガイド",
    title: "日本で販売する方法",
    lead: "海外メーカーが商品登録から、日本の販売パートナーとの出荷・販売までを把握できるガイドです。初心者でも約5分で流れがわかります。",
    introTitle: "日本販売は初めてですか？",
    introBody: "大丈夫です。このガイドで流れをかんたんに説明します。",
    step1Title: "全体の流れ",
    step1Nodes: [
      "海外メーカー",
      "商品登録",
      "BrandBridge",
      "日本の販売パートナー",
      "お客様",
    ],
    step2Title: "進め方",
    step2Steps: [
      "商品を登録する",
      "日本のパートナーが発見する",
      "問い合わせを受ける",
      "交渉する",
      "条件に合意する",
      "出荷する",
      "日本での販売を開始する",
    ],
    step3Title: "役割分担",
    roles: [
      {
        title: "メーカー",
        items: ["商品登録", "見積・条件提示", "商品の出荷"],
      },
      {
        title: "日本のパートナー",
        items: ["マーケティング", "販売", "流通"],
      },
      {
        title: "BrandBridge",
        items: ["マッチング", "メッセージ", "交渉の場"],
      },
    ],
    step4Title: "配送",
    step4Body:
      "主要な国際宅配便を利用できます。日本側のパートナーが荷受けし、国内流通を担います。",
    carriers: ["FedEx", "UPS", "DHL", "EMS"],
    step5Title: "支払い",
    step5Body:
      "パートナーからメーカーへ直接支払いが行われます。双方に合う方法を選べます。",
    payments: ["銀行送金", "Wise", "PayPal", "Stripe"],
    step6Title: "輸入手続き",
    step6Body:
      "多くの場合、輸入手続きは日本の販売パートナーが対応します。",
    step7Title: "関税・税金",
    step7Body:
      "関税・税金は商品カテゴリにより異なります。通関手続きは日本の販売パートナーがサポートできます。",
    marketTitle: "日本市場のポイント",
    marketCards: [
      { icon: "🇯🇵", title: "1.25億の消費者" },
      { icon: "🛒", title: "大きなEC市場" },
      { icon: "🏪", title: "小売・流通ネットワーク" },
      { icon: "🤝", title: "ビジネスパートナー" },
    ],
    incotermsTitle: "インコタームズ（かんたん版）",
    incotermsHint: "カードをタップすると1行で説明します。",
    incoterms: [
      {
        code: "EXW",
        blurb: "工場渡し。出荷後の手配はほぼ買い手が担当します。",
      },
      {
        code: "FOB",
        blurb: "港・空港まで届け、そこから先の輸送は買い手が担当します。",
      },
      {
        code: "CIF",
        blurb: "運賃・保険料込みで仕向港まで手配します。",
      },
      {
        code: "DDP",
        blurb: "関税込みで買い手の指定場所まで届けます。",
      },
    ],
    compareTitle: "BrandBridgeの強み",
    compareUsual: "一般的な方法",
    compareUsualItems: ["メール営業", "展示会", "代理店探し"],
    compareBb: "BrandBridge",
    compareBbItems: ["無料で掲載", "日本企業から連絡", "交渉機能あり"],
    whyBb: [
      "商品登録は無料",
      "直接の問い合わせ",
      "MOQの交渉",
      "独占流通の相談",
    ],
    faqTitle: "よくある質問",
    faqs: [
      {
        q: "日本に会社は必要ですか？",
        a: "いいえ、不要です。",
      },
      {
        q: "アメリカから直接送れますか？",
        a: "はい、可能です。",
      },
      {
        q: "通関は誰が行いますか？",
        a: "多くの場合、日本の販売パートナーが対応します。",
      },
      {
        q: "費用はいくらかかりますか？",
        a: "登録は無料です。",
      },
      {
        q: "BrandBridgeは輸入や商品の買い取りをしますか？",
        a: "いいえ。BrandBridgeは海外ブランドと日本の販売パートナーをつなぐ場です。取引契約は両社の間で直接行われます。",
      },
    ],
    ctaBadges: ["登録無料", "約5分", "日本法人は不要"],
    finalTitle: "日本で売り始めませんか？",
    ctaButton: "商品を登録する",
    ctaHref: "/register/maker",
  },
} as const;

export function HowToSellInJapan({ locale }: HowToSellInJapanProps) {
  const t = copy[locale];
  const flowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = flowRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="bg-[#FAFAF8] text-black" lang={locale}>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black/8 bg-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at 15% 20%, rgba(196,163,90,0.14), transparent 45%), radial-gradient(ellipse at 90% 80%, rgba(0,0,0,0.04), transparent 40%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-5 py-16 text-center md:py-24">
          <p className="text-[11px] font-medium tracking-[0.22em] text-[#C4A35A] uppercase">
            {t.eyebrow}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-shippori)] text-4xl text-black md:text-5xl">
            {t.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-black/60 md:text-base">
            {t.lead}
          </p>
          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-[#C4A35A]/35 bg-[#FAFAF8] px-5 py-5 md:px-6">
            <p className="font-[family-name:var(--font-shippori)] text-xl text-black md:text-2xl">
              {t.introTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-black/60 md:text-base">
              {t.introBody}
            </p>
          </div>
        </div>
      </section>

      {/* Animated emoji journey */}
      <EmojiMarquee />

      {/* STEP 1 — Flow */}
      <section className="border-b border-black/8 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <SectionTitle eyebrow="STEP 1" title={t.step1Title} />
          <div
            ref={flowRef}
            className={`guide-flow-enter mt-12 flex flex-wrap items-center justify-center gap-2 md:gap-1 ${
              visible ? "is-visible" : ""
            }`}
          >
            {t.step1Nodes.map((node, i) => (
              <div key={node} className="flex items-center gap-1 md:gap-2">
                {i > 0 ? <Arrow className="hidden sm:inline-flex" /> : null}
                <FlowNode label={node} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEP 2 — Timeline */}
      <section className="border-b border-black/8 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <SectionTitle eyebrow="STEP 2" title={t.step2Title} />
          <ol className="relative mt-12 space-y-0">
            <div
              className="absolute top-3 bottom-3 left-[1.15rem] w-px bg-gradient-to-b from-[#C4A35A] via-black/15 to-transparent md:left-[1.35rem]"
              aria-hidden
            />
            {t.step2Steps.map((step, i) => (
              <li key={step} className="relative flex gap-5 pb-8 last:pb-0">
                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C4A35A] bg-white text-xs font-medium text-[#C4A35A] md:h-11 md:w-11 md:text-sm">
                  {i + 1}
                </div>
                <div className="pt-1.5 md:pt-2.5">
                  <p className="text-base font-medium text-black md:text-lg">
                    {step}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* STEP 3 — Roles */}
      <section className="border-b border-black/8 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <SectionTitle eyebrow="STEP 3" title={t.step3Title} />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {t.roles.map((role) => (
              <Card key={role.title}>
                <p className="text-[11px] font-medium tracking-[0.18em] text-[#C4A35A] uppercase">
                  Role
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-black">
                  {role.title}
                </h3>
                <ul className="mt-5 space-y-2.5">
                  {role.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-black/70"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C4A35A]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* STEP 4 — Shipping */}
      <section className="border-b border-black/8 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-5">
          <SectionTitle
            eyebrow="STEP 4"
            title={t.step4Title}
            body={t.step4Body}
          />
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <FlowNode
              label={locale === "en" ? "Manufacturer" : "メーカー"}
            />
            <Arrow />
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
              {t.carriers.map((c) => (
                <div
                  key={c}
                  className="rounded-lg border border-black/10 bg-[#FAFAF8] px-4 py-3 text-center text-sm font-medium tracking-wide text-black"
                >
                  {c}
                </div>
              ))}
            </div>
            <Arrow />
            <FlowNode label={locale === "en" ? "Japan" : "日本"} />
            <Arrow />
            <FlowNode
              label={locale === "en" ? "Partner" : "パートナー"}
            />
          </div>
        </div>
      </section>

      {/* STEP 5 — Payments */}
      <section className="border-b border-black/8 py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-5">
          <SectionTitle
            eyebrow="STEP 5"
            title={t.step5Title}
            body={t.step5Body}
          />
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <FlowNode
              label={locale === "en" ? "Partner" : "パートナー"}
            />
            <Arrow />
            <FlowNode
              label={locale === "en" ? "Manufacturer" : "メーカー"}
            />
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {t.payments.map((p) => (
              <span
                key={p}
                className="rounded-full border border-[#C4A35A]/40 bg-white px-4 py-2 text-sm text-black"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STEP 6 & 7 */}
      <section className="border-b border-black/8 bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-5 px-5 md:grid-cols-2">
          <Card>
            <p className="text-[11px] font-medium tracking-[0.18em] text-[#C4A35A] uppercase">
              STEP 6
            </p>
            <h3 className="mt-3 font-[family-name:var(--font-shippori)] text-2xl text-black">
              {t.step6Title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-black/65">
              {t.step6Body}
            </p>
          </Card>
          <Card>
            <p className="text-[11px] font-medium tracking-[0.18em] text-[#C4A35A] uppercase">
              STEP 7
            </p>
            <h3 className="mt-3 font-[family-name:var(--font-shippori)] text-2xl text-black">
              {t.step7Title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-black/65">
              {t.step7Body}
            </p>
          </Card>
        </div>
      </section>

      {/* Market data */}
      <section className="border-b border-black/8 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <SectionTitle eyebrow="MARKET" title={t.marketTitle} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.marketCards.map((card) => (
              <Card key={card.title} className="!p-6 text-center">
                <p className="text-4xl" aria-hidden>
                  {card.icon}
                </p>
                <h3 className="mt-4 font-[family-name:var(--font-shippori)] text-xl text-black">
                  {card.title}
                </h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Incoterms */}
      <section className="border-b border-black/8 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-5">
          <SectionTitle eyebrow="SHIPPING TERMS" title={t.incotermsTitle} />
          <div className="mt-10">
            <IncotermCards items={[...t.incoterms]} hint={t.incotermsHint} />
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-b border-black/8 py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-5">
          <SectionTitle eyebrow="COMPARE" title={t.compareTitle} />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <Card className="bg-[#F3F3F1]">
              <p className="text-[11px] font-medium tracking-[0.18em] text-black/40 uppercase">
                {t.compareUsual}
              </p>
              <ul className="mt-5 space-y-3">
                {t.compareUsualItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-base text-black/55"
                  >
                    <span className="text-black/30">↓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="border-[#C4A35A]/50">
              <p className="text-[11px] font-medium tracking-[0.18em] text-[#C4A35A] uppercase">
                {t.compareBb}
              </p>
              <ul className="mt-5 space-y-3">
                {t.compareBbItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-base font-medium text-black"
                  >
                    <span className="text-[#C4A35A]">↓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <ul className="mt-8 space-y-2 border-t border-black/8 pt-6">
                {t.whyBb.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-black/70"
                  >
                    <span className="text-[#C4A35A]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-black/8 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <SectionTitle eyebrow="FAQ" title={t.faqTitle} />
          <div className="mt-12 space-y-4">
            {t.faqs.map((faq) => (
              <Card key={faq.q} className="!p-5 md:!p-6">
                <p className="font-medium text-black">{faq.q}</p>
                <p className="mt-2 text-sm text-black/60">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — full bleed */}
      <section className="relative flex min-h-[min(70vh,640px)] items-center justify-center overflow-hidden bg-black px-5 py-24 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(196,163,90,0.28), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative w-full max-w-4xl text-center">
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3 md:mb-10 md:gap-4">
            {t.ctaBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-2 rounded-full border border-[#C4A35A]/45 bg-white/5 px-4 py-2 text-sm text-white/90"
              >
                <span className="text-[#C4A35A]" aria-hidden>
                  ✓
                </span>
                {badge}
              </span>
            ))}
          </div>
          <h2 className="font-[family-name:var(--font-shippori)] text-4xl leading-tight md:text-6xl lg:text-7xl">
            {t.finalTitle}
          </h2>
          <div className="mt-10 md:mt-14">
            <Link
              href={t.ctaHref}
              className="inline-flex w-full max-w-md items-center justify-center rounded-md bg-[#C4A35A] px-10 py-4 text-base font-medium tracking-wide text-black transition hover:bg-[#d4b56e] md:w-auto md:min-w-[280px] md:py-5 md:text-lg"
            >
              {t.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
