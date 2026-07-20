export type ContactCategory =
  | "general"
  | "maker"
  | "partner"
  | "billing"
  | "bug"
  | "other";

export type ContactInput = {
  name: string;
  email: string;
  companyName?: string;
  category: ContactCategory;
  message: string;
};

export const contactCategoryOptions: {
  value: ContactCategory;
  label: string;
}[] = [
  { value: "general", label: "一般のお問い合わせ" },
  { value: "maker", label: "商品提供企業として登録・商品について" },
  { value: "partner", label: "パートナー登録・交渉について" },
  { value: "billing", label: "手数料・成約について" },
  { value: "bug", label: "不具合の報告" },
  { value: "other", label: "その他" },
];
