"use client";

import { useState } from "react";
import { Input, TextArea } from "@/components/ui/Input";
import { CASE_TEXT_LIMITS } from "@/lib/case-validation";
import {
  PRICE_BAND_CUSTOM,
  PRICE_BAND_QUOTE_REQUIRED,
  availabilityOptions,
  priceBandPresets,
  priceBandSelectValue,
  priceConditionOptions,
  type AvailabilityOption,
  type PriceConditionCode,
} from "@/lib/price-display";
import type { CaseCreateInput } from "@/lib/types";

const selectClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

type Props = {
  form: CaseCreateInput;
  update: <K extends keyof CaseCreateInput>(
    key: K,
    value: CaseCreateInput[K],
  ) => void;
};

/**
 * Shared pricing / MOQ / sample fields for maker + admin case forms.
 */
export function CasePricingFields({ form, update }: Props) {
  const selectValue = priceBandSelectValue(form.priceBand);
  const [customMode, setCustomMode] = useState(
    selectValue === PRICE_BAND_CUSTOM,
  );

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-navy">参考卸価格帯</span>
        <select
          className={selectClass}
          value={customMode ? PRICE_BAND_CUSTOM : selectValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === PRICE_BAND_CUSTOM) {
              setCustomMode(true);
              if (
                (priceBandPresets as readonly string[]).includes(
                  form.priceBand.trim(),
                ) ||
                !form.priceBand.trim()
              ) {
                update("priceBand", "");
              }
              return;
            }
            setCustomMode(false);
            update("priceBand", v);
          }}
        >
          {priceBandPresets.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
          <option value={PRICE_BAND_CUSTOM}>その他（自由入力）</option>
        </select>
        <span className="text-xs text-muted">
          一覧に表示する参考帯です。非公開の場合は「{PRICE_BAND_QUOTE_REQUIRED}
          」を選択してください。
        </span>
      </label>

      {customMode ? (
        <Input
          label="参考卸価格帯（自由入力）"
          name="priceBandCustom"
          maxLength={CASE_TEXT_LIMITS.priceBand}
          value={form.priceBand}
          onChange={(e) => update("priceBand", e.target.value)}
          placeholder="例: ¥10,000〜¥15,000"
        />
      ) : null}

      <Input
        label="正確な卸価格"
        name="wholesalePrice"
        maxLength={CASE_TEXT_LIMITS.wholesalePrice}
        value={form.wholesalePrice}
        onChange={(e) => update("wholesalePrice", e.target.value)}
        placeholder="例: ¥4,200（税別）※ログイン後のパートナー向け"
      />

      <TextArea
        label="ロット別価格"
        name="lotPricing"
        rows={3}
        maxLength={CASE_TEXT_LIMITS.lotPricing}
        value={form.lotPricing}
        onChange={(e) => update("lotPricing", e.target.value)}
        placeholder={"例:\n100個: ¥4,200\n500個: ¥3,800\n1,000個: ¥3,500"}
      />

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-navy">価格条件</span>
        <select
          className={selectClass}
          value={form.priceConditions}
          onChange={(e) =>
            update(
              "priceConditions",
              e.target.value as PriceConditionCode | "",
            )
          }
        >
          {priceConditionOptions.map((o) => (
            <option key={o.value || "unset"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <Input
        label="MOQ（最低発注数量）"
        name="minOrder"
        maxLength={CASE_TEXT_LIMITS.minOrder}
        value={form.minOrder}
        onChange={(e) => update("minOrder", e.target.value)}
        placeholder="例: 初回 100個〜"
      />

      <Input
        label="最小発注金額"
        name="minOrderAmount"
        maxLength={CASE_TEXT_LIMITS.minOrderAmount}
        value={form.minOrderAmount}
        onChange={(e) => update("minOrderAmount", e.target.value)}
        placeholder="例: ¥100,000〜"
      />

      <Input
        label="希望小売価格（想定売価）"
        name="suggestedRetailPrice"
        maxLength={CASE_TEXT_LIMITS.suggestedRetailPrice}
        value={form.suggestedRetailPrice}
        onChange={(e) => update("suggestedRetailPrice", e.target.value)}
        placeholder="例: ¥9,800（税込）"
      />

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-navy">サンプル提供可否</span>
        <select
          className={selectClass}
          value={form.sampleAvailable}
          onChange={(e) =>
            update(
              "sampleAvailable",
              e.target.value as AvailabilityOption | "",
            )
          }
        >
          {availabilityOptions.map((o) => (
            <option key={o.value || "unset"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-navy">テスト販売可否</span>
        <select
          className={selectClass}
          value={form.testSaleAvailable}
          onChange={(e) =>
            update(
              "testSaleAvailable",
              e.target.value as AvailabilityOption | "",
            )
          }
        >
          {availabilityOptions.map((o) => (
            <option key={o.value || "unset"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
