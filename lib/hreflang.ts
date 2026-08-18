import type { Metadata } from "next";

/**
 * hreflang / canonical helpers.
 * Only pass paths that already exist. Do not invent language counterparts.
 */
export function pairedLanguageAlternates(
  jaPath: string,
  enPath: string,
  current: "ja" | "en",
): Pick<Metadata, "alternates"> {
  return {
    alternates: {
      canonical: current === "ja" ? jaPath : enPath,
      languages: {
        ja: jaPath,
        en: enPath,
        "x-default": jaPath,
      },
    },
  };
}

export function selfLanguageAlternates(
  path: string,
  lang: "ja" | "en",
): Pick<Metadata, "alternates"> {
  return {
    alternates: {
      canonical: path,
      languages: {
        [lang]: path,
      },
    },
  };
}
