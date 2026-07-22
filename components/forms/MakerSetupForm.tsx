"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { ProductImageField } from "@/components/forms/ProductImageField";
import { ProductVideoUrlField } from "@/components/forms/ProductVideoUrlField";
import { completeMakerSetupAction } from "@/lib/actions";
import { CASE_TEXT_LIMITS } from "@/lib/case-validation";
import { createClient } from "@/lib/supabase/client";
import {
  caseCategories,
  makerDealTypeOptions,
  makerSalesAreaOptions,
  makerSalesChannelOptions,
  type MakerDealType,
  type MakerRegistrationInput,
  type MakerSalesArea,
  type MakerSalesChannel,
} from "@/lib/types";

const STEPS = [
  { id: 1, label: "商品提供企業情報" },
  { id: 2, label: "商品情報" },
  { id: 3, label: "販売条件" },
  { id: 4, label: "確認" },
] as const;

const industryOptions = caseCategories.filter((c) => c !== "すべて");
const selectClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

type MakerSetupFormProps = {
  email: string;
  userId: string;
};

function FieldLabel({
  children,
  required,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <span className="font-medium text-navy">
      {children}
      {required ? (
        <span className="ml-1 text-xs text-teal">必須</span>
      ) : (
        <span className="ml-1 text-xs text-muted">任意</span>
      )}
    </span>
  );
}

