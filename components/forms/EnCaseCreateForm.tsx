"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { ProductVideoUrlField } from "@/components/forms/ProductVideoUrlField";
import { SetupProductImagesField } from "@/components/forms/SetupProductImagesField";
import { createEnMakerProductAction } from "@/lib/en-maker-product-action";
import { ENGLISH_CASE_MARKER } from "@/lib/inquiry-language";
import { toEnglishActionError } from "@/lib/negotiation-ui";
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

const CREATE_PATH = "/en/maker/cases/new";

const STEPS = [
  { id: 1, label: "Product" },
  { id: 2, label: "Sales conditions" },
  { id: 3, label: "Review" },
] as const;

const categoryOptions = caseCategories.filter((c) => c !== "すべて");

const CATEGORY_LABEL_EN: Record<string, string> = {
  "美容・コスメ": "Beauty & Cosmetics",
  "食品・飲料": "Food & Beverage",
  "健康・サプリ": "Health & Supplements",
  ファッション: "Fashion",
  "家電・ガジェット": "Electronics & Gadgets",
  "雑貨・ライフスタイル": "Lifestyle & Goods",
  "製造・産業": "Manufacturing & Industrial",
  その他: "Other",
};

const AREA_LABEL_EN: Record<MakerSalesArea, string> = {
  全国: "Japan (nationwide)",
  特定地域: "Specific regions in Japan",
  オンライン中心: "Online-focused",
};

const CHANNEL_LABEL_EN: Record<MakerSalesChannel, string> = {
  Amazon: "Amazon",
  "TikTok Shop": "TikTok Shop",
  自社EC: "Own e-commerce",
  実店舗: "Physical retail",
  卸販売: "Wholesale",
  その他: "Other",
};

const DEAL_LABEL_EN: Record<MakerDealType, string> = {
  卸販売: "Wholesale",
  代理店: "Agency",
  総代理店: "Exclusive agency",
  業務提携: "Business partnership",
  その他: "Other",
};

const selectClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

type EnCaseCreateFormProps = {
  email: string;
  userId: string;
  companyName?: string;
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
        <span className="ml-1 text-xs text-teal">Required</span>
      ) : (
        <span className="ml-1 text-xs text-muted">Optional</span>
      )}
    </span>
  );
}

type EnProductFormState = {
  productName: string;
  productCategory: string;
  productSummary: string;
  salesArea: MakerSalesArea;
  salesChannels: MakerSalesChannel[];
  dealType: MakerDealType;
  dealTerms: string;
  productImageUrl: string | null;
  productImageUrls: string[];
  productVideoUrl: string | null;
  brandName: string;
  countryOfOrigin: string;
  wholesalePrice: string;
  moq: string;
  exclusiveNote: "yes" | "no" | "";
  productFeatures: string;
  currencies: string;
  sampleAvailable: string;
  paymentTerms: string;
  incoterms: string;
  initialOrderTerms: string;
  brandOverview: string;
  productStrengths: string;
  certifications: string;
  supportLanguages: string;
  trademarkStatus: string;
};

/**
 * English product registration after company onboarding.
 * Logic moved from the former EnMakerSetupForm product / sales steps.
 */
