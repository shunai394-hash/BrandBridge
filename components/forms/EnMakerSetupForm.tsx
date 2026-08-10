"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import {
  completeEnMakerSetupAction,
  type EnMakerCompanySetupInput,
} from "@/lib/en-maker-setup-action";
import { toEnglishActionError } from "@/lib/negotiation-ui";
import { createClient } from "@/lib/supabase/client";
import { caseCategories } from "@/lib/types";

const SETUP_PATH = "/en/maker/setup";

const STEPS = [
  { id: 1, label: "Company" },
  { id: 2, label: "Review" },
] as const;

const industryOptions = caseCategories.filter((c) => c !== "すべて");

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

const selectClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

type EnMakerSetupFormProps = {
  email: string;
  userId: string;
  initialCompanyName?: string;
  initialContactName?: string;
  initialIndustry?: string;
  initialCompanyOverview?: string;
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

/**
 * English maker first-time setup: company profile only.
 * Product registration lives at /en/maker/cases/new after onboarding.
 */
export function EnMakerSetupForm({
  email,
  userId,
  initialCompanyName = "",
  initialContactName = "",
  initialIndustry = "",
  initialCompanyOverview = "",
}: EnMakerSetupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const industryDefault = (industryOptions as readonly string[]).includes(
    initialIndustry,
  )
    ? initialIndustry
    : "美容・コスメ";
  const [form, setForm] = useState<EnMakerCompanySetupInput>({
    companyName: initialCompanyName,
    contactName: initialContactName,
    industry: industryDefault,
    companyOverview: initialCompanyOverview,
  });

  function update<K extends keyof EnMakerCompanySetupInput>(
    key: K,
    value: EnMakerCompanySetupInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateCompany(): string | null {
    if (!form.companyName.trim()) return "Please enter your company name.";
    if (!form.contactName.trim()) return "Please enter a contact person name.";
    if (!form.industry) return "Please select an industry.";
    if (!form.companyOverview.trim()) {
      return "Please enter a company overview.";
    }
    return null;
  }

  function goNext() {
    const message = validateCompany();
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep(2);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const message = validateCompany();
    if (message) {
      setError(message);
      setStep(1);
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
        router.push(`/en/login?next=${encodeURIComponent(SETUP_PATH)}`);
        return;
      }

      const result = await completeEnMakerSetupAction({
        companyName: form.companyName,
        contactName: form.contactName,
        industry: form.industry,
        companyOverview: form.companyOverview,
      });

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
      data-component="EnMakerSetupForm"
      data-form-version="en-setup-v2"
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
        <p className="mt-2 text-xs text-muted">Signed in as: {email}</p>
      </div>

      <form
        onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}
        className="space-y-5 rounded-xl border border-border bg-surface p-5 md:p-6"
        lang="en"
      >
        {step === 1 ? (
          <>
            <Input
              label="Company Name (required)"
              name="companyName"
              required
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
            />
            <Input
              label="Contact Person (required)"
              name="contactName"
              required
              value={form.contactName}
              onChange={(e) => update("contactName", e.target.value)}
            />
            <label className="flex flex-col gap-1.5 text-sm">
              <FieldLabel required>Industry</FieldLabel>
              <select
                className={selectClass}
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
              >
                {industryOptions.map((item) => (
                  <option key={item} value={item}>
                    {CATEGORY_LABEL_EN[item] ?? item}
                  </option>
                ))}
              </select>
            </label>
            <TextArea
              label="Company Overview (required)"
              name="companyOverview"
              required
              rows={5}
              value={form.companyOverview}
              onChange={(e) => update("companyOverview", e.target.value)}
            />
            <p className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted">
              You can register products after completing this company setup.
            </p>
          </>
        ) : null}

        {step === 2 ? (
          <dl className="space-y-3 rounded-lg border border-border bg-background p-4 text-sm">
            {[
              ["Company Name", form.companyName],
              ["Contact Person", form.contactName],
              ["Industry", CATEGORY_LABEL_EN[form.industry] ?? form.industry],
              ["Company Overview", form.companyOverview],
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
                setStep(1);
              }}
              disabled={loading}
            >
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <Button type="button" className="w-full sm:w-auto" onClick={goNext}>
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save and finish"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
