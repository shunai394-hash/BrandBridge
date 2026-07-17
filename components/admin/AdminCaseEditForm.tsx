"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { adminUpdateCaseAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { caseToFormInput } from "@/lib/case-field-normalize";
import { CASE_TEXT_LIMITS } from "@/lib/case-validation";
import {
  caseCategories,
  salesFormatOptions,
  targetCountryOptions,
  type Case,
  type CaseCreateInput,
  type SalesFormat,
  type TargetCountry,
} from "@/lib/types";

const categoryOptions = caseCategories.filter((c) => c !== "すべて");
const selectClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

type AdminCaseEditFormProps = {
  caseItem: Case;
};

export function AdminCaseEditForm({ caseItem }: AdminCaseEditFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<CaseCreateInput>(() =>
    caseToFormInput(caseItem),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function update<K extends keyof CaseCreateInput>(
    key: K,
    value: CaseCreateInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);

    try {
      const result = await adminUpdateCaseAction(caseItem.id, {
        ...form,
        productName: form.productName.trim(),
        productImageUrl: form.productImageUrl?.trim() || null,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(
        `保存に失敗しました: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up space-y-6">
      <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          商品情報
        </h2>
        <p className="text-xs text-muted">
          案件番号{" "}
          <span className="font-mono text-teal">{caseItem.caseNumber}</span>
          {" ・ "}
          DBの値をそのまま表示（自動コピー・自動補完なし）。
        </p>

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
          文字以内。例: BB-000123）
        </p>

        <Input
          label="商品名"
          name="productName"
          required
          maxLength={CASE_TEXT_LIMITS.productName}
          value={form.productName}
          onChange={(e) => update("productName", e.target.value)}
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
          <span className="font-medium text-navy">原産国</span>
          <select
            className={selectClass}
            value={form.targetCountry}
            onChange={(e) =>
              update("targetCountry", e.target.value as TargetCountry)
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

        <TextArea
          label="一覧用サマリー"
          name="summary"
          required
          rows={2}
          maxLength={CASE_TEXT_LIMITS.summary}
          value={form.summary}
          onChange={(e) => update("summary", e.target.value)}
          placeholder="summary: 一覧用短文のみ"
        />
        <p className="text-xs text-muted">
          summary（一覧用短文）。詳細説明を入れない。（{form.summary.length}/
          {CASE_TEXT_LIMITS.summary}）
        </p>

        <TextArea
          label="商品説明"
          name="description"
          required
          rows={8}
          maxLength={CASE_TEXT_LIMITS.description}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="特徴・用途・訴求ポイントなど"
        />
        <p className="text-xs text-muted">
          特徴・用途・販売時の訴求ポイントなどをまとめて入力。（
          {form.description.length}/{CASE_TEXT_LIMITS.description}）
        </p>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          販売条件
        </h2>
        <p className="text-xs text-muted">各項目を個別に管理します。</p>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">販売形式</span>
          <select
            className={selectClass}
            value={form.salesFormat}
            onChange={(e) =>
              update("salesFormat", e.target.value as SalesFormat)
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
            非独占
          </label>
        </fieldset>

        <Input
          label="最小発注数量"
          name="minOrder"
          value={form.minOrder}
          onChange={(e) => update("minOrder", e.target.value)}
          placeholder="例: 初回 100個〜"
        />

        <Input
          label="販売チャネル"
          name="partnerChannels"
          value={form.partnerChannels}
          onChange={(e) => update("partnerChannels", e.target.value)}
          placeholder="例: 実店舗 / EC / 卸"
        />

        <TextArea
          label="その他の取引条件（任意）"
          name="salesTerms"
          rows={3}
          value={form.salesTerms}
          onChange={(e) => update("salesTerms", e.target.value)}
        />

        <Input
          label="想定価格帯"
          name="priceBand"
          value={form.priceBand}
          onChange={(e) => update("priceBand", e.target.value)}
        />

        <TextArea
          label="メーカー提供条件"
          name="offer"
          required
          rows={3}
          value={form.offer}
          onChange={(e) => update("offer", e.target.value)}
        />
      </section>

      {error ? (
        <p
          className="whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-teal">保存しました。</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : "保存する"}
        </Button>
        <Button href={`/admin/cases/${caseItem.id}`} variant="outline">
          審査画面へ
        </Button>
        <Button href="/admin/cases" variant="ghost">
          一覧へ
        </Button>
      </div>
    </form>
  );
}
