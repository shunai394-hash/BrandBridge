"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CASE_LIST_VERSION } from "@/components/cases/CaseList";

/**
 * Root layout: catches Soft Nav of logged-in stale CaseList
 * (案件番号 / BB- / 交渉する) even when page.tsx was already updated.
 */
export function CasesRouteHardReload() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/cases" && pathname !== "/cases/") return;

    const text = document.body?.innerText ?? "";
    const firstTh =
      document
        .querySelector('[data-testid="product-list-table"] thead th')
        ?.textContent?.trim() ?? "";
    const root = document.querySelector(
      `[data-component="CaseList"][data-product-list-version="${CASE_LIST_VERSION}"]`,
    );

    const hasLegacy =
      text.includes("案件番号") ||
      text.includes("件の案件") ||
      text.includes("20件の案件") ||
      firstTh === "案件番号" ||
      (text.includes("交渉する") && /BB-\d{6}/.test(text));

    const ok =
      Boolean(root) &&
      firstTh === "商品番号（SKU）" &&
      text.includes("件の商品") &&
      text.includes("交渉開始") &&
      !hasLegacy;

    if (ok) {
      sessionStorage.removeItem("bb-cases-legacy-reload");
      return;
    }

    if (!hasLegacy && ok) return;

    if (hasLegacy) {
      sessionStorage.setItem("bb-cases-legacy-reload", "pending");
      window.location.replace(`${window.location.origin}/cases`);
    }
  }, [pathname]);

  return null;
}