export function MakerSetupForm({ email, userId }: MakerSetupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<
    Omit<MakerRegistrationInput, "email" | "password">
  >({
    companyName: "",
    contactName: "",
    industry: "美容・コスメ",
    companyOverview: "",
    productName: "",
    productCategory: "美容・コスメ",
    productSummary: "",
    salesArea: "全国",
    salesChannels: [],
    dealType: "卸販売",
    dealTerms: "",
    productImageUrl: null,
    productVideoUrl: null,
    countryOfOrigin: "",
    salesTerms: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleChannel(channel: MakerSalesChannel) {
    setForm((prev) => {
      const has = prev.salesChannels.includes(channel);
      return {
        ...prev,
        salesChannels: has
          ? prev.salesChannels.filter((c) => c !== channel)
          : [...prev.salesChannels, channel],
      };
    });
  }

  function validateStep(current: number): string | null {
    if (current === 1) {
      if (!form.companyName.trim()) return "会社名を入力してください";
      if (!form.contactName.trim()) return "担当者名を入力してください";
      if (!form.industry) return "業種を選択してください";
      if (!form.companyOverview.trim()) return "会社概要を入力してください";
    }
    if (current === 2) {
      if (!form.productName.trim()) return "商品名を入力してください";
      if (!form.productCategory) return "商品カテゴリを選択してください";
      if (!form.productSummary.trim()) return "商品説明を入力してください";
      if (form.productSummary.length > CASE_TEXT_LIMITS.description) {
        return `商品説明は${CASE_TEXT_LIMITS.description}文字以内にしてください`;
      }
    }
    if (current === 3) {
      if (!form.salesArea) return "希望販売エリアを選択してください";
      if (form.salesChannels.length === 0) {
        return "販売希望チャネルを1つ以上選択してください";
      }
      if (!form.dealType) return "希望する取引形式を選択してください";
    }
    return null;
  }

  function goNext() {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((s) => Math.min(4, s + 1));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    for (const s of [1, 2, 3]) {
      const message = validateStep(s);
      if (message) {
        setError(message);
        setStep(s);
        return;
      }
    }

    if (imageUploading) {
      setError("画像のアップロード完了を待ってから保存してください");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Setup must never call signUp / signIn — only authenticated writes.
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        setError("ログインセッションが無効です。ログインし直してください。");
        router.push("/login?next=/maker/setup");
        return;
      }

      const imageUrl = form.productImageUrl?.trim() || null;
      console.info("[MakerSetupForm] submit", {
        has_product_image_url: Boolean(imageUrl),
        product_image_url_len: imageUrl?.length ?? 0,
      });
      const result = await completeMakerSetupAction({
        companyName: form.companyName,
        contactName: form.contactName,
        industry: form.industry,
        companyOverview: form.companyOverview,
        productName: form.productName,
        productCategory: form.productCategory,
        productSummary: form.productSummary,
        salesArea: form.salesArea,
        salesChannels: form.salesChannels,
        dealType: form.dealType,
        dealTerms: form.dealTerms,
        productImageUrl: imageUrl,
        productVideoUrl: form.productVideoUrl?.trim() || null,
      });

      if (result?.error) {
        setError(result.error);
      }
      // Success: server action redirects
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(
        `保存処理でエラーが発生しました: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    } finally {
      setLoading(false);
    }
  }

  const progress = useMemo(() => (step / STEPS.length) * 100, [step]);

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="text-sm font-medium text-navy">
          STEP {step} / {STEPS.length}
          <span className="ml-2 text-muted">{STEPS[step - 1]?.label}</span>
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-teal transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">ログイン中: {email}</p>
      </div>

      <form
        onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()}
        className="space-y-5 rounded-xl border border-border bg-surface p-5 md:p-6"
      >
        {step === 1 ? (
          <>
            <Input
              label="会社名（必須）"
              name="companyName"
              required
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
            />
            <Input
              label="担当者名（必須）"
              name="contactName"
              required
              value={form.contactName}
              onChange={(e) => update("contactName", e.target.value)}
            />
            <label className="flex flex-col gap-1.5 text-sm">
              <FieldLabel required>業種</FieldLabel>
              <select
                className={selectClass}
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
              >
                {industryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <TextArea
              label="会社概要（必須）"
              name="companyOverview"
              required
              rows={5}
              value={form.companyOverview}
              onChange={(e) => update("companyOverview", e.target.value)}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Input
              label="商品名（必須）"
              name="productName"
              required
              value={form.productName}
              onChange={(e) => update("productName", e.target.value)}
            />
            <ProductImageField
              label="商品画像（任意）"
              value={form.productImageUrl ?? null}
              onChange={(url) => update("productImageUrl", url)}
              onUploadingChange={setImageUploading}
              disabled={loading}
            />
            <ProductVideoUrlField
              locale="ja"
              value={form.productVideoUrl ?? ""}
              onChange={(v) => update("productVideoUrl", v || null)}
              disabled={loading}
            />
            <label className="flex flex-col gap-1.5 text-sm">
              <FieldLabel required>商品カテゴリ</FieldLabel>
              <select
                className={selectClass}
                value={form.productCategory}
                onChange={(e) => update("productCategory", e.target.value)}
              >
                {industryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <TextArea
              label="商品説明（必須）"
              name="productSummary"
              required
              rows={6}
              maxLength={CASE_TEXT_LIMITS.description}
              value={form.productSummary}
              onChange={(e) => update("productSummary", e.target.value)}
            />
            <p className="text-xs text-muted">
              {form.productSummary.length} / {CASE_TEXT_LIMITS.description} 文字
            </p>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <fieldset>
              <legend className="mb-2 text-sm">
                <FieldLabel required>希望販売エリア</FieldLabel>
              </legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {makerSalesAreaOptions.map((area) => (
                  <label
                    key={area}
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-3 text-sm",
                      form.salesArea === area
                        ? "border-teal bg-teal/10"
                        : "border-border bg-background text-muted",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="salesArea"
                      className="accent-teal"
                      checked={form.salesArea === area}
                      onChange={() =>
                        update("salesArea", area as MakerSalesArea)
                      }
                    />
                    {area === "全国" ? "日本全国" : area}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm">
                <FieldLabel required>販売希望チャネル</FieldLabel>
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {makerSalesChannelOptions.map((channel) => (
                  <label
                    key={channel}
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-3 text-sm",
                      form.salesChannels.includes(channel)
                        ? "border-teal bg-teal/10"
                        : "border-border bg-background text-muted",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      className="accent-teal"
                      checked={form.salesChannels.includes(channel)}
                      onChange={() => toggleChannel(channel)}
                    />
                    {channel}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm">
                <FieldLabel required>希望する取引形式</FieldLabel>
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {makerDealTypeOptions.map((type) => (
                  <label
                    key={type}
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-3 text-sm",
                      form.dealType === type
                        ? "border-teal bg-teal/10"
                        : "border-border bg-background text-muted",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="dealType"
                      className="accent-teal"
                      checked={form.dealType === type}
                      onChange={() => update("dealType", type as MakerDealType)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>
            <TextArea
              label="希望条件（任意）"
              name="dealTerms"
              rows={4}
              value={form.dealTerms}
              onChange={(e) => update("dealTerms", e.target.value)}
              placeholder="リードタイム、支払条件、その他の希望など"
            />
            <Input
              label="原産国／出荷元（任意）"
              name="countryOfOrigin"
              value={form.countryOfOrigin ?? ""}
              onChange={(e) => update("countryOfOrigin", e.target.value)}
              placeholder="例: アメリカ合衆国 / 大阪"
            />
            <TextArea
              label="支払条件（任意）"
              name="salesTerms"
              rows={2}
              value={form.salesTerms ?? ""}
              onChange={(e) => update("salesTerms", e.target.value)}
              placeholder="例: 銀行振込 / Net 30"
            />
          </>
        ) : null}

        {step === 4 ? (
          <dl className="space-y-3 rounded-lg border border-border bg-background p-4 text-sm">
            {[
              ["会社名", form.companyName],
              ["担当者名", form.contactName],
              ["業種", form.industry],
              ["会社概要", form.companyOverview],
              ["商品名", form.productName],
              ["カテゴリ", form.productCategory],
              ["商品説明", form.productSummary],
              [
                "販売エリア",
                form.salesArea === "全国" ? "日本全国" : form.salesArea,
              ],
              ["チャネル", form.salesChannels.join(" / ")],
              ["取引形式", form.dealType],
              ["希望条件", form.dealTerms || "—"],
              ["画像", form.productImageUrl ? "設定済み" : "未選択"],
              [
                "商品紹介動画",
                form.productVideoUrl?.trim() || "未設定",
              ],
            ].map(([label, value]) => (
              <div key={label as string} className="grid gap-1 sm:grid-cols-[7rem_1fr]">
                <dt className="text-muted">{label}</dt>
                <dd className="whitespace-pre-wrap text-navy">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {error ? (
          <p
            className="whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setError("");
                setStep((s) => s - 1);
              }}
              disabled={loading}
            >
              戻る
            </Button>
          ) : (
            <span />
          )}
          {step < 4 ? (
            <Button type="button" className="w-full sm:w-auto" onClick={goNext}>
              次へ
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading || imageUploading}
            >
              {loading
                ? "保存中..."
                : imageUploading
                  ? "画像アップロード中..."
                  : "保存して完了"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
