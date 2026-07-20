/**
 * Display-only role / audience labels.
 * Do NOT change profiles.role values ("maker" | "partner" | "admin").
 *
 * 供給側表記は「商品提供企業」に統一。販売側は「販売パートナー」。
 */
export const ROLE_DISPLAY = {
  /** Formal BtoB (admin, terms, deals, product fields) */
  maker: "商品提供企業",
  makerAccount: "商品提供企業アカウント",
  makerInfo: "商品提供企業情報",
  makerName: "商品提供企業名",
  makerOffer: "商品提供企業の提供条件",

  /** Marketing / LP / ads / top / register CTAs */
  makerMarketing: "商品提供企業",
  makerRegister: "商品提供企業として登録",
  makerAudience: "商品提供企業向け",
  makerForPage: "商品提供企業の方へ",
  makerPerson: "商品提供企業の方",

  partner: "販売パートナー",
  partnerRegister: "販売パートナーとして登録",
} as const;

export function roleDisplayLabel(
  role: "maker" | "partner" | "admin" | string,
): string {
  if (role === "maker") return ROLE_DISPLAY.maker;
  if (role === "partner") return ROLE_DISPLAY.partner;
  if (role === "admin") return "管理者";
  return role;
}