export function EnCaseCreateForm({
  email,
  userId,
  companyName = "",
}: EnCaseCreateFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<EnProductFormState>({
    productName: "",
    productCategory: "美容・コスメ",
    productSummary: "",
    salesArea: "全国",
    salesChannels: [],
    dealType: "卸販売",
    dealTerms: "",
    productImageUrl: null,
    productImageUrls: [],
    productVideoUrl: null,
    brandName: "",
    countryOfOrigin: "",
    wholesalePrice: "",
    moq: "",
    exclusiveNote: "",
    productFeatures: "",
    currencies: "",
    sampleAvailable: "",
    paymentTerms: "",
    incoterms: "",
    initialOrderTerms: "",
    brandOverview: "",
    productStrengths: "",
    certifications: "",
    supportLanguages: "",
    trademarkStatus: "",
  });

  function update<K extends keyof EnProductFormState>(
    key: K,
    value: EnProductFormState[K],
  ) {
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
      if (!form.productName.trim()) return "Please enter a product name.";
      if (!form.productCategory) return "Please select a category.";
      if (!form.productSummary.trim()) {
        return "Please enter a product description.";
      }
      if (form.productSummary.length > CASE_TEXT_LIMITS.description) {
        return `Product description must be within ${CASE_TEXT_LIMITS.description} characters.`;
      }
    }
    if (current === 2) {
      if (!form.salesArea) return "Please select a target market / sales area.";
      if (form.salesChannels.length === 0) {
        return "Please select at least one sales channel.";
      }
      if (!form.dealType) return "Please select a sales format.";
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
    setStep((s) => Math.min(3, s + 1));
  }

  function buildActionPayload(): Omit<
    MakerRegistrationInput,
    "email" | "password" | "companyName" | "contactName" | "industry" | "companyOverview"
  > {
    const brand = form.brandName.trim();
    const origin = form.countryOfOrigin.trim();
    const body = form.productSummary.trim();
    const productSummary = [
      ENGLISH_CASE_MARKER,
      brand ? `Brand: ${brand}` : null,
      origin ? `Country of Origin: ${origin}` : null,
      "",
      body,
    ]
      .filter((line) => line != null)
      .join("\n")
      .trim();

    const dealTerms = [
      origin ? `Country of Origin: ${origin}` : null,
      form.wholesalePrice.trim()
        ? `Wholesale Price: ${form.wholesalePrice.trim()}`
        : null,
      form.moq.trim() ? `MOQ: ${form.moq.trim()}` : null,
      form.exclusiveNote === "yes"
        ? "Exclusive Availability: Available"
        : form.exclusiveNote === "no"
          ? "Exclusive Availability: Non-exclusive"
          : null,
      form.dealTerms.trim()
        ? `Trade Conditions:\n${form.dealTerms.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      productName: form.productName,
      productCategory: form.productCategory,
      productSummary,
      salesArea: form.salesArea,
      salesChannels: form.salesChannels,
      dealType: form.dealType,
      dealTerms,
      productImageUrl: form.productImageUrls?.[0] ?? form.productImageUrl,
      productImageUrls: form.productImageUrls ?? [],
      productVideoUrl: form.productVideoUrl?.trim() || null,
      brandName: brand || null,
      countryOfOrigin: origin || null,
      productFeatures: form.productFeatures.trim() || null,
      currencies: form.currencies.trim() || null,
      sampleAvailable: form.sampleAvailable || null,
      salesTerms: form.paymentTerms.trim() || null,
      incoterms: form.incoterms.trim() || null,
      initialOrderTerms: form.initialOrderTerms.trim() || null,
      brandOverview: form.brandOverview.trim() || null,
      productStrengths: form.productStrengths.trim() || null,
      certifications: form.certifications.trim() || null,
      supportLanguages: form.supportLanguages.trim() || null,
      trademarkStatus: form.trademarkStatus || null,
      exclusiveDealOption:
        form.exclusiveNote === "yes"
          ? "available"
          : form.exclusiveNote === "no"
            ? "unavailable"
            : null,
      minOrder: form.moq.trim() || null,
      priceBand: form.wholesalePrice.trim() || null,
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    for (const s of [1, 2]) {
      const message = validateStep(s);
      if (message) {
        setError(message);
        setStep(s);
        return;
      }
    }

    if (imageUploading) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        setError("Your session is invalid. Please sign in again.");
        router.push(`/en/login?next=${encodeURIComponent(CREATE_PATH)}`);
        return;
      }

      const result = await createEnMakerProductAction(buildActionPayload());
      if (result?.error) {
        setError(toEnglishActionError(result.error));
      }
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(
        `Save failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoading(false);
    }
  }

  const progress = useMemo(() => (step / STEPS.length) * 100, [step]);

  return (
    <div
      className="animate-fade-up space-y-6"
      lang="en"
      data-component="EnCaseCreateForm"
      data-form-version="en-product-v1"
      data-locale="en"
    >
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
        <p className="mt-2 text-xs text-muted">
          Signed in as: {email}
          {companyName ? ` · ${companyName}` : ""}
        </p>
      </div>

      <form
        onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}
        className="space-y-5 rounded-xl border border-border bg-surface p-5 md:p-6"
        lang="en"
      >
        {step === 1 ? (
          <>
            <Input
              label="Product Name (required)"
              name="productName"
              required
              value={form.productName}
              onChange={(e) => update("productName", e.target.value)}
            />
            <Input
              label="Brand Name (optional)"
              name="brandName"
              value={form.brandName}
              onChange={(e) => update("brandName", e.target.value)}
            />
            <Input
              label="Country of Origin (optional)"
              name="countryOfOrigin"
              value={form.countryOfOrigin}
              onChange={(e) => update("countryOfOrigin", e.target.value)}
              placeholder="e.g. Japan, United States, Thailand"
            />
            <SetupProductImagesField
              locale="en"
              value={form.productImageUrls ?? []}
              onChange={(urls) => {
                update("productImageUrls", urls);
                update("productImageUrl", urls[0] ?? null);
              }}
              onUploadingChange={setImageUploading}
              disabled={loading}
            />
            <ProductVideoUrlField
              locale="en"
              value={form.productVideoUrl ?? ""}
              onChange={(v) => update("productVideoUrl", v || null)}
              disabled={loading}
            />
            <label className="flex flex-col gap-1.5 text-sm">
              <FieldLabel required>Category</FieldLabel>
              <select
                className={selectClass}
                value={form.productCategory}
                onChange={(e) => update("productCategory", e.target.value)}
              >
                {categoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {CATEGORY_LABEL_EN[item] ?? item}
                  </option>
                ))}
              </select>
            </label>
            <TextArea
              label="Product Description (required)"
              name="productSummary"
              required
              rows={6}
              maxLength={CASE_TEXT_LIMITS.description}
              value={form.productSummary}
              onChange={(e) => update("productSummary", e.target.value)}
            />
            <p className="text-xs text-muted">
              {form.productSummary.length} / {CASE_TEXT_LIMITS.description}{" "}
              characters
            </p>
            <TextArea
              label="Product Features (optional)"
              name="productFeatures"
              rows={3}
              maxLength={CASE_TEXT_LIMITS.productFeatures}
              value={form.productFeatures}
              onChange={(e) => update("productFeatures", e.target.value)}
              placeholder="Key specs, ingredients, packaging, etc."
            />
            <TextArea
              label="Brand Overview (optional)"
              name="brandOverview"
              rows={3}
              maxLength={CASE_TEXT_LIMITS.brandOverview}
              value={form.brandOverview}
              onChange={(e) => update("brandOverview", e.target.value)}
              placeholder="Brand story, positioning, target audience"
            />
            <TextArea
              label="Product Strengths (optional)"
              name="productStrengths"
              rows={3}
              maxLength={CASE_TEXT_LIMITS.productStrengths}
              value={form.productStrengths}
              onChange={(e) => update("productStrengths", e.target.value)}
              placeholder="Differentiation and why partners should sell this"
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <fieldset>
              <legend className="mb-2 text-sm">
                <FieldLabel required>Target Country / Sales Area</FieldLabel>
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
                    {AREA_LABEL_EN[area]}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm">
                <FieldLabel required>Sales Channels</FieldLabel>
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
                    {CHANNEL_LABEL_EN[channel]}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm">
                <FieldLabel required>Sales Format</FieldLabel>
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
                    {DEAL_LABEL_EN[type]}
                  </label>
                ))}
              </div>
            </fieldset>
            <Input
              label="Wholesale Price (optional)"
              name="wholesalePrice"
              value={form.wholesalePrice}
              onChange={(e) => update("wholesalePrice", e.target.value)}
              placeholder="e.g. Quote on request / JPY 3000-5000"
            />
            <Input
              label="MOQ - Minimum Order Quantity (optional)"
              name="moq"
              value={form.moq}
              onChange={(e) => update("moq", e.target.value)}
              placeholder="e.g. 100 units / Negotiable"
            />
            <fieldset>
              <legend className="mb-2 text-sm">
                <FieldLabel>Exclusive Availability</FieldLabel>
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["yes", "Exclusive available"],
                    ["no", "Non-exclusive"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-3 text-sm",
                      form.exclusiveNote === value
                        ? "border-teal bg-teal/10"
                        : "border-border bg-background text-muted",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="exclusiveNote"
                      className="accent-teal"
                      checked={form.exclusiveNote === value}
                      onChange={() => update("exclusiveNote", value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <TextArea
              label="Trade Conditions (optional)"
              name="dealTerms"
              rows={4}
              value={form.dealTerms}
              onChange={(e) => update("dealTerms", e.target.value)}
              placeholder="Lead time and other free-text notes"
            />
            <TextArea
              label="Payment Terms (optional)"
              name="paymentTerms"
              rows={2}
              maxLength={CASE_TEXT_LIMITS.salesTerms}
              value={form.paymentTerms}
              onChange={(e) => update("paymentTerms", e.target.value)}
              placeholder="e.g. Wire / Wise · Net 30 negotiable"
            />
            <Input
              label="Currency (optional)"
              name="currencies"
              maxLength={CASE_TEXT_LIMITS.currencies}
              value={form.currencies}
              onChange={(e) => update("currencies", e.target.value)}
              placeholder="e.g. USD / JPY"
            />
            <Input
              label="Incoterms (optional)"
              name="incoterms"
              maxLength={CASE_TEXT_LIMITS.incoterms}
              value={form.incoterms}
              onChange={(e) => update("incoterms", e.target.value)}
              placeholder="e.g. FOB / CIF / DDP"
            />
            <TextArea
              label="Initial Order Terms (optional)"
              name="initialOrderTerms"
              rows={2}
              maxLength={CASE_TEXT_LIMITS.initialOrderTerms}
              value={form.initialOrderTerms}
              onChange={(e) => update("initialOrderTerms", e.target.value)}
              placeholder="e.g. MOQ 48 · Sample kit · Net 30"
            />
            <label className="flex flex-col gap-1.5 text-sm">
              <FieldLabel>Samples Availability</FieldLabel>
              <select
                className={selectClass}
                value={form.sampleAvailable}
                onChange={(e) => update("sampleAvailable", e.target.value)}
              >
                <option value="">Not set</option>
                <option value="yes">Available</option>
                <option value="negotiable">Negotiable</option>
                <option value="no">Not available</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <FieldLabel>Trademark / License</FieldLabel>
              <select
                className={selectClass}
                value={form.trademarkStatus}
                onChange={(e) => update("trademarkStatus", e.target.value)}
              >
                <option value="">Not set</option>
                <option value="registered">Registered</option>
                <option value="pending">Pending</option>
                <option value="unregistered">Unregistered</option>
              </select>
            </label>
            <TextArea
              label="Certifications (optional)"
              name="certifications"
              rows={2}
              maxLength={CASE_TEXT_LIMITS.certifications}
              value={form.certifications}
              onChange={(e) => update("certifications", e.target.value)}
              placeholder="e.g. Cruelty-free · Dermatologist tested"
            />
            <Input
              label="Support Languages (optional)"
              name="supportLanguages"
              maxLength={CASE_TEXT_LIMITS.supportLanguages}
              value={form.supportLanguages}
              onChange={(e) => update("supportLanguages", e.target.value)}
              placeholder="e.g. English / Japanese"
            />
          </>
        ) : null}

        {step === 3 ? (
          <dl className="space-y-3 rounded-lg border border-border bg-background p-4 text-sm">
            {[
              ["Product Name", form.productName],
              ["Brand Name", form.brandName || "—"],
              ["Country of Origin", form.countryOfOrigin || "—"],
              [
                "Category",
                CATEGORY_LABEL_EN[form.productCategory] ??
                  form.productCategory,
              ],
              ["Product Description", form.productSummary],
              ["Target Market", AREA_LABEL_EN[form.salesArea]],
              [
                "Sales Channels",
                form.salesChannels
                  .map((c) => CHANNEL_LABEL_EN[c] ?? c)
                  .join(" / "),
              ],
              ["Sales Format", DEAL_LABEL_EN[form.dealType]],
              ["Wholesale Price", form.wholesalePrice || "—"],
              ["MOQ", form.moq || "—"],
              [
                "Exclusive Option",
                form.exclusiveNote === "yes"
                  ? "Available"
                  : form.exclusiveNote === "no"
                    ? "Non-exclusive"
                    : "—",
              ],
              ["Trade Conditions", form.dealTerms || "—"],
              [
                "Product Images",
                (form.productImageUrls?.length ?? 0) > 0
                  ? `${form.productImageUrls!.length} selected`
                  : "Not selected",
              ],
              ["Product Video URL", form.productVideoUrl?.trim() || "—"],
            ].map(([label, value]) => (
              <div
                key={label as string}
                className="grid gap-1 sm:grid-cols-[9rem_1fr]"
              >
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
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <Button type="button" className="w-full sm:w-auto" onClick={goNext}>
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading || imageUploading}
            >
              {loading
                ? "Saving..."
                : imageUploading
                  ? "Uploading image..."
                  : "Register product"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
