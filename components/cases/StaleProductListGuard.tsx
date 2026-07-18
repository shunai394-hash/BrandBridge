"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CASE_LIST_VERSION } from "@/components/cases/CaseList";

/**
 * Only hard-reload when a legacy CaseList module is painted.
 * Do not reload for slow API / missing root on first paint (that aborted counts fetch).
 */
export function StaleProductListGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (pathname !== "/cases" && pathname !== "/cases/") return;

    const text = document.body?.innerText ?? "";
    const ths = [
      ...document.querySelectorAll(
        '[data-testid="product-list-table"] thead th',
      ),
    ].map((th) => th.textContent?.trim() ?? "");

    const hasLegacy =
      text.includes("案件番号") ||
      text.includes("件の案件") ||
      text.includes("20件の案件") ||
      ths.includes("商品画像") ||
      ths[0] === "案件番号" ||
      (text.includes("交渉する") && /BB-\d{6}/.test(text));

    if (!hasLegacy) return;

    const key = "bb-cases-legacy-reload";
    if (sessionStorage.getItem(key) === CASE_LIST_VERSION) return;
    sessionStorage.setItem(key, CASE_LIST_VERSION);
    window.location.replace(
      `${window.location.origin}/cases?_v=${CASE_LIST_VERSION}`,
    );
  }, [pathname]);

  return null;
}
