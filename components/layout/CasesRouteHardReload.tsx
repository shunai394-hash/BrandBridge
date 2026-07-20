"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CASE_LIST_VERSION } from "@/components/cases/CaseList";

/**
 * Root layout: hard-reload when a stale /cases list is painted
 * (旧「案件番号」レイアウト、商品画像列あり、参考卸価格帯・MOQ欠落).
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

    if (ths.length === 0) return;

    const root = document.querySelector(
      `[data-component="CaseList"][data-product-list-version="${CASE_LIST_VERSION}"]`,
    );

    const hasPriceBand = ths.some((t) => t.includes("参考卸価格帯"));
    const hasMoq = ths.some((t) => t.includes("MOQ"));
    const hasImage = ths.some((t) => t.includes("商品画像"));
    const hasApplications = ths.some((t) => t.includes("応募件数"));
    const hasSku = ths.includes("商品番号（SKU）");

    const isCurrent =
      Boolean(root) &&
      hasSku &&
      !hasImage &&
      hasPriceBand &&
      hasMoq &&
      hasApplications &&
      text.includes("件の商品");

    const hasLegacy =
      text.includes("案件番号") ||
      text.includes("件の案件") ||
      text.includes("20件の案件") ||
      ths[0] === "案件番号" ||
      hasImage ||
      (text.includes("交渉する") && /BB-\d{6}/.test(text)) ||
      !isCurrent;

    if (!hasLegacy) {
      sessionStorage.removeItem("bb-cases-legacy-reload");
      return;
    }

    const key = "bb-cases-legacy-reload";
    if (sessionStorage.getItem(key) === CASE_LIST_VERSION) return;
    sessionStorage.setItem(key, CASE_LIST_VERSION);
    window.location.replace(
      `${window.location.origin}/cases?_v=${CASE_LIST_VERSION}`,
    );
  }, [pathname]);

  return null;
}
