"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site";
import {
  caseInputFromRegistration,
  toCaseDraftMeta,
  MAKER_DRAFT_STORAGE_KEY,
} from "@/lib/maker-registration";
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
  { id: 1, label: "アカウント" },
  { id: 2, label: "メーカー情報" },
  { id: 3, label: "商品情報" },
  { id: 4, label: "販売条件" },
  { id: 5, label: "確認" },
] as const;

const industryOptions = caseCategories.filter((c) => c !== "すべて");

const selectClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

const initial: MakerRegistrationInput = {
  companyName: "",
  contactName: "",
  email: "",
  password: "",
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

export function MakerRegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<MakerRegistrationInput>(initial);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MAKER_DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<MakerRegistrationInput> & {
        step?: number;
      };
      setForm((prev) => ({
        ...prev,
        ...parsed,
        password: "",
        salesChannels: parsed.salesChannels ?? [],
      }));
      if (parsed.step && parsed.step >= 1 && parsed.step <= 5) {
        setStep(parsed.step);
      }
      setSavedAt("下書きを復元しました");
    } catch {
      // ignore
    }
  }, []);

  function update<K extends keyof MakerRegistrationInput>(
    key: K,
    value: MakerRegistrationInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function saveDraft(showMessage = true) {
    try {
      const { password: _pw, ...rest } = form;
      localStorage.setItem(
        MAKER_DRAFT_STORAGE_KEY,
        JSON.stringify({ ...rest, step }),
      );
      if (showMessage) {
        setSavedAt(`下書き保存: ${new Date().toLocaleTimeString("ja-JP")}`);
      }
    } catch {
      setError("下書きの保存に失敗しました");
    }
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
      if (!form.email.trim()) return "メールアドレスを入力してください";
      if (form.password.length < 8) return "パスワードは8文字以上にしてください";
    }
    if (current === 2) {
      if (!form.companyName.trim()) return "会社名を入力してください";
      if (!form.industry) return "業種を選択してください";
      if (!form.companyOverview.trim()) return "会社概要を入力してください";
    }
    if (current === 3) {
      if (!form.productName.trim()) return "商品名を入力してください";
      if (!form.productCategory) return "商品カテゴリを選択してください";
      if (!form.productSummary.trim()) return "商品概要を入力してください";
      if (!form.salesArea) return "希望販売エリアを選択してください";
      if (form.salesChannels.length === 0) {
        return "販売希望チャネルを1つ以上選択してください";
      }
    }
    if (current === 4) {
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
    saveDraft(false);
    setStep((s) => Math.min(5, s + 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  async function uploadProductImage(
    userId: string,
  ): Promise<string | null> {
    if (!imageFile) return null;
    const supabase = createClient();
    const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, imageFile, { upsert: true, contentType: imageFile.type });
    if (uploadError) {
      console.error("[uploadProductImage]", uploadError.message);
      return null;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const message = validateStep(4);
    if (message) {
      setError(message);
      setStep(4);
      return;
    }
    setError("");
    setLoading(true);

    const supabase = createClient();
    const siteUrl =
      typeof window !== "undefined" ? window.location.origin : getSiteUrl();
    const draft = toCaseDraftMeta(form);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/maker/registration-complete`,
        data: {
          role: "maker",
          company_name: form.companyName.trim(),
          contact_name: form.contactName.trim(),
          industry: form.industry,
          product_overview: form.productSummary.trim(),
          description: form.companyOverview.trim(),
          case_draft: draft,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // Session available (email confirm disabled) → create case now
    if (data.session && data.user) {
      const imageUrl = await uploadProductImage(data.user.id);
      const caseInput = caseInputFromRegistration({
        ...form,
        productImageUrl: imageUrl,
      });

      const { error: caseError } = await supabase.from("cases").insert({
        maker_id: data.user.id,
        title: caseInput.title,
        category: caseInput.category,
        region: caseInput.region,
        summary: caseInput.summary,
        description: caseInput.description,
        ideal_partner: caseInput.idealPartner,
        offer: caseInput.offer,
        product_name: caseInput.productName,
        product_features: caseInput.productFeatures || null,
        price_band: caseInput.priceBand || null,
        sales_format: caseInput.salesFormat,
        sales_terms: caseInput.salesTerms || null,
        min_order: caseInput.minOrder || null,
        is_exclusive: caseInput.isExclusive,
        target_country: caseInput.targetCountry,
        partner_channels: caseInput.partnerChannels || null,
        partner_requirements: caseInput.partnerRequirements || null,
        product_image_url: caseInput.productImageUrl || null,
        status: "open",
        review_status: "pending_review",
      });

      await supabase
        .from("profiles")
        .update({
          description: form.companyOverview.trim(),
          industry: form.industry,
          product_overview: form.productSummary.trim(),
        })
        .eq("id", data.user.id);

      await supabase.auth.updateUser({
        data: { case_draft: null, case_draft_flushed: true },
      });

      localStorage.removeItem(MAKER_DRAFT_STORAGE_KEY);
      setLoading(false);

      if (caseError) {
        setError(
          `アカウントは作成されましたが、案件の下書き保存に失敗しました: ${caseError.message}`,
        );
        return;
      }

      router.push("/maker/registration-complete");
      router.refresh();
      return;
    }

    // Email confirmation required — draft is in user_metadata for /auth/callback
    localStorage.removeItem(MAKER_DRAFT_STORAGE_KEY);
    setLoading(false);
    setSubmitted(true);
  }

  const progress = useMemo(() => (step / STEPS.length) * 100, [step]);

  if (submitted) {
    return (
      <div className="animate-fade-up rounded-lg border border-teal/30 bg-cream p-8 text-center">
        <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy">
          確認メールを送信しました
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          メール内のリンクで認証を完了してください。認証後、入力した商品案件が審査待ちとして登録され、確認ページへ進みます。
        </p>
        <ol className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-navy">
          <li>1. メール認証</li>
          <li>2. 商品登録の反映</li>
          <li>3. 案件公開申請（審査）</li>
          <li>4. 販売パートナーから応募</li>
        </ol>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/login" className="w-full sm:w-auto">
            ログインへ
          </Button>
          <Button href="/for-makers" variant="outline" className="w-full sm:w-auto">
            メーカー向けページへ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      {/* Step indicator */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-navy">
            STEP {step} / {STEPS.length}
            <span className="ml-2 text-muted">{STEPS[step - 1]?.label}</span>
          </p>
          <button
            type="button"
            onClick={() => saveDraft(true)}
            className="text-xs font-medium text-teal hover:underline"
          >
            途中保存
          </button>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-teal transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {savedAt ? <p className="mt-2 text-xs text-muted">{savedAt}</p> : null}
        <ol className="mt-4 hidden gap-2 sm:grid sm:grid-cols-5">
          {STEPS.map((item) => (
            <li
              key={item.id}
              className={[
                "rounded-md border px-2 py-2 text-center text-xs",
                item.id === step
                  ? "border-teal bg-teal/10 text-teal-dark"
                  : item.id < step
                    ? "border-border bg-cream text-navy"
                    : "border-border text-muted",
              ].join(" ")}
            >
              {item.id}. {item.label}
            </li>
          ))}
        </ol>
      </div>

      <form
        onSubmit={step === 5 ? handleSubmit : (e) => e.preventDefault()}
        className="space-y-5 rounded-xl border border-border bg-surface p-5 md:p-6"
      >
        {step === 1 ? (
          <>
            <p className="text-sm text-muted">
              アカウントを作成します。登録後はメール認証が必要になる場合があります。
            </p>
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
            <Input
              label="メールアドレス（必須）"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <Input
              label="パスワード（必須・8文字以上）"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Input
              label="会社名（必須）"
              name="companyNameStep2"
              required
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
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
              placeholder="事業内容、強み、取り扱いブランドなどをご記入ください"
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Input
              label="商品名（必須）"
              name="productName"
              required
              value={form.productName}
              onChange={(e) => update("productName", e.target.value)}
            />
            <label className="flex flex-col gap-1.5 text-sm">
              <FieldLabel>商品画像</FieldLabel>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className={selectClass}
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
              <span className="text-xs text-muted">
                JPEG / PNG / WebP（最大5MB）。メール認証ありの場合は認証後に追加できます。
              </span>
              {imageFile ? (
                <span className="text-xs text-teal">選択中: {imageFile.name}</span>
              ) : null}
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <FieldLabel required>商品カテゴリ</FieldLabel>
              <select
                className={selectClass}
                value={form.productCategory}
                onChange={(e) => {
                  update("productCategory", e.target.value);
                  update("industry", e.target.value);
                }}
              >
                {industryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <TextArea
              label="商品概要（必須）"
              name="productSummary"
              required
              rows={4}
              value={form.productSummary}
              onChange={(e) => update("productSummary", e.target.value)}
              placeholder="特徴、ターゲット、差別化ポイントなど"
            />
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
                        ? "border-teal bg-teal/10 text-navy"
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
                        ? "border-teal bg-teal/10 text-navy"
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
          </>
        ) : null}

        {step === 4 ? (
          <>
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
                        ? "border-teal bg-teal/10 text-navy"
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
              placeholder="最低発注、掛け率、独占希望など自由にご記入ください"
            />
          </>
        ) : null}

        {step === 5 ? (
          <div className="space-y-4 text-sm">
            <p className="text-muted">
              内容を確認し、問題なければ登録を完了してください。商品案件は審査待ちとして保存されます。
            </p>
            <dl className="space-y-3 rounded-lg border border-border bg-background p-4">
              {[
                ["会社名", form.companyName],
                ["担当者名", form.contactName],
                ["メール", form.email],
                ["業種", form.industry],
                ["会社概要", form.companyOverview],
                ["商品名", form.productName],
                ["商品カテゴリ", form.productCategory],
                ["商品概要", form.productSummary],
                [
                  "希望販売エリア",
                  form.salesArea === "全国" ? "日本全国" : form.salesArea,
                ],
                ["販売希望チャネル", form.salesChannels.join(" / ") || "—"],
                ["取引形式", form.dealType],
                ["希望条件", form.dealTerms || "—"],
                ["商品画像", imageFile?.name || "未選択"],
              ].map(([label, value]) => (
                <div key={label as string} className="grid gap-1 sm:grid-cols-[8rem_1fr]">
                  <dt className="text-muted">{label}</dt>
                  <dd className="whitespace-pre-wrap text-navy">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={goBack}
              disabled={loading}
            >
              戻る
            </Button>
          ) : (
            <span />
          )}
          {step < 5 ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={goNext}
            >
              次へ
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "登録中..." : "登録を完了する"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
