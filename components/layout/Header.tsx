import Link from "next/link";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { signOutAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { negotiationsListPath } from "@/lib/negotiation-paths";
import { countNegotiationsForUser } from "@/lib/negotiations";
import type { SessionUser } from "@/lib/types";

function guestLinks() {
  return [
    { href: "/cases", label: "商品一覧" },
    { href: "/register/maker", label: "商品提供企業として登録" },
    { href: "/register/partner", label: "パートナー登録" },
    { href: "/login", label: "ログイン" },
  ];
}

async function userLinks(user: SessionUser) {
  if (user.role === "admin") {
    return [
      { href: "/admin", label: "管理画面" },
      { href: "/cases", label: "商品一覧" },
      { href: "/deals", label: "成約一覧" },
      { href: "/favorites", label: "お気に入り" },
      { href: "/profile/edit", label: "マイプロフィール" },
    ];
  }

  const negoPath = negotiationsListPath(user.role);
  const { total, unread } = await countNegotiationsForUser(user);
  const negoLabel =
    unread > 0
      ? `交渉 (${total}/${unread})`
      : total > 0
        ? `交渉 (${total})`
        : "交渉";

  const links = [
    { href: "/cases", label: "商品一覧" },
    { href: negoPath, label: negoLabel },
    { href: "/deals", label: "成約一覧" },
    { href: "/favorites", label: "お気に入り" },
    { href: "/profile/edit", label: "マイプロフィール" },
  ];
  if (user.role === "maker") {
    links.push({ href: "/maker/cases", label: "マイ商品" });
    links.push({ href: "/maker/cases/new", label: "商品を登録" });
  }
  return links;
}

export async function Header() {
  const user = await getSessionUser();
  const links = user ? await userLinks(user) : guestLinks();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-deep/90 text-white backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
        <Link
          href="/"
          className="font-[family-name:var(--font-shippori)] text-xl tracking-wide transition hover:text-teal"
        >
          BrandBridge
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((item) =>
            item.href === "/cases" || item.href === "/maker/cases/new" ? (
              // Full document navigation — Soft Nav was leaving stale maker form / list UI.
              <a
                key={item.href}
                href={item.href}
                className="text-white/85 transition hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
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
                ログアウト
              </button>
            </form>
          ) : null}
          <LanguageSwitch />
        </nav>
        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitch />
          {user ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-md bg-teal px-3.5 py-2 text-xs font-medium text-white transition hover:bg-teal-dark"
              >
                ログアウト
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-teal px-3.5 py-2 text-xs font-medium text-white transition hover:bg-teal-dark"
            >
              ログイン
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
