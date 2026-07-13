"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { updateProfileAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import {
  employeeRanges,
  type Profile,
  type ProfileUpdateInput,
  type UserRole,
} from "@/lib/types";

type ProfileEditFormProps = {
  profile: Profile;
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

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [form, setForm] = useState<ProfileUpdateInput>(() => toForm(profile));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const role: UserRole = profile.role;

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
      setError(result.error);
    }
  }

  const selectClass =
    "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up space-y-5">
      <p className="text-sm text-muted">
        メールアドレス（変更不可）: {profile.email}
      </p>

      <Input
        label="会社名 / 屋号"
        name="companyName"
        required
        value={form.companyName}
        onChange={(e) => update("companyName", e.target.value)}
      />
      <Input
        label="担当者名"
        name="contactName"
        required
        value={form.contactName}
        onChange={(e) => update("contactName", e.target.value)}
      />
      <TextArea
        label="会社紹介"
        name="description"
        rows={4}
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
      />
      <Input
        label="公式サイト URL"
        name="websiteUrl"
        type="url"
        placeholder="https://"
        value={form.websiteUrl}
        onChange={(e) => update("websiteUrl", e.target.value)}
      />
      <Input
        label="本社所在地"
        name="headquarters"
        value={form.headquarters}
        onChange={(e) => update("headquarters", e.target.value)}
      />
      <Input
        label="設立年"
        name="foundedYear"
        inputMode="numeric"
        placeholder="例: 2015"
        value={form.foundedYear}
        onChange={(e) => update("foundedYear", e.target.value)}
      />
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-navy">従業員規模</span>
        <select
          className={selectClass}
          value={form.employeeRange}
          onChange={(e) => update("employeeRange", e.target.value)}
        >
          <option value="">未設定</option>
          {employeeRanges.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </label>
      <Input
        label="法人番号（任意）"
        name="corporateNumber"
        value={form.corporateNumber}
        onChange={(e) => update("corporateNumber", e.target.value)}
      />
      <TextArea
        label="実績"
        name="achievements"
        rows={4}
        placeholder="取り扱い実績・導入事例などを記載"
        value={form.achievements}
        onChange={(e) => update("achievements", e.target.value)}
      />

      {role === "maker" ? (
        <>
          <Input
            label="業種"
            name="industry"
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
          />
          <TextArea
            label="取り扱い商品概要"
            name="productOverview"
            value={form.productOverview}
            onChange={(e) => update("productOverview", e.target.value)}
          />
        </>
      ) : (
        <>
          <Input
            label="表示名"
            name="displayName"
            value={form.displayName}
            onChange={(e) => update("displayName", e.target.value)}
          />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-navy">個人 / 法人</span>
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
              <option value="">未設定</option>
              <option value="individual">個人</option>
              <option value="corporate">法人</option>
            </select>
          </label>
          <Input
            label="販売ジャンル"
            name="salesGenres"
            placeholder="例: 美容 / 食品"
            value={form.salesGenres}
            onChange={(e) => update("salesGenres", e.target.value)}
          />
          <Input
            label="販売チャネル"
            name="salesChannel"
            placeholder="例: Amazon / 実店舗"
            value={form.salesChannel}
            onChange={(e) => update("salesChannel", e.target.value)}
          />
          <Input
            label="対応エリア"
            name="area"
            value={form.area}
            onChange={(e) => update("area", e.target.value)}
          />
          <Input
            label="希望商品カテゴリ"
            name="preferredCategories"
            value={form.preferredCategories}
            onChange={(e) => update("preferredCategories", e.target.value)}
          />
          <Input
            label="希望取引条件"
            name="preferredDealTypes"
            placeholder="例: 卸販売 / 代理店"
            value={form.preferredDealTypes}
            onChange={(e) => update("preferredDealTypes", e.target.value)}
          />
          <TextArea
            label="強み"
            name="strength"
            value={form.strength}
            onChange={(e) => update("strength", e.target.value)}
          />
        </>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : "保存する"}
        </Button>
        <Button href={`/profiles/${profile.id}`} variant="outline">
          公開ページを見る
        </Button>
      </div>
      <p className="text-xs text-muted">
        <Link href={`/profiles/${profile.id}`} className="text-teal hover:underline">
          公開プロフィール
        </Link>
        ではメールアドレスは表示されません。
      </p>
    </form>
  );
}
