/** English UI copy for account pages under /en/* (JP routes unchanged). */

import type { SalesFormat, TargetCountry } from "@/lib/types";

const enSalesFormatLabels: Record<SalesFormat, string> = {
  wholesale: "Wholesale",
  consignment: "Consignment",
  agency: "Agency",
  oem: "OEM / ODM",
  ec: "E-commerce",
  other: "Other",
};

const enTargetCountryLabels: Record<TargetCountry, string> = {
  JP: "Japan",
  US: "United States",
  CN: "China",
  ASEAN: "ASEAN",
  EU: "Europe",
  GLOBAL: "Worldwide",
  OTHER: "Other",
};

export function enSalesFormatLabel(value: SalesFormat): string {
  return enSalesFormatLabels[value] ?? value;
}

export function enTargetCountryLabel(value: TargetCountry): string {
  return enTargetCountryLabels[value] ?? value;
}

/** Empty / JP sentinel → English for EN surfaces only. */
export function enDisplayPriceBand(value: string | null | undefined): string {
  const t = value?.trim();
  if (!t || t === "見積条件あり") return "Quote required";
  return t
    .replace(/以上/g, "+")
    .replace(/〜/g, "–")
    .replace(/～/g, "–");
}

export function enDisplayMoq(value: string | null | undefined): string {
  const t = value?.trim();
  if (!t || t === "応相談") return "Negotiable";
  return t.replace(/以上/g, "+").replace(/〜/g, "–").replace(/～/g, "–");
}

export const enDealsCopy = {
  title: "Deals",
  subtitle:
    "View completed deals including deal date, value, service fee, product, supplier and sales partner.",
  empty: "No completed deals yet.",
  columns: {
    date: "Deal date",
    product: "Product",
    supplier: "Supplier",
    partner: "Sales partner",
    amount: "Deal value",
    fee: "Service fee",
  },
  negotiationDetail: "Negotiation details",
  rate: (n: number) => `Rate ${n}%`,
  defaultRate: (n: number) => `Default fee rate: ${n}%`,
  adminLink: "Create deals from negotiations",
} as const;

export const enFavoritesCopy = {
  title: "Favorites",
  subtitle: "Saved product listings you can reopen anytime.",
  empty:
    "No favorites yet. Add products from a product detail page.",
  viewDetails: "View details",
  listed: "Listed",
} as const;

export const enProfileCopy = {
  title: "My Profile",
  subtitle:
    "Keep your company and contact details up to date so Japanese partners can trust your profile.",
  emailLocked: "Email (cannot be changed)",
  companyName: "Company name",
  contactName: "Contact person",
  description: "Company introduction",
  websiteUrl: "Website URL",
  headquarters: "Headquarters / Address",
  foundedYear: "Year founded",
  foundedYearPlaceholder: "e.g. 2015",
  employeeRange: "Company size",
  unset: "Not set",
  corporateNumber: "Corporate number (optional)",
  achievements: "Track record",
  achievementsPlaceholder: "Key clients, launches, or distribution results",
  industry: "Industry",
  productOverview: "Product overview",
  displayName: "Display name",
  entityType: "Individual / Company",
  individual: "Individual",
  corporate: "Company",
  salesGenres: "Sales categories",
  salesGenresPlaceholder: "e.g. Beauty / Food",
  salesChannel: "Sales channels",
  salesChannelPlaceholder: "e.g. Amazon / Retail",
  area: "Coverage area",
  preferredCategories: "Preferred product categories",
  preferredDealTypes: "Preferred deal types",
  preferredDealTypesPlaceholder: "e.g. Wholesale / Agency",
  strength: "Strengths",
  save: "Save",
  saving: "Saving...",
  viewPublic: "View public profile",
  publicNote:
    "Your email address is not shown on the public profile.",
} as const;
