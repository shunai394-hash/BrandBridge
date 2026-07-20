/**
 * Display-only role / audience labels.
 * Do NOT change profiles.role values ("maker" | "partner" | "admin").
 *
 * - Marketing / LP / ads / top / register CTAs → 事業者系
 * - Admin / terms / pricing / in-app formal BtoB UI → 商品提供企業
 */
export const ROLE_DISPLAY = {
  /** Formal BtoB (admin, terms, deals, product fields) */
  maker: "商品提供企業",
  makerAccount: "商品提供企業アカウント",
  makerInfo: "商品提供企業情報",
  makerName: "商品提供企業名",
  makerOffer: "商品提供企業の提供条件",

  /** Marketing / LP / ads / top page */
  makerMarketing: "商品を広げたい事業者",
  makerRegister: "事業者登録",
  makerAudience: "商品提供事業者向け",
  makerForPage: "商品を広げたい事業者の方へ",
  makerPerson: "商品を広げたい事業者の方",

  partner: "販売パートナー",
} as const;

export function roleDisplayLabel(
  role: "maker" | "partner" | "admin" | string,
): string {
  if (role === "maker") return ROLE_DISPLAY.maker;
  if (role === "partner") return ROLE_DISPLAY.partner;
  if (role === "admin") return "管理者";
  return role;
}
