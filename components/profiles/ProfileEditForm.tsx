"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { updateProfileAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { enProfileCopy } from "@/lib/en-account-ui";
import { toEnglishActionError } from "@/lib/negotiation-ui";
import {
  employeeRanges,
  type Profile,
  type ProfileUpdateInput,
  type UserRole,
} from "@/lib/types";

type ProfileEditFormProps = {
  profile: Profile;
  /** Default Japanese for /profile/edit — English for /en/profile. */
  locale?: "ja" | "en";
};

function toForm(profile: Profile): ProfileUpdateInput {
  return {
    companyName: profile.company_name,
    contactName: profile.contact_name,
    industry: profile.industry ?? "",
    productOverview: profile.product_overview ?? "",
    salesChannel: profile.sales_channel ?? "",
    area: profile.area ?? "",
    strength: profile.strength ?? "",
    description: profile.description ?? "",
    websiteUrl: profile.website_url ?? "",
    headquarters: profile.headquarters ?? "",
    foundedYear: profile.founded_year?.toString() ?? "",
    employeeRange: profile.employee_range ?? "",
    corporateNumber: profile.corporate_number ?? "",
    achievements: profile.achievements ?? "",
    displayName: profile.display_name ?? "",
    entityType: profile.entity_type ?? "",
    salesGenres: profile.sales_genres ?? "",
    preferredCategories: profile.preferred_categories ?? "",
    preferredDealTypes: profile.preferred_deal_types ?? "",
  };
}

const ja = {
  emailLocked: "メールアドレス（変更不可）",
  companyName: "会社名 / 屋号",
  contactName: "担当者名",
  description: "会社紹介",
  websiteUrl: "公式サイト URL",
  headquarters: "本社所在地",
  foundedYear: "設立年",
  foundedYearPlaceholder: "例: 2015",
  employeeRange: "従業員規模",
  unset: "未設定",
  corporateNumber: "法人番号（任意）",
  achievements: "実績",
  achievementsPlaceholder: "取り扱い実績・導入事例などを記載",
  industry: "業種",
  productOverview: "取り扱い商品概要",
  displayName: "表示名",
  entityType: "個人 / 法人",
  individual: "個人",
  corporate: "法人",
  salesGenres: "販売ジャンル",
  salesGenresPlaceholder: "例: 美容 / 食品",
  salesChannel: "販売チャネル",
  salesChannelPlaceholder: "例: Amazon / 実店舗",
  area: "対応エリア",
  preferredCategories: "希望商品カテゴリ",
  preferredDealTypes: "希望取引条件",
  preferredDealTypesPlaceholder: "例: 卸販売 / 代理店",
  strength: "強み",
  save: "保存する",
  saving: "保存中...",
  viewPublic: "公開ページを見る",
  publicNotePrefix: "",
  publicNoteLink: "公開プロフィール",
  publicNoteSuffix: "ではメールアドレスは表示されません。",
} as const;

