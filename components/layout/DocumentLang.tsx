"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function DocumentLang() {
  const pathname = usePathname();

  useEffect(() => {
    const english = pathname === "/en" || pathname.startsWith("/en/");
    document.documentElement.lang = english ? "en" : "ja";
  }, [pathname]);

  return null;
}
