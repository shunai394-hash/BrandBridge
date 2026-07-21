"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROLE_DISPLAY } from "@/lib/role-labels";

function isEnglishPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === "/en" || pathname.startsWith("/en/");
}

const ja = {
  blurb:
    "日本進出したい海外ブランドと売れる販売パートナーをつなぐ、交渉可能なBtoB商談プラットフォーム。",
  beta: "ベータ先行登録受付中",
  service: "サービス",
  support: "サポート",
  serviceLinks: [
    { href: "/cases", label: "商品一覧" },
    { href: "/for-makers", label: ROLE_DISPLAY.makerForPage },
    { href: "/for-partners", label: "販売パートナーの方へ" },
    { href: "/pricing", label: "料金プラン" },
    { href: "/register/maker", label: ROLE_DISPLAY.makerRegister },
    { href: "/register/partner", label: "パートナー登録" },
    { href: "/login", label: "ログイン" },
  ],
  supportLinks: [
    { href: "/contact", label: "お問い合わせ" },
    { href: "/how-to-sell-in-japan", label: "日本で販売する方法" },
    { href: "/company", label: "運営会社情報" },
    { href: "/terms", label: "利用規約" },
    { href: "/privacy", label: "プライバシーポリシー" },
  ],
};

const en = {
  blurb:
    "A negotiable B2B platform connecting overseas brands entering Japan with sales partners who can sell.",
  beta: "Early beta registration open",
  service: "Service",
  support: "Support",
  serviceLinks: [
    { href: "/en/cases", label: "Product Listings" },
    { href: "/en/register/maker", label: "Register as Product Supplier" },
    { href: "/en/register/partner", label: "Partner Registration" },
    { href: "/en/login", label: "Login" },
  ],
  supportLinks: [
    { href: "/en/contact", label: "Contact" },
    { href: "/en/how-to-sell-in-japan", label: "How to Sell in Japan" },
    { href: "/company", label: "Company" },
    { href: "/terms", label: "Terms of Use" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
};

export function Footer() {
  const pathname = usePathname() ?? "";
  const isEn = isEnglishPath(pathname);
  const t = isEn ? en : ja;

  return (
    <footer
      className="mt-auto border-t border-border bg-navy-deep text-white/80"
      lang={isEn ? "en" : undefined}
      data-nav-locale={isEn ? "en" : "ja"}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-[family-name:var(--font-shippori)] text-2xl text-white">
            BrandBridge
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/65">
            {t.blurb}
          </p>
          <p className="mt-3 text-xs text-white/45">{t.beta}</p>
        </div>
        <div className="flex flex-wrap gap-10 text-sm">
          <div>
            <p className="mb-3 text-xs tracking-wide text-white/45">
              {t.service}
            </p>
            <ul className="space-y-2">
              {t.serviceLinks.map((item) => (
                <li key={item.href}>
                  {item.href === "/cases" || item.href === "/en/cases" ? (
                    <a href={item.href} className="transition hover:text-white">
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="transition hover:text-white"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs tracking-wide text-white/45">
              {t.support}
            </p>
            <ul className="space-y-2">
              {t.supportLinks.map((item) => (
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
