"use client";

import { FormEvent, useState, type ReactNode } from "react";
import { createCaseAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import {
  caseCategories,
  caseRegions,
  salesFormatOptions,
  targetCountryOptions,
  type CaseCreateInput,
} from "@/lib/types";

const initial: CaseCreateInput = {
  title: "",
  category: "美容・コスメ",
  region: "全国",
  summary: "",
  description: "",
  idealPartner: "",
  offer: "",
  productName: "",
  productFeatures: "",
  priceBand: "",
  salesFormat: "wholesale",
  salesTerms: "",
  minOrder: "",
  isExclusive: false,
  targetCountry: "JP",
  partnerChannels: "",
  partnerRequirements: "",
};

const categoryOptions = caseCategories.filter((c) => c !== "すべて");
const regionOptions = caseRegions.filter((r) => r !== "すべて");

const selectClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
      <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CaseCreateForm() {
  const [form, setForm] = useState<CaseCreateInput>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof CaseCreateInput>(
    key: K,
    value: CaseCreateInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await createCaseAction(form);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up space-y-6">
      <Section title="基本情報">
        <Input
          label="案件タイトル"
          name="title"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">カテゴリ</span>
          <select
            className={selectClass}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            required
          >
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">対象国・市場</span>
          <select
            className={selectClass}
            value={form.targetCountry}
            onChange={(e) =>
              update("targetCountry", e.target.value as CaseCreateInput["targetCountry"])
            }
            required
          >
            {targetCountryOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">募集エリア（補足）</span>
          <select
            className={selectClass}
            value={form.region}
            onChange={(e) => update("region", e.target.value)}
            required
          >
            {regionOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <TextArea
          label="一覧用サマリー"
          name="summary"
          required
          rows={3}
          value={form.summary}
          onChange={(e) => update("summary", e.target.value)}
        />
      </Section>

      <Section title="商品情報">
        <Input
          label="商品・ブランド名"
          name="productName"
          required
          value={form.productName}
          onChange={(e) => update("productName", e.target.value)}
        />
        <TextArea
          label="商品の特徴・差別化ポイント"
          name="productFeatures"
          rows={3}
          value={form.productFeatures}
          onChange={(e) => update("productFeatures", e.target.value)}
        />
        <Input
          label="想定価格帯"
          name="priceBand"
          placeholder="例: 小売 3,000〜5,000円"
          value={form.priceBand}
          onChange={(e) => update("priceBand", e.target.value)}
        />
        <TextArea
          label="案件概要"
          name="description"
          required
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Section>

      <Section title="販売条件">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">販売形式</span>
          <select
            className={selectClass}
            value={form.salesFormat}
            onChange={(e) =>
              update("salesFormat", e.target.value as CaseCreateInput["salesFormat"])
            }
            required
          >
            {salesFormatOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-navy">独占可否</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="isExclusive"
              checked={form.isExclusive}
              onChange={() => update("isExclusive", true)}
            />
            独占可
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="isExclusive"
              checked={!form.isExclusive}
              onChange={() => update("isExclusive", false)}
            />
            非独占（複数パートナー可）
          </label>
        </fieldset>
        <TextArea
          label="取引条件（卸条件・マージン・契約期間など）"
          name="salesTerms"
          rows={3}
          value={form.salesTerms}
          onChange={(e) => update("salesTerms", e.target.value)}
        />
        <Input
          label="最小発注・初期ロット"
          name="minOrder"
          value={form.minOrder}
          onChange={(e) => update("minOrder", e.target.value)}
        />
        <TextArea
          label="メーカー提供条件"
          name="offer"
          required
          value={form.offer}
          onChange={(e) => update("offer", e.target.value)}
        />
      </Section>

      <Section title="希望パートナー条件">
        <Input
          label="希望チャネル"
          name="partnerChannels"
          placeholder="例: 実店舗 / EC / 卸"
          value={form.partnerChannels}
          onChange={(e) => update("partnerChannels", e.target.value)}
        />
        <TextArea
          label="必須実績・資格・体制"
          name="partnerRequirements"
          rows={3}
          value={form.partnerRequirements}
          onChange={(e) => update("partnerRequirements", e.target.value)}
        />
        <TextArea
          label="求めるパートナー像"
          name="idealPartner"
          required
          value={form.idealPartner}
          onChange={(e) => update("idealPartner", e.target.value)}
        />
      </Section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "提出中..." : "審査に提出する"}
      </Button>
    </form>
  );
}
