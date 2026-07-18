"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const FORM_VERSION = "product-v6";

/**
 * Soft Navigation で旧フォームDOMが残っていたら同一URLへフルリロード。
 * クエリは付けない（通常URLのみ）。
 */
export function StaleMakerCreateFormGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (pathname !== "/maker/cases/new" && pathname !== "/maker/cases/new/") {
      return;
    }

    const form = document.querySelector(
      `[data-component="CaseCreateForm"][data-form-version="${FORM_VERSION}"]`,
    );
    const h1 = document.querySelector("h1")?.textContent?.trim() ?? "";
    const text = document.body?.innerText ?? "";
    const ok =
      Boolean(form) &&
      h1 === "商品を登録" &&
      text.includes("商品名") &&
      text.includes("商品コード（SKU）") &&
      text.includes("商品画像") &&
      !text.includes("案件を登録") &&
      !text.includes("案件タイトル") &&
      !text.includes("商品の特徴・差別化ポイント");

    if (ok) return;

    const key = `bb-pcf-${FORM_VERSION}`;
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");

    window.location.replace("/maker/cases/new");
  }, [pathname]);

  return null;
}
