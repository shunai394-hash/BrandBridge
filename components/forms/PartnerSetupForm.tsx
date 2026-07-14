"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { completePartnerSetupAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import {
  partnerChannelOptions,
  partnerDealPreferenceOptions,
  partnerSalesGenreOptions,
  type MakerSalesChannel,
  type PartnerDealPreference,
  type PartnerEntityType,
  type PartnerRegistrationInput,
} from "@/lib/types";

const STEPS = [
  { id: 1, label: "基本情報" },
  { id: 2, label: "販路情報" },
  { id: 3, label: "希望条件" },
  { id: 4, label: "実績・PR" },
  { id: 5, label: "確認" },
] as const;

type PartnerSetupFormProps = {
  email: string;
  userId: string;
};

function toggleInList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function PartnerSetupForm({ email, userId }: PartnerSetupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<
    Omit<PartnerRegistrationInput, "email" | "password">
  >({
    displayName: "",
    entityType: "individual",
    companyName: "",
    contactName: "",
    salesGenres: [],
    salesChannels: [],
    area: "",
    preferredCategories: [],
    preferredDealTypes: [],
    achievements: "",
    selfPr: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(current: number): string | null {
    if (current === 1) {
      if (!form.displayName.trim()) return "表示名を入力してください";
      if (form.entityType === "corporate" && !form.companyName.trim()) {
        return "法人の場合は会社名を入力してください";
      }
      if (!form.contactName.trim()) return "担当者名を入力してください";
    }
    if (current === 2) {
      if (form.salesGenres.length === 0) return "販売ジャンルを選択してください";
      if (form.salesChannels.length === 0) {
        return "販売チャネルを1つ以上選択してください";
      }
      if (!form.area.trim()) return "対応可能エリアを入力してください";
    }
    if (current === 3) {
      if (form.preferredCategories.length === 0) {
        return "希望する商品カテゴリを選択してください";
      }
      if (form.preferredDealTypes.length === 0) {
        return "希望する取引条件を選択してください";
      }
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
    setStep((s) => Math.min(5, s + 1));
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

    setError("");
    setLoading(true);

    // Setup must never call signUp / signIn — only authenticated writes.
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      setLoading(false);
      setError("ログインセッションが無効です。ログインし直してください。");
      router.push("/login?next=/partner/setup");
      return;
    }

    const result = await completePartnerSetupAction(form);
    if (result?.error) {
      setLoading(false);
      setError(result.error);
    }
    // Success: server action redirects to /cases?welcome=partner
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
        onSubmit={step === 5 ? handleSubmit : (e) => e.preventDefault()}
        className="space-y-5 rounded-xl border border-border bg-surface p-5 md:p-6"
      >
        {step === 1 ? (
          <>
            <Input
              label="表示名（必須）"
              name="displayName"
              required
              value={form.displayName}
              onChange={(e) => update("displayName", e.target.value)}
            />
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy">
                個人 / 法人区分 <span className="text-xs text-teal">必須</span>
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    { value: "individual", label: "個人" },
                    { value: "corporate", label: "法人" },
                  ] as const
                ).map((item) => (
                  <label
                    key={item.value}
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-3 text-sm",
                      form.entityType === item.value
                        ? "border-teal bg-teal/10"
                        : "border-border bg-background text-muted",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="entityType"
                      className="accent-teal"
                      checked={form.entityType === item.value}
                      onChange={() =>
                        update("entityType", item.value as PartnerEntityType)
                      }
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </fieldset>
            {form.entityType === "corporate" ? (
              <Input
                label="会社名（必須）"
                name="companyName"
                required
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
              />
            ) : null}
            <Input
              label="担当者名（必須）"
              name="contactName"
              required
              value={form.contactName}
              onChange={(e) => update("contactName", e.target.value)}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy">
                販売ジャンル <span className="text-xs text-teal">必須</span>
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {partnerSalesGenreOptions.map((genre) => (
                  <label
                    key={genre}
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-3 text-sm",
                      form.salesGenres.includes(genre)
                        ? "border-teal bg-teal/10"
                        : "border-border bg-background text-muted",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      className="accent-teal"
                      checked={form.salesGenres.includes(genre)}
                      onChange={() =>
                        update(
                          "salesGenres",
                          toggleInList(form.salesGenres, genre),
                        )
                      }
                    />
                    {genre}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy">
                販売チャネル <span className="text-xs text-teal">必須</span>
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {partnerChannelOptions.map((channel) => (
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
                      onChange={() =>
                        update(
                          "salesChannels",
                          toggleInList(
                            form.salesChannels,
                            channel as MakerSalesChannel,
                          ),
                        )
                      }
                    />
                    {channel}
                  </label>
                ))}
              </div>
            </fieldset>
            <Input
              label="対応可能エリア（必須）"
              name="area"
              required
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy">
                希望する商品カテゴリ{" "}
                <span className="text-xs text-teal">必須</span>
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {partnerSalesGenreOptions.map((genre) => (
                  <label
                    key={genre}
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-3 text-sm",
                      form.preferredCategories.includes(genre)
                        ? "border-teal bg-teal/10"
                        : "border-border bg-background text-muted",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      className="accent-teal"
                      checked={form.preferredCategories.includes(genre)}
                      onChange={() =>
                        update(
                          "preferredCategories",
                          toggleInList(form.preferredCategories, genre),
                        )
                      }
                    />
                    {genre}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy">
                希望する取引条件 <span className="text-xs text-teal">必須</span>
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {partnerDealPreferenceOptions.map((deal) => (
                  <label
                    key={deal}
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-3 text-sm",
                      form.preferredDealTypes.includes(deal)
                        ? "border-teal bg-teal/10"
                        : "border-border bg-background text-muted",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      className="accent-teal"
                      checked={form.preferredDealTypes.includes(deal)}
                      onChange={() =>
                        update(
                          "preferredDealTypes",
                          toggleInList(
                            form.preferredDealTypes,
                            deal as PartnerDealPreference,
                          ),
                        )
                      }
                    />
                    {deal}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <TextArea
              label="販売実績（任意）"
              name="achievements"
              rows={4}
              value={form.achievements}
              onChange={(e) => update("achievements", e.target.value)}
            />
            <TextArea
              label="自己PR（任意）"
              name="selfPr"
              rows={4}
              value={form.selfPr}
              onChange={(e) => update("selfPr", e.target.value)}
            />
          </>
        ) : null}

        {step === 5 ? (
          <dl className="space-y-3 rounded-lg border border-border bg-background p-4 text-sm">
            {[
              ["表示名", form.displayName],
              ["区分", form.entityType === "corporate" ? "法人" : "個人"],
              [
                "会社名",
                form.entityType === "corporate" ? form.companyName : "—",
              ],
              ["担当者", form.contactName],
              ["ジャンル", form.salesGenres.join(" / ")],
              ["チャネル", form.salesChannels.join(" / ")],
              ["エリア", form.area],
              ["希望カテゴリ", form.preferredCategories.join(" / ")],
              ["希望取引", form.preferredDealTypes.join(" / ")],
              ["実績", form.achievements || "—"],
              ["自己PR", form.selfPr || "—"],
            ].map(([label, value]) => (
              <div key={label as string} className="grid gap-1 sm:grid-cols-[7rem_1fr]">
                <dt className="text-muted">{label}</dt>
                <dd className="whitespace-pre-wrap text-navy">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

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
          {step < 5 ? (
            <Button type="button" className="w-full sm:w-auto" onClick={goNext}>
              次へ
            </Button>
          ) : (
            <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
              {loading ? "保存中..." : "プロフィールを保存する"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
