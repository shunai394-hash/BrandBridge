"use client";

import { Input, TextArea } from "@/components/ui/Input";
import {
  exclusiveDealOptions,
  trademarkStatusOptions,
} from "@/lib/case-detail-display";
import { CASE_TEXT_LIMITS } from "@/lib/case-validation";
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
 * Shared enrichment fields for maker create/edit + admin case forms.
 * Keeps 商品特徴 separate from 商品の強み.
 */
export function CaseDetailEnrichmentFields({ form, update }: Props) {
  return (
    <>
      <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          ブランド情報
        </h2>
        <Input
          label="ブランド名"
          name="brandName"
          maxLength={CASE_TEXT_LIMITS.brandName}
          value={form.brandName}
          onChange={(e) => update("brandName", e.target.value)}
          placeholder="例: TechWear"
        />
        <TextArea
          label="ブランド概要"
          name="brandOverview"
          rows={3}
          maxLength={CASE_TEXT_LIMITS.brandOverview}
          value={form.brandOverview}
          onChange={(e) => update("brandOverview", e.target.value)}
          placeholder="ブランドの背景・世界観・ターゲットなど"
        />
        <TextArea
          label="商品の強み"
          name="productStrengths"
          rows={3}
          maxLength={CASE_TEXT_LIMITS.productStrengths}
          value={form.productStrengths}
          onChange={(e) => update("productStrengths", e.target.value)}
          placeholder="競合との差別化、販売する理由（商品特徴とは別に記入）"
        />
        <p className="text-xs text-muted">
          商品特徴は機能・スペック、商品の強みは差別化・販売理由として分けてください。
        </p>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          販売情報
        </h2>
        <TextArea
          label="既存販売実績"
          name="salesTrackRecord"
          rows={3}
          maxLength={CASE_TEXT_LIMITS.salesTrackRecord}
          value={form.salesTrackRecord}
          onChange={(e) => update("salesTrackRecord", e.target.value)}
          placeholder="例: EC年商○○円、量販店○店舗、海外展開の有無など"
        />
        <Input
          label="日本/米国の販売可否"
          name="marketAvailabilityJpUs"
          maxLength={CASE_TEXT_LIMITS.marketAvailabilityJpUs}
          value={form.marketAvailabilityJpUs}
          onChange={(e) => update("marketAvailabilityJpUs", e.target.value)}
          placeholder="例: 日本：可 / 米国：条件付き"
        />
        <Input
          label="リードタイム"
          name="leadTime"
          maxLength={CASE_TEXT_LIMITS.leadTime}
          value={form.leadTime}
          onChange={(e) => update("leadTime", e.target.value)}
          placeholder="例: 発注後 2〜4週間"
        />
        <p className="text-xs text-muted">
          想定小売価格は「価格・発注条件」の希望小売価格（想定売価）で入力します。
        </p>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          取引条件（追加）
        </h2>
        <TextArea
          label="初回発注条件"
          name="initialOrderTerms"
          rows={3}
          maxLength={CASE_TEXT_LIMITS.initialOrderTerms}
          value={form.initialOrderTerms}
          onChange={(e) => update("initialOrderTerms", e.target.value)}
          placeholder="例: 初回は前払い、サンプル評価後に本発注など"
        />
        <p className="text-xs text-muted">
          参考卸価格帯・MOQは「価格・発注条件」セクションで入力します。
        </p>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          契約・権利情報
        </h2>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">商標・ライセンス情報</span>
          <select
            className={selectClass}
            value={form.trademarkStatus}
            onChange={(e) => update("trademarkStatus", e.target.value)}
          >
            {trademarkStatusOptions.map((o) => (
              <option key={o.value || "empty"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">独占販売可否</span>
          <select
            className={selectClass}
            value={form.exclusiveDealOption}
            onChange={(e) => {
              const v = e.target.value;
              update("exclusiveDealOption", v);
              if (v === "available" || v === "conditional") {
                update("isExclusive", true);
              } else if (v === "unavailable") {
                update("isExclusive", false);
              }
            }}
          >
            {exclusiveDealOptions.map((o) => (
              <option key={o.value || "empty"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          海外展開用情報
        </h2>
        <Input
          label="出荷元"
          name="shipFrom"
          maxLength={CASE_TEXT_LIMITS.shipFrom}
          value={form.shipFrom}
          onChange={(e) => update("shipFrom", e.target.value)}
          placeholder="例: 日本（大阪）"
        />
        <Input
          label="対応通貨"
          name="currencies"
          maxLength={CASE_TEXT_LIMITS.currencies}
          value={form.currencies}
          onChange={(e) => update("currencies", e.target.value)}
          placeholder="例: JPY / USD"
        />
        <Input
          label="取引条件（Incoterms）"
          name="incoterms"
          maxLength={CASE_TEXT_LIMITS.incoterms}
          value={form.incoterms}
          onChange={(e) => update("incoterms", e.target.value)}
          placeholder="例: FOB / CIF / EXW"
        />
        <TextArea
          label="必要認証"
          name="certifications"
          rows={2}
          maxLength={CASE_TEXT_LIMITS.certifications}
          value={form.certifications}
          onChange={(e) => update("certifications", e.target.value)}
          placeholder="例: PSE、FCC、CE など"
        />
        <Input
          label="対応言語"
          name="supportLanguages"
          maxLength={CASE_TEXT_LIMITS.supportLanguages}
          value={form.supportLanguages}
          onChange={(e) => update("supportLanguages", e.target.value)}
          placeholder="例: 日本語 / 英語"
        />
      </section>
    </>
  );
}
