"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import {
  completeMakerSetupAction,
  type MakerCompanySetupInput,
} from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { caseCategories } from "@/lib/types";

const STEPS = [
  { id: 1, label: "会社情報" },
  { id: 2, label: "確認" },
] as const;

const industryOptions = caseCategories.filter((c) => c !== "すべて");
const selectClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

type MakerSetupFormProps = {
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
        <span className="ml-1 text-xs text-teal">必須</span>
      ) : (
        <span className="ml-1 text-xs text-muted">任意</span>
      )}
    </span>
  );
}

/**
 * Japanese maker first-time setup: company profile only.
 * Product registration lives at /maker/cases/new after onboarding.
 */
export function MakerSetupForm({
  email,
  userId,
  initialCompanyName = "",
  initialContactName = "",
  initialIndustry = "",
  initialCompanyOverview = "",
}: MakerSetupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const industryDefault = (industryOptions as readonly string[]).includes(
    initialIndustry,
  )
    ? initialIndustry
    : "美容・コスメ";
  const [form, setForm] = useState<MakerCompanySetupInput>({
    companyName: initialCompanyName,
    contactName: initialContactName,
    industry: industryDefault,
    companyOverview: initialCompanyOverview,
  });

  function update<K extends keyof MakerCompanySetupInput>(
    key: K,
    value: MakerCompanySetupInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateCompany(): string | null {
    if (!form.companyName.trim()) return "会社名を入力してください";
    if (!form.contactName.trim()) return "担当者名を入力してください";
    if (!form.industry) return "業種を選択してください";
    if (!form.companyOverview.trim()) return "会社概要を入力してください";
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
        setError("ログインセッションが無効です。ログインし直してください。");
        router.push("/login?next=/maker/setup");
        return;
      }

      const result = await completeMakerSetupAction({
        companyName: form.companyName,
        contactName: form.contactName,
        industry: form.industry,
        companyOverview: form.companyOverview,
      });

      if (result?.error) {
        setError(result.error);
      }
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
    <div
      className="animate-fade-up space-y-6"
      data-component="MakerSetupForm"
      data-form-version="ja-setup-v2"
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
        <p className="mt-2 text-xs text-muted">ログイン中: {email}</p>
      </div>

      <form
        onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}
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
            <p className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted">
              商品の登録は、会社情報のセットアップ完了後にマイページから行えます。
            </p>
          </>
        ) : null}

        {step === 2 ? (
          <dl className="space-y-3 rounded-lg border border-border bg-background p-4 text-sm">
            {[
              ["会社名", form.companyName],
              ["担当者名", form.contactName],
              ["業種", form.industry],
              ["会社概要", form.companyOverview],
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
              戻る
            </Button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <Button type="button" className="w-full sm:w-auto" onClick={goNext}>
              次へ
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "保存中..." : "保存して完了"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
