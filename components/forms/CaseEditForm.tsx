"use client";

import { FormEvent, useState, type ReactNode } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { updateCaseAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { CaseImageUploader } from "@/components/forms/CaseImageUploader";
import { caseToFormInput } from "@/lib/case-field-normalize";
import { CASE_TEXT_LIMITS } from "@/lib/case-validation";
import {
  caseCategories,
  caseRegions,
  salesFormatOptions,
  targetCountryOptions,
  type Case,
  type CaseCreateInput,
} from "@/lib/types";

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

type CaseEditFormProps = {
  caseItem: Case;
};

export function CaseEditForm({ caseItem }: CaseEditFormProps) {
  const [form, setForm] = useState<CaseCreateInput>(() =>
    caseToFormInput(caseItem),
  );
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

    try {
      // product images are managed by CaseImageUploader (case_images)
      const result = await updateCaseAction(caseItem.id, {
        ...form,
        productImageUrl: caseItem.productImageUrl?.trim() || null,
      });
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(
        `更新処理でエラーが発生しました: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-up space-y-6"
      data-component="CaseEditForm"
    >
      <Section title="基本情報">
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
          <span className="font-medium text-navy">原産国</span>
          <select
            className={selectClass}
            value={form.targetCountry}
            onChange={(e) =>
              update(
                "targetCountry",
                e.target.value as CaseCreateInput["targetCountry"],
              )
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
      </Section>

      <Section title="商品情報">
        <Input
          label="商品名"
          name="title"
          required
          maxLength={CASE_TEXT_LIMITS.title}
          value={form.title}
          onChange={(e) => {
            const value = e.target.value;
            setForm((prev) => ({
              ...prev,
              title: value,
              productName: value,
            }));
          }}
        />
        <Input
          label="商品コード（SKU）"
          name="sku"
          maxLength={CASE_TEXT_LIMITS.sku}
          value={form.sku}
          onChange={(e) => update("sku", e.target.value)}
          placeholder="HYC-0001"
          autoComplete="off"
        />
        <p className="text-xs text-muted">
          社内管理用の商品コードです。販売パートナーにも表示されます。
          （任意・英数字・ハイフン・アンダースコア・{CASE_TEXT_LIMITS.sku}
          文字以内。例: HYC-0001）
        </p>
        <TextArea
          label="一覧用サマリー"
          name="summary"
          required
          rows={2}
          maxLength={CASE_TEXT_LIMITS.summary}
          value={form.summary}
          onChange={(e) => update("summary", e.target.value)}
          placeholder="一覧に出す1〜2文"
        />
        <p className="text-xs text-muted">
          一覧表示用の短文。（{form.summary.length}/{CASE_TEXT_LIMITS.summary}）
        </p>
        <TextArea
          label="商品説明"
          name="description"
          required
          rows={8}
          maxLength={CASE_TEXT_LIMITS.description}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="特徴・強み・用途・販売時の訴求内容など"
        />
        <p className="text-xs text-muted">
          特徴・強み・用途・販売時の訴求内容をまとめて入力してください。
          （{form.description.length}/{CASE_TEXT_LIMITS.description}）
        </p>
        <Input
          label="想定価格帯"
          name="priceBand"
          placeholder="例: 小売 3,000〜5,000円"
          maxLength={CASE_TEXT_LIMITS.priceBand}
          value={form.priceBand}
          onChange={(e) => update("priceBand", e.target.value)}
        />
      </Section>

      <Section title="販売条件">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">販売形式</span>
          <select
            className={selectClass}
            value={form.salesFormat}
            onChange={(e) =>
              update(
                "salesFormat",
                e.target.value as CaseCreateInput["salesFormat"],
              )
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
        <Input
          label="最小発注数量"
          name="minOrder"
          maxLength={CASE_TEXT_LIMITS.minOrder}
          value={form.minOrder}
          onChange={(e) => update("minOrder", e.target.value)}
          placeholder="例: 初回 100個〜"
        />
        <Input
          label="販売チャネル"
          name="partnerChannels"
          placeholder="例: 実店舗 / EC / 卸"
          maxLength={CASE_TEXT_LIMITS.partnerChannels}
          value={form.partnerChannels}
          onChange={(e) => update("partnerChannels", e.target.value)}
        />
        <TextArea
          label="その他の取引条件（任意）"
          name="salesTerms"
          rows={3}
          maxLength={CASE_TEXT_LIMITS.salesTerms}
          value={form.salesTerms}
          onChange={(e) => update("salesTerms", e.target.value)}
        />
        <TextArea
          label="商品提供企業の提供条件"
          name="offer"
          required
          maxLength={CASE_TEXT_LIMITS.offer}
          value={form.offer}
          onChange={(e) => update("offer", e.target.value)}
        />
      </Section>

      <Section title="希望パートナー条件">
        <TextArea
          label="必須実績・資格・体制"
          name="partnerRequirements"
          rows={3}
          maxLength={CASE_TEXT_LIMITS.partnerRequirements}
          value={form.partnerRequirements}
          onChange={(e) => update("partnerRequirements", e.target.value)}
        />
        <TextArea
          label="求めるパートナー像"
          name="idealPartner"
          required
          maxLength={CASE_TEXT_LIMITS.idealPartner}
          value={form.idealPartner}
          onChange={(e) => update("idealPartner", e.target.value)}
        />
      </Section>

      <Section title="商品画像">
        <CaseImageUploader
          caseId={caseItem.id}
          images={caseItem.images}
          productImageUrl={caseItem.productImageUrl}
        />
      </Section>

      {error ? (
        <p
          className="whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={loading}>
        {loading ? "保存中..." : "変更を保存"}
      </Button>
    </form>
  );
}
