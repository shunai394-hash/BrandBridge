"use client";

import {
  exclusiveFilterOptions,
  salesFormatOptions,
  targetCountryOptions,
  type ExclusiveFilter,
} from "@/lib/types";
import {
  moqFilterPresets,
  priceBandPresets,
  PRICE_BAND_QUOTE_REQUIRED,
} from "@/lib/price-display";

type CaseFilterProps = {
  keyword: string;
  category: string;
  country: string;
  salesFormat: string;
  priceBand: string;
  moq: string;
  exclusive: ExclusiveFilter;
  categories: readonly string[];
  onKeywordChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onSalesFormatChange: (value: string) => void;
  onPriceBandChange: (value: string) => void;
  onMoqChange: (value: string) => void;
  onExclusiveChange: (value: ExclusiveFilter) => void;
};

export function CaseFilter({
  keyword,
  category,
  country,
  salesFormat,
  priceBand,
  moq,
  exclusive,
  categories,
  onKeywordChange,
  onCategoryChange,
  onCountryChange,
  onSalesFormatChange,
  onPriceBandChange,
  onMoqChange,
  onExclusiveChange,
}: CaseFilterProps) {
  const selectClass =
    "rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-navy">キーワード</span>
        <input
          type="search"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="商品名・商品コード（SKU）・商品提供企業名・概要"
          className="rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">カテゴリ</span>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={selectClass}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">原産国</span>
          <select
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className={selectClass}
          >
            <option value="すべて">すべて</option>
            {targetCountryOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">販売形式</span>
          <select
            value={salesFormat}
            onChange={(e) => onSalesFormatChange(e.target.value)}
            className={selectClass}
          >
            <option value="すべて">すべて</option>
            {salesFormatOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">参考卸価格帯</span>
          <select
            value={priceBand}
            onChange={(e) => onPriceBandChange(e.target.value)}
            className={selectClass}
          >
            <option value="すべて">すべて</option>
            {priceBandPresets.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value="__other__">その他</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">MOQ</span>
          <select
            value={moq}
            onChange={(e) => onMoqChange(e.target.value)}
            className={selectClass}
          >
            {moqFilterPresets.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">独占可否</span>
          <select
            value={exclusive}
            onChange={(e) =>
              onExclusiveChange(e.target.value as ExclusiveFilter)
            }
            className={selectClass}
          >
            {exclusiveFilterOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-xs text-muted">
        参考卸価格帯の未設定は「{PRICE_BAND_QUOTE_REQUIRED}」として扱います。
      </p>
    </div>
  );
}
