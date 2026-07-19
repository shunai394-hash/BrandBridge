import Link from "next/link";

const serviceLinks = [
  { href: "/cases", label: "商品一覧" },
  { href: "/for-makers", label: "商品を広げたい事業者の方へ" },
  { href: "/for-partners", label: "販売パートナーの方へ" },
  { href: "/register/maker", label: "商品を広げたい事業者として登録" },
  { href: "/register/partner", label: "パートナー登録" },
  { href: "/login", label: "ログイン" },
];

const supportLinks = [
  { href: "/contact", label: "お問い合わせ" },
  { href: "/terms", label: "利用規約" },
  { href: "/privacy", label: "プライバシーポリシー" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-navy-deep text-white/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-[family-name:var(--font-shippori)] text-2xl text-white">
            BrandBridge
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/65">
            商品を広げたい事業者と販売パートナーを最短でつなぐ、条件が見えるBtoBマッチング。
          </p>
          <p className="mt-3 text-xs text-white/45">ベータ先行登録受付中</p>
        </div>
        <div className="flex flex-wrap gap-10 text-sm">
          <div>
            <p className="mb-3 text-xs tracking-wide text-white/45">サービス</p>
            <ul className="space-y-2">
              {serviceLinks.map((item) => (
                <li key={item.href}>
                  {item.href === "/cases" ? (
                    <a href={item.href} className="transition hover:text-white">
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className="transition hover:text-white">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs tracking-wide text-white/45">サポート</p>
            <ul className="space-y-2">
              {supportLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-white/45">
          © {new Date().getFullYear()} BrandBridge. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
