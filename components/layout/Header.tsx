import Link from "next/link";
import { signOutAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import type { SessionUser } from "@/lib/types";

function guestLinks() {
  return [
    { href: "/cases", label: "案件一覧" },
    { href: "/register/maker", label: "メーカー登録" },
    { href: "/register/partner", label: "パートナー登録" },
    { href: "/login", label: "ログイン" },
  ];
}

function userLinks(user: SessionUser) {
  if (user.role === "admin") {
    return [
      { href: "/admin", label: "管理画面" },
      { href: "/cases", label: "案件一覧" },
      { href: "/deals", label: "成約一覧" },
      { href: "/favorites", label: "お気に入り" },
      { href: "/profile/edit", label: "マイプロフィール" },
    ];
  }

  const links = [
    { href: "/cases", label: "案件一覧" },
    { href: "/negotiations", label: "交渉管理" },
    { href: "/deals", label: "成約一覧" },
    { href: "/favorites", label: "お気に入り" },
    { href: "/profile/edit", label: "マイプロフィール" },
  ];
  if (user.role === "maker") {
    links.push({ href: "/maker/cases", label: "マイ案件" });
    links.push({ href: "/maker/cases/new", label: "案件を登録" });
  }
  return links;
}

export async function Header() {
  const user = await getSessionUser();

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
          {(user ? userLinks(user) : guestLinks()).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-white/85 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
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
        </nav>
        {user ? (
          <form action={signOutAction} className="md:hidden">
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
            className="rounded-md bg-teal px-3.5 py-2 text-xs font-medium text-white transition hover:bg-teal-dark md:hidden"
          >
            ログイン
          </Link>
        )}
      </div>
    </header>
  );
}