export function ProfileEditForm({
  profile,
  locale = "ja",
}: ProfileEditFormProps) {
  const [form, setForm] = useState<ProfileUpdateInput>(() => toForm(profile));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const role: UserRole = profile.role;
  const t = locale === "en" ? enProfileCopy : ja;

  function update<K extends keyof ProfileUpdateInput>(
    key: K,
    value: ProfileUpdateInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await updateProfileAction(form);
    setLoading(false);
    if (result?.error) {
      setError(
        locale === "en" ? toEnglishActionError(result.error) : result.error,
      );
    }
  }

  const selectClass =
    "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-up space-y-5"
      lang={locale === "en" ? "en" : undefined}
    >
      <p className="text-sm text-muted">
        {t.emailLocked}: {profile.email}
      </p>

      <Input
        label={t.companyName}
        name="companyName"
        required
        value={form.companyName}
        onChange={(e) => update("companyName", e.target.value)}
      />
      <Input
        label={t.contactName}
        name="contactName"
        required
        value={form.contactName}
        onChange={(e) => update("contactName", e.target.value)}
      />
      <TextArea
        label={t.description}
        name="description"
        rows={4}
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
      />
      <Input
        label={t.websiteUrl}
        name="websiteUrl"
        type="url"
        placeholder="https://"
        value={form.websiteUrl}
        onChange={(e) => update("websiteUrl", e.target.value)}
      />
      <Input
        label={t.headquarters}
        name="headquarters"
        value={form.headquarters}
        onChange={(e) => update("headquarters", e.target.value)}
      />
      <Input
        label={t.foundedYear}
        name="foundedYear"
        inputMode="numeric"
        placeholder={t.foundedYearPlaceholder}
        value={form.foundedYear}
        onChange={(e) => update("foundedYear", e.target.value)}
      />
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-navy">{t.employeeRange}</span>
        <select
          className={selectClass}
          value={form.employeeRange}
          onChange={(e) => update("employeeRange", e.target.value)}
        >
          <option value="">{t.unset}</option>
          {employeeRanges.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </label>
      <Input
        label={t.corporateNumber}
        name="corporateNumber"
        value={form.corporateNumber}
        onChange={(e) => update("corporateNumber", e.target.value)}
      />
      <TextArea
        label={t.achievements}
        name="achievements"
        rows={4}
        placeholder={t.achievementsPlaceholder}
        value={form.achievements}
        onChange={(e) => update("achievements", e.target.value)}
      />

      {role === "maker" ? (
        <>
          <Input
            label={t.industry}
            name="industry"
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
          />
          <TextArea
            label={t.productOverview}
            name="productOverview"
            value={form.productOverview}
            onChange={(e) => update("productOverview", e.target.value)}
          />
        </>
      ) : (
        <>
          <Input
            label={t.displayName}
            name="displayName"
            value={form.displayName}
            onChange={(e) => update("displayName", e.target.value)}
          />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-navy">{t.entityType}</span>
            <select
              className={selectClass}
              value={form.entityType}
              onChange={(e) =>
                update(
                  "entityType",
                  e.target.value as ProfileUpdateInput["entityType"],
                )
              }
            >
              <option value="">{t.unset}</option>
              <option value="individual">{t.individual}</option>
              <option value="corporate">{t.corporate}</option>
            </select>
          </label>
          <Input
            label={t.salesGenres}
            name="salesGenres"
            placeholder={t.salesGenresPlaceholder}
            value={form.salesGenres}
            onChange={(e) => update("salesGenres", e.target.value)}
          />
          <Input
            label={t.salesChannel}
            name="salesChannel"
            placeholder={t.salesChannelPlaceholder}
            value={form.salesChannel}
            onChange={(e) => update("salesChannel", e.target.value)}
          />
          <Input
            label={t.area}
            name="area"
            value={form.area}
            onChange={(e) => update("area", e.target.value)}
          />
          <Input
            label={t.preferredCategories}
            name="preferredCategories"
            value={form.preferredCategories}
            onChange={(e) => update("preferredCategories", e.target.value)}
          />
          <Input
            label={t.preferredDealTypes}
            name="preferredDealTypes"
            placeholder={t.preferredDealTypesPlaceholder}
            value={form.preferredDealTypes}
            onChange={(e) => update("preferredDealTypes", e.target.value)}
          />
          <TextArea
            label={t.strength}
            name="strength"
            value={form.strength}
            onChange={(e) => update("strength", e.target.value)}
          />
        </>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? t.saving : t.save}
        </Button>
        <Button href={`/profiles/${profile.id}`} variant="outline">
          {t.viewPublic}
        </Button>
      </div>
      {locale === "en" ? (
        <p className="text-xs text-muted">{enProfileCopy.publicNote}</p>
      ) : (
        <p className="text-xs text-muted">
          <Link
            href={`/profiles/${profile.id}`}
            className="text-teal hover:underline"
          >
            {ja.publicNoteLink}
          </Link>
          {ja.publicNoteSuffix}
        </p>
      )}
    </form>
  );
}
