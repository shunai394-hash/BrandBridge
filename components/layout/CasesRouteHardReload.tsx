"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CASE_LIST_VERSION } from "@/components/cases/CaseList";

/**
 * Root layout: catches Soft Nav of logged-in stale CaseList
 * (案件番号 / BB- / 交渉する / 商品画像列).
 */
export function CasesRouteHardReload() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/cases" && pathname !== "/cases/") return;

    const text = document.body?.innerText ?? "";
    const ths = [
      ...document.querySelectorAll(
        '[data-testid="product-list-table"] thead th',
      ),
    ].map((th) => th.textContent?.trim() ?? "");
    const root = document.querySelector(
      `[data-component="CaseList"][data-product-list-version="${CASE_LIST_VERSION}"]`,
    );

    const hasLegacy =
      text.includes("案件番号") ||
      text.includes("件の案件") ||
      text.includes("20件の案件") ||
      ths.includes("商品画像") ||
      ths[0] === "案件番号" ||
      (text.includes("交渉する") && /BB-\d{6}/.test(text)) ||
      (Boolean(root) &&
        root?.getAttribute("data-product-list-version") !== CASE_LIST_VERSION);

    const ok =
      Boolean(root) &&
      ths.includes("商品番号（SKU）") &&
      !ths.includes("商品画像") &&
      text.includes("件の商品") &&
      text.includes("交渉開始") &&
      !hasLegacy;

    if (ok) {
      sessionStorage.removeItem("bb-cases-legacy-reload");
      return;
    }

    if (hasLegacy || !root) {
      sessionStorage.setItem("bb-cases-legacy-reload", "pending");
      window.location.replace(`${window.location.origin}/cases`);
    }
  }, [pathname]);

  return null;
}
