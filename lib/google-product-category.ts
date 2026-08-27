/**
 * Google Product Category (GPC) mapping for Product JSON-LD only.
 * On-page BrandBridge categories are unchanged.
 *
 * Japanese keys are typed against CaseCategory so they must match DB/UI labels.
 * Values follow Google's taxonomy-with-ids.en-US.txt.
 * @see https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
 * @see https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
 */

import type { CaseCategory } from "@/lib/types";

export const GOOGLE_PRODUCT_TAXONOMY_URL =
  "https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt";

type GoogleProductCategory = {
  id: string;
  path: string;
};

const COSMETICS: GoogleProductCategory = {
  id: "473",
  path: "Health & Beauty > Personal Care > Cosmetics",
};
const FOOD: GoogleProductCategory = {
  id: "412",
  path: "Food, Beverages & Tobacco",
};
const SUPPLEMENTS: GoogleProductCategory = {
  id: "525",
  path: "Health & Beauty > Health Care > Fitness & Nutrition > Vitamins & Supplements",
};
const APPAREL: GoogleProductCategory = {
  id: "166",
  path: "Apparel & Accessories",
};
const ELECTRONICS: GoogleProductCategory = {
  id: "222",
  path: "Electronics",
};
const HOME_GARDEN: GoogleProductCategory = {
  id: "536",
  path: "Home & Garden",
};
const DECOR: GoogleProductCategory = {
  id: "696",
  path: "Home & Garden > Decor",
};
const HANDBAGS: GoogleProductCategory = {
  id: "3032",
  path: "Apparel & Accessories > Handbags, Wallets & Cases > Handbags",
};
const KITCHEN: GoogleProductCategory = {
  id: "638",
  path: "Home & Garden > Kitchen & Dining",
};
const SPORTING_GOODS: GoogleProductCategory = {
  id: "988",
  path: "Sporting Goods",
};
const STORAGE: GoogleProductCategory = {
  id: "636",
  path: "Home & Garden > Household Supplies > Storage & Organization",
};
const BUSINESS: GoogleProductCategory = {
  id: "111",
  path: "Business & Industrial",
};

/** Canonical Japanese labels from `caseCategories` / cases.category. */
const GPC_BY_JA_CATEGORY: Record<
  Exclude<CaseCategory, "その他">,
  GoogleProductCategory
> = {
  "美容・コスメ": COSMETICS,
  "食品・飲料": FOOD,
  "健康・サプリ": SUPPLEMENTS,
  "ファッション": APPAREL,
  "家電・ガジェット": ELECTRONICS,
  "雑貨・ライフスタイル": HOME_GARDEN,
  "ホーム・インテリア": DECOR,
  "バッグ": HANDBAGS,
  "キッチン": KITCHEN,
  "スポーツ": SPORTING_GOODS,
  "ホーム・収納": STORAGE,
  "製造・産業": BUSINESS,
};

const GPC_BY_CASE_CATEGORY: Record<string, GoogleProductCategory> = {
  ...GPC_BY_JA_CATEGORY,
  "Beauty & Cosmetics": COSMETICS,
  "Food & Beverage": FOOD,
  "Health & Supplements": SUPPLEMENTS,
  Fashion: APPAREL,
  "Electronics & Gadgets": ELECTRONICS,
  "電子・ガジェット": ELECTRONICS,
  "Lifestyle & Goods": HOME_GARDEN,
  "Home & Interior": DECOR,
  Bags: HANDBAGS,
  Kitchen: KITCHEN,
  Sports: SPORTING_GOODS,
  "Home Storage": STORAGE,
  "Manufacturing & Industrial": BUSINESS,
};

const SKIP_CATEGORIES = new Set([
  "",
  "すべて",
  "その他",
  "Other",
  "—",
  "-",
]);

export function resolveGoogleProductCategory(
  caseCategory: string | null | undefined,
): GoogleProductCategory | null {
  const c = caseCategory?.trim() ?? "";
  if (SKIP_CATEGORIES.has(c)) return null;
  return GPC_BY_CASE_CATEGORY[c] ?? null;
}

/**
 * Merchant Listing `category`: CategoryCode with a valid GPC id/path.
 * Unmapped labels (e.g. その他) are omitted rather than sent as invalid text.
 */
export function googleProductCategoryJsonLd(
  caseCategory: string | null | undefined,
): Record<string, unknown>[] | undefined {
  const gpc = resolveGoogleProductCategory(caseCategory);
  if (!gpc) return undefined;
  return [
    {
      "@type": "CategoryCode",
      inCodeSet: GOOGLE_PRODUCT_TAXONOMY_URL,
      codeValue: gpc.id,
      name: gpc.path,
    },
  ];
}
