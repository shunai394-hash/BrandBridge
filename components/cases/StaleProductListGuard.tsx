"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CASE_LIST_VERSION } from "@/components/cases/CaseList";

/**
 * Hard-reload when a stale CaseList is painted
 * (商品画像列あり / 参考卸価格帯・MOQ欠落 / 旧案件レイアウト).
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

    if (ths.length === 0) return;

    const hasPriceBand = ths.some((t) => t.includes("参考卸価格帯"));
    const hasMoq = ths.some((t) => t.includes("MOQ"));
    const hasImage = ths.some((t) => t.includes("商品画像"));
    const hasApplications = ths.some((t) => t.includes("応募件数"));
    const hasSku = ths.includes("商品番号（SKU）");

    const isCurrent =
      hasSku &&
      !hasImage &&
      hasPriceBand &&
      hasMoq &&
      hasApplications;

    const hasLegacy =
      text.includes("案件番号") ||
      text.includes("件の案件") ||
      ths[0] === "案件番号" ||
      hasImage ||
      (text.includes("交渉する") && /BB-\d{6}/.test(text)) ||
      !isCurrent;

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
