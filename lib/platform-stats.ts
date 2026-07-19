/**
 * BrandBridge 全体実績（表示用）。
 * 現状は定数。後で DB 集計に差し替える場合は getPlatformStats() のみ更新する。
 * 商品ごとの応募件数とは別系統（水増し禁止）。
 */
export type PlatformStats = {
  listedProducts: number;
  activeNegotiations: number;
  closedDeals: number;
  registeredCompanies: number;
};

/** 手動運用の実績値。DB 接続前の単一管理ポイント */
export const PLATFORM_STATS: PlatformStats = {
  listedProducts: 20,
  activeNegotiations: 18,
  closedDeals: 2,
  registeredCompanies: 45,
};

export function getPlatformStats(): PlatformStats {
  return PLATFORM_STATS;
}
