import { formatMoqEn } from "@/lib/en-listing-display";
import type { SalesFormat, TargetCountry } from "@/lib/types";

/**
 * Display-only helpers for English Japan-expansion opportunity framing.
 * Does not change stored case data.
 */

type OriginBadge = { flag: string; label: string };

const ORIGIN_RULES: { pattern: RegExp; badge: OriginBadge }[] = [
  { pattern: /\b(USA|U\.S\.A\.|United States|\bUS\b|America)\b/i, badge: { flag: "🇺🇸", label: "US Brand" } },
  { pattern: /\b(United Kingdom|\bUK\b|England|Britain)\b/i, badge: { flag: "🇬🇧", label: "UK Brand" } },
  { pattern: /\b(Germany|Deutschland)\b/i, badge: { flag: "🇩🇪", label: "German Brand" } },
  { pattern: /\bFrance\b/i, badge: { flag: "🇫🇷", label: "French Brand" } },
  { pattern: /\bItaly\b/i, badge: { flag: "🇮🇹", label: "Italian Brand" } },
  { pattern: /\bSpain\b/i, badge: { flag: "🇪🇸", label: "Spanish Brand" } },
  { pattern: /\bAustralia\b/i, badge: { flag: "🇦🇺", label: "Australian Brand" } },
  { pattern: /\bCanada\b/i, badge: { flag: "🇨🇦", label: "Canadian Brand" } },
  { pattern: /\bKorea|South Korea|대한민국\b/i, badge: { flag: "🇰🇷", label: "Korean Brand" } },
  { pattern: /\bChina|中国\b/i, badge: { flag: "🇨🇳", label: "Chinese Brand" } },
  { pattern: /\bTaiwan|台灣|台湾\b/i, badge: { flag: "🇹🇼", label: "Taiwan Brand" } },
  { pattern: /\bSingapore\b/i, badge: { flag: "🇸🇬", label: "Singapore Brand" } },
  { pattern: /\bThailand\b/i, badge: { flag: "🇹🇭", label: "Thai Brand" } },
  { pattern: /\bVietnam\b/i, badge: { flag: "🇻🇳", label: "Vietnamese Brand" } },
  { pattern: /\bIndia\b/i, badge: { flag: "🇮🇳", label: "Indian Brand" } },
  { pattern: /\bEurope|EU\b/i, badge: { flag: "🇪🇺", label: "European Brand" } },
];

const TARGET_FALLBACK: Record<TargetCountry, OriginBadge> = {
  US: { flag: "🇺🇸", label: "US Brand" },
  CN: { flag: "🇨🇳", label: "Chinese Brand" },
  ASEAN: { flag: "🌏", label: "ASEAN Brand" },
  EU: { flag: "🇪🇺", label: "European Brand" },
  GLOBAL: { flag: "🌍", label: "Global Brand" },
  OTHER: { flag: "🌍", label: "Overseas Brand" },
  JP: { flag: "🌍", label: "Overseas Brand" },
};

export function brandOriginBadge(input: {
  shipFrom?: string | null;
  targetCountry?: TargetCountry | null;
}): OriginBadge {
  const ship = input.shipFrom?.trim() || "";
  for (const rule of ORIGIN_RULES) {
    if (ship && rule.pattern.test(ship)) return rule.badge;
  }
  if (input.targetCountry && input.targetCountry !== "JP") {
    return TARGET_FALLBACK[input.targetCountry] ?? TARGET_FALLBACK.OTHER;
  }
  if (ship) {
    return { flag: "🌍", label: `${ship} Brand` };
  }
  return { flag: "🌍", label: "Overseas Brand" };
}

export function brandDisplayName(input: {
  brandName?: string | null;
  productName?: string | null;
  makerName?: string | null;
}): string {
  return (
    input.brandName?.trim() ||
    input.productName?.trim() ||
    input.makerName?.trim() ||
    "Brand opportunity"
  );
}

/** What the brand is seeking in Japan. */
export function lookingForLabel(salesFormat: SalesFormat): string {
  switch (salesFormat) {
    case "wholesale":
      return "Japan Distributor";
    case "agency":
      return "Japan Sales Agency";
    case "consignment":
      return "Japan Consignment Partner";
    case "ec":
      return "Japan E-commerce Partner";
    case "oem":
      return "Japan OEM / Manufacturing Partner";
    default:
      return "Japan Sales Partner";
  }
}

/** Partnership framing (not purchase terms). */
export function partnershipLabel(input: {
  salesFormat: SalesFormat;
  isExclusive: boolean;
}): string {
  const role =
    input.salesFormat === "agency"
      ? "Agency"
      : input.salesFormat === "ec"
        ? "E-commerce"
        : input.salesFormat === "oem"
          ? "OEM"
          : input.salesFormat === "consignment"
            ? "Consignment"
            : "Distributor";
  return input.isExclusive ? `Exclusive / ${role}` : `Non-exclusive / ${role}`;
}

/** Target channels for Japan go-to-market. */
export function targetChannelsLabel(input: {
  partnerChannels?: string | null;
  salesFormat: SalesFormat;
}): string {
  const channels = input.partnerChannels?.trim();
  if (channels) {
    return channels
      .replace(/専門店/g, "Specialty retail")
      .replace(/百貨店/g, "Department stores")
      .replace(/量販/g, "Mass retail")
      .replace(/卸/g, "Wholesale")
      .replace(/代理店/g, "Agency");
  }
  switch (input.salesFormat) {
    case "ec":
      return "Amazon / Shopify / E-commerce";
    case "wholesale":
      return "Retail / Wholesale / Specialty";
    case "agency":
      return "Retail / Key accounts";
    default:
      return "Retail / E-commerce / Wholesale";
  }
}

export function opportunityMoqLabel(minOrder: string | null | undefined): string {
  return formatMoqEn(minOrder);
}

