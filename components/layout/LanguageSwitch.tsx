"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LanguageSwitch() {
  const pathname = usePathname() ?? "/";
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  return (
    <div
      className="flex items-center gap-1.5 text-xs tracking-wide"
      aria-label="Language"
    >
      {isEnglish ? (
        <Link href="/" className="text-white/70 transition hover:text-white">
          日本語
        </Link>
      ) : (
        <span className="text-white" aria-current="page">
          日本語
        </span>
      )}
      <span className="text-white/35" aria-hidden>
        |
      </span>
      {isEnglish ? (
        <span className="text-white" aria-current="page">
          English
        </span>
      ) : (
        <Link href="/en" className="text-white/70 transition hover:text-white">
          English
        </Link>
      )}
    </div>
  );
}
