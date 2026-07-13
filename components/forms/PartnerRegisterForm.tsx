"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site";
import {
  PARTNER_DRAFT_STORAGE_KEY,
  partnerProfilePayloadFromDraft,
  toPartnerDraftMeta,
} from "@/lib/partner-registration";
import {
  partnerChannelOptions,
  partnerDealPreferenceOptions,
  partnerSalesGenreOptions,
  type MakerSalesChannel,
  type PartnerDealPreference,
  type PartnerEntityType,
  type PartnerRegistrationInput,
  type PartnerSalesGenre,
} from "@/lib/types";

const STEPS = [
  { id: 1, label: "アカウント" },
  { id: 2, label: "販路情報" },
  { id: 3, label: "希望条件" },
  { id: 4, label: "実績・PR" },
  { id: 5, label: "確認" },
] as const;

const selectClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

const initial: PartnerRegistrationInput = {
  displayName: "",
  entityType: "individual",
  companyName: "",
  contactName: "",
  email: "",
  password: "",
  salesGenres: [],
  salesChannels: [],
  area: "",
  preferredCategories: [],
  preferredDealTypes: [],
  achievements: "",
  selfPr: "",
};

function FieldHint({ required }: { required?: boolean }) {
  return required ? (
    <span className="ml-1 text-xs text-teal">必須</span>
  ) : (
    <span className="ml-1 text-xs text-muted">任意</span>
  );
}

function toggleInList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function PartnerRegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PartnerRegistrationInput>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PARTNER_DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PartnerRegistrationInput> & {
        step?: number;
      };
      setForm((prev) => ({
        ...prev,
        ...parsed,
        password: "",
        salesGenres: parsed.salesGenres ?? [],
        salesChannels: parsed.salesChannels ?? [],
        preferredCategories: parsed.preferredCategories ?? [],
        preferredDealTypes: parsed.preferredDealTypes ?? [],
      }));
      if (parsed.step && parsed.step >= 1 && parsed.step <= 5) {
        setStep(parsed.step);
      }
      setSavedAt("下書きを復元しました");
    } catch {
      // ignore
    }
  }, []);

  function update<K extends keyof PartnerRegistrationInput>(
    key: K,
    value: PartnerRegistrationInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function saveDraft(showMessage = true) {
    try {
      const { password: _pw, ...rest } = form;
      localStorage.setItem(
        PARTNER_DRAFT_STORAGE_KEY,
        JSON.stringify({ ...rest, step }),
      );
      if (showMessage) {
        setSavedAt(`下書き保存: ${new Date().toLocaleTimeString("ja-JP")}`);
      }
    } catch {
      setError("下書きの保存に失敗しました");
    }
  }

  function validateStep(current: number): string | null {
    if (current === 1) {
      if (!form.displayName.trim()) return "表示名を入力してください";
      if (!form.entityType) return "個人 / 法人を選択してください";
      if (form.entityType === "corporate" && !form.companyName.trim()) {
        return "法人の場合は会社名を入力してください";
      }
      if (!form.contactName.trim()) return "担当者名を入力してください";
      if (!form.email.trim()) return "メールアドレスを入力してください";
      if (form.password.length < 8) return "パスワードは8文字以上にしてください";
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
    saveDraft(false);
    setStep((s) => Math.min(5, s + 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
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
    const supabase = createClient();
    const siteUrl =
      typeof window !== "undefined" ? window.location.origin : getSiteUrl();
    const draft = toPartnerDraftMeta(form);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/cases?welcome=partner`,
        data: {
          role: "partner",
          company_name:
            form.entityType === "corporate"
              ? form.companyName.trim()
              : form.displayName.trim(),
          contact_name: form.contactName.trim(),
          display_name: form.displayName.trim(),
          entity_type: form.entityType,
          sales_channel: form.salesChannels.join(" / "),
          sales_genres: form.salesGenres.join(" / "),
          area: form.area.trim(),
          preferred_categories: form.preferredCategories.join(" / "),
          preferred_deal_types: form.preferredDealTypes.join(" / "),
          achievements: form.achievements.trim(),
          description: form.selfPr.trim(),
          strength: `得意ジャンル: ${form.salesGenres.join(" / ")}`,
          onboarding_completed: true,
          partner_draft: draft,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    if (data.session && data.user) {
      const payload = partnerProfilePayloadFromDraft(draft);
      await supabase.from("profiles").update(payload).eq("id", data.user.id);
      await supabase.auth.updateUser({
        data: { partner_draft: null, partner_draft_flushed: true },
      });
      localStorage.removeItem(PARTNER_DRAFT_STORAGE_KEY);
      setLoading(false);
      router.push("/cases?welcome=partner");
      router.refresh();
      return;
    }

    localStorage.removeItem(PARTNER_DRAFT_STORAGE_KEY);
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
          メール内のリンクで認証を完了してください。認証後、プロフィールが保存され、案件一覧から商品を探せます。
        </p>
        <ol className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-navy">
          <li>1. メール認証</li>
          <li>2. プロフィール反映</li>
          <li>3. 案件一覧を見る</li>
          <li>4. 興味ある商品へ応募</li>
        </ol>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/login" className="w-full sm:w-auto">
            ログインへ
          </Button>
          <Button href="/cases" variant="outline" className="w-full sm:w-auto">
            案件一覧を見る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
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
              placeholder="例: 山田商店 / Y.Suzuki"
            />
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy">
                個人 / 法人区分
                <FieldHint required />
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
                        ? "border-teal bg-teal/10 text-navy"
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
            <Input
              label="メールアドレス（必須）"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <Input
              label="パスワード（必須・8文字以上）"
              name="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy">
                販売ジャンル
                <FieldHint required />
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
                販売チャネル
                <FieldHint required />
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
              placeholder="例: 関東 / 全国 / オンライン中心"
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy">
                希望する商品カテゴリ
                <FieldHint required />
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
                希望する取引条件
                <FieldHint required />
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
              placeholder="取り扱いブランド、月商規模、販路の強みなど"
            />
            <TextArea
              label="自己PR（任意）"
              name="selfPr"
              rows={4}
              value={form.selfPr}
              onChange={(e) => update("selfPr", e.target.value)}
              placeholder="メーカーに伝えたい強みや方針"
            />
          </>
        ) : null}

        {step === 5 ? (
          <div className="space-y-4 text-sm">
            <p className="text-muted">
              内容を確認し、問題なければ登録を完了してください。プロフィールはマッチング表示に利用されます。
            </p>
            <dl className="space-y-3 rounded-lg border border-border bg-background p-4">
              {[
                ["表示名", form.displayName],
                [
                  "区分",
                  form.entityType === "corporate" ? "法人" : "個人",
                ],
                [
                  "会社名",
                  form.entityType === "corporate"
                    ? form.companyName
                    : "—（個人）",
                ],
                ["担当者名", form.contactName],
                ["メール", form.email],
                ["販売ジャンル", form.salesGenres.join(" / ")],
                ["販売チャネル", form.salesChannels.join(" / ")],
                ["対応可能エリア", form.area],
                ["希望カテゴリ", form.preferredCategories.join(" / ")],
                ["希望取引条件", form.preferredDealTypes.join(" / ")],
                ["販売実績", form.achievements || "—"],
                ["自己PR", form.selfPr || "—"],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="grid gap-1 sm:grid-cols-[8rem_1fr]"
                >
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
            <Button type="button" className="w-full sm:w-auto" onClick={goNext}>
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
