"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const FORM_VERSION = "en-setup-v1";

/**
 * Soft Navigation can leave the Japanese MakerSetupForm DOM on /en/maker/setup.
 * Force a full reload when English form markers are missing or Japanese labels appear.
 */
export function StaleEnMakerSetupGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (pathname !== "/en/maker/setup" && pathname !== "/en/maker/setup/") {
      return;
    }

    const form = document.querySelector(
      `[data-component="EnMakerSetupForm"][data-form-version="${FORM_VERSION}"]`,
    );
    const text = document.body?.innerText ?? "";
    const ok =
      Boolean(form) &&
      text.includes("Company Name") &&
      text.includes("List your product") &&
      !text.includes("商品提供企業情報") &&
      !text.includes("商品提供企業情報・商品を登録") &&
      !text.includes("会社名");

    if (ok) return;

    const key = `bb-en-setup-${FORM_VERSION}`;
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");

    window.location.replace("/en/maker/setup");
  }, [pathname]);

  return null;
}
