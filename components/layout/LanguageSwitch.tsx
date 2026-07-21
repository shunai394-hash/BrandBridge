"use client";

import { usePathname } from "next/navigation";

/**
 * Hard navigation between JA/EN so the shared root Header remounts
 * with the correct label set (soft-nav was leaving Japanese labels on /en).
 */
export function LanguageSwitch() {
  const pathname = usePathname() ?? "/";
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  return (
    <div
      className="flex items-center gap-1.5 text-xs tracking-wide"
      aria-label="Language"
    >
      {isEnglish ? (
        <a href="/" className="text-white/70 transition hover:text-white">
          Japanese
        </a>
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
        <a href="/en" className="text-white/70 transition hover:text-white">
          English
        </a>
      )}
    </div>
  );
}
