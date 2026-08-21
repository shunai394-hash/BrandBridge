/**
 * Google Product Category (GPC) mapping for Product JSON-LD only.
 * On-page BrandBridge categories are unchanged.
 *
 * Values follow Google's taxonomy-with-ids.en-US.txt.
 * @see https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
 * @see https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
 */

export const GOOGLE_PRODUCT_TAXONOMY_URL =
  "https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt";

type GoogleProductCategory = {
  id: string;
  path: string;
};

const GPC_BY_CASE_CATEGORY: Record<string, GoogleProductCategory> = {
  "美容・コスメ": {
    id: "473",
    path: "Health & Beauty > Personal Care > Cosmetics",
  },
  "Beauty & Cosmetics": {
    id: "473",
    path: "Health & Beauty > Personal Care > Cosmetics",
  },
  "食品・飲料": {
    id: "412",
    path: "Food, Beverages & Tobacco",
  },
  "Food & Beverage": {
    id: "412",
    path: "Food, Beverages & Tobacco",
  },
  "健康・サプリ": {
    id: "525",
    path: "Health & Beauty > Health Care > Fitness & Nutrition > Vitamins & Supplements",
  },
  "Health & Supplements": {
    id: "525",
    path: "Health & Beauty > Health Care > Fitness & Nutrition > Vitamins & Supplements",
  },
  ファッション: {
    id: "166",
    path: "Apparel & Accessories",
  },
  Fashion: {
    id: "166",
    path: "Apparel & Accessories",
  },
  "家電・ガジェット": {
    id: "222",
    path: "Electronics",
  },
  "Electronics & Gadgets": {
    id: "222",
    path: "Electronics",
  },
  "雑貨・ライフスタイル": {
    id: "536",
    path: "Home & Garden",
  },
  "Lifestyle & Goods": {
    id: "536",
    path: "Home & Garden",
  },
  "ホーム・インテリア": {
    id: "696",
    path: "Home & Garden > Decor",
  },
  "Home & Interior": {
    id: "696",
    path: "Home & Garden > Decor",
  },
  バッグ: {
    id: "3032",
    path: "Apparel & Accessories > Handbags, Wallets & Cases > Handbags",
  },
  Bags: {
    id: "3032",
    path: "Apparel & Accessories > Handbags, Wallets & Cases > Handbags",
  },
  キッチン: {
    id: "638",
    path: "Home & Garden > Kitchen & Dining",
  },
  Kitchen: {
    id: "638",
    path: "Home & Garden > Kitchen & Dining",
  },
  スポーツ: {
    id: "988",
    path: "Sporting Goods",
  },
  Sports: {
    id: "988",
    path: "Sporting Goods",
  },
  "ホーム・収納": {
    id: "636",
    path: "Home & Garden > Household Supplies > Storage & Organization",
  },
  "Home Storage": {
    id: "636",
    path: "Home & Garden > Household Supplies > Storage & Organization",
  },
  "製造・産業": {
    id: "111",
    path: "Business & Industrial",
  },
  "Manufacturing & Industrial": {
    id: "111",
    path: "Business & Industrial",
  },
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
