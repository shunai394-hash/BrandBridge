"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { NavResourcesMenu } from "@/components/layout/NavResourcesMenu";
import { signOutAction } from "@/lib/actions";
import type { UserRole } from "@/lib/types";

export type HeaderNavUser = {
  role: UserRole;
};

type HeaderNavProps = {
  user: HeaderNavUser | null;
  negoPath: string | null;
  negoTotal: number;
  negoUnread: number;
  /** SSR hint from middleware x-pathname (first paint only). */
  serverIsEnglish?: boolean;
};

function isEnglishPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === "/en" || pathname.startsWith("/en/");
}

/**
 * Live route locale. Prefer client pathname; fall back to window, then SSR hint.
 * No useState — soft-nav must not keep a stale Japanese label set.
 */
function useIsEnglishRoute(serverIsEnglish: boolean): boolean {
  const pathname = usePathname() ?? "";
  if (isEnglishPath(pathname)) return true;
  if (typeof window !== "undefined" && isEnglishPath(window.location.pathname)) {
    return true;
  }
  // First SSR paint for /en/* when usePathname is not yet available
  if (!pathname) return serverIsEnglish;
  return false;
}

function usesHardNav(href: string): boolean {
  return (
    href === "/cases" ||
    href === "/en/cases" ||
    href === "/maker/cases/new" ||
    href === "/en/maker/setup" ||
    href === "/en/products"
  );
}

function guestLinks(en: boolean) {
  if (en) {
    return [
      { href: "/en/cases", label: "Product Listings" },
      { href: "/en/register/maker", label: "List Your Brand" },
      { href: "/en/register/partner", label: "Partner Registration" },
      { href: "/en/login?next=/en/maker/setup", label: "Login" },
    ];
  }
  return [
    { href: "/cases", label: "商品一覧" },
    { href: "/register/maker", label: "商品提供企業として登録" },
    { href: "/register/partner", label: "パートナー登録" },
    { href: "/login", label: "ログイン" },
  ];
}

function userLinks(
  user: HeaderNavUser,
  en: boolean,
  negoPath: string,
  negoTotal: number,
  negoUnread: number,
) {
  if (user.role === "admin") {
    if (en) {
      return [
        { href: "/admin", label: "Admin" },
        { href: "/en/cases", label: "Product Listings" },
        { href: "/en/deals", label: "Deals" },
        { href: "/en/favorites", label: "Favorites" },
        { href: "/en/profile", label: "My Profile" },
      ];
    }
    return [
      { href: "/admin", label: "管理画面" },
      { href: "/cases", label: "商品一覧" },
      { href: "/deals", label: "成約一覧" },
      { href: "/favorites", label: "お気に入り" },
      { href: "/profile/edit", label: "マイプロフィール" },
    ];
  }

  const negoLabel = en
    ? negoUnread > 0
      ? `Negotiations (${negoTotal}/${negoUnread})`
      : negoTotal > 0
        ? `Negotiations (${negoTotal})`
        : "Negotiations"
    : negoUnread > 0
      ? `交渉 (${negoTotal}/${negoUnread})`
      : negoTotal > 0
        ? `交渉 (${negoTotal})`
        : "交渉";

  const links = en
    ? [
        { href: "/en/cases", label: "Product Listings" },
        { href: "/en/negotiations", label: negoLabel },
        { href: "/en/deals", label: "Deals" },
        { href: "/en/favorites", label: "Favorites" },
        { href: "/en/profile", label: "My Profile" },
      ]
    : [
        { href: "/cases", label: "商品一覧" },
        { href: negoPath, label: negoLabel },
        { href: "/deals", label: "成約一覧" },
        { href: "/favorites", label: "お気に入り" },
        { href: "/profile/edit", label: "マイプロフィール" },
      ];

  if (user.role === "maker") {
    if (en) {
      links.push({ href: "/en/products", label: "My Products" });
      links.push({ href: "/en/maker/setup", label: "Register Product" });
    } else {
      links.push({ href: "/maker/cases", label: "マイ商品" });
      links.push({ href: "/maker/cases/new", label: "商品を登録" });
    }
  }
  return links;
}

export function HeaderNav({
  user,
  negoPath,
  negoTotal,
  negoUnread,
  serverIsEnglish = false,
}: HeaderNavProps) {
  const en = useIsEnglishRoute(serverIsEnglish);
  const links = user
    ? userLinks(user, en, negoPath ?? "/negotiations", negoTotal, negoUnread)
    : guestLinks(en);
  const logoutLabel = en ? "Logout" : "ログアウト";
  const loginLabel = en ? "Login" : "ログイン";
  const brandHref = en ? "/en" : "/";

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 bg-navy-deep/90 text-white backdrop-blur-md"
      data-component="HeaderNav"
      data-nav-locale={en ? "en" : "ja"}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
        <Link
          href={brandHref}
          className="font-[family-name:var(--font-shippori)] text-xl tracking-wide transition hover:text-teal"
        >
          BrandBridge
        </Link>
        <nav
          key={en ? "en-nav" : "ja-nav"}
          className="hidden items-center gap-6 text-sm md:flex"
          aria-label={en ? "Main" : "メイン"}
        >
          <NavResourcesMenu locale={en ? "en" : "ja"} />
          {links.map((item) =>
            usesHardNav(item.href) ? (
              <a
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="text-white/85 transition hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                prefetch={false}
                className="text-white/85 transition hover:text-white"
              >
                {item.label}
              </Link>
            ),
          )}
          {user ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-white/85 transition hover:text-white"
              >
                {logoutLabel}
              </button>
            </form>
          ) : null}
          <LanguageSwitch />
        </nav>
        <div className="flex items-center gap-3 md:hidden">
          <Link
            href={en ? "/en/how-to-sell-in-japan" : "/how-to-sell-in-japan"}
            prefetch={false}
            className="text-xs text-white/85 transition hover:text-white"
          >
            {en ? "Resources" : "ガイド"}
          </Link>
          <LanguageSwitch />
          {user ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-md bg-teal px-3.5 py-2 text-xs font-medium text-white transition hover:bg-teal-dark"
              >
                {logoutLabel}
              </button>
            </form>
          ) : (
            <Link
              href={en ? "/en/login?next=/en/maker/setup" : "/login"}
              className="rounded-md bg-teal px-3.5 py-2 text-xs font-medium text-white transition hover:bg-teal-dark"
            >
              {loginLabel}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
