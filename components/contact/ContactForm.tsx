"use client";

import { FormEvent, useState } from "react";
import { submitContactAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import {
  contactCategoryOptions,
  type ContactCategory,
} from "@/lib/contact-types";

type ContactFormProps = {
  initialCategory?: ContactCategory;
};

export function ContactForm({
  initialCategory = "general",
}: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [category, setCategory] = useState<ContactCategory>(initialCategory);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await submitContactAction({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      companyName: String(form.get("companyName") ?? ""),
      category,
      message: String(form.get("message") ?? ""),
    });

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
    e.currentTarget.reset();
    setCategory(initialCategory);
  }

  if (done) {
    return (
      <div className="rounded-lg border border-teal/25 bg-cream/70 px-5 py-8">
        <p className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          送信が完了しました
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          お問い合わせありがとうございます。通常1〜2営業日以内にご返信します。掲載相談は優先的に確認します。
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setDone(false)}
        >
          別のお問い合わせを送る
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="お名前" name="name" required maxLength={100} autoComplete="name" />
      <Input
        label="メールアドレス"
        name="email"
        type="email"
        required
        maxLength={200}
        autoComplete="email"
      />
      <Input
        label="会社名（任意）"
        name="companyName"
        maxLength={200}
        autoComplete="organization"
      />
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-navy">お問い合わせ種別</span>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ContactCategory)}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
        >
          {contactCategoryOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <TextArea
        label="お問い合わせ内容"
        name="message"
        required
        rows={6}
        maxLength={5000}
        placeholder={
          initialCategory === "maker"
            ? "掲載したい商材・希望販路・ご質問などをご記入ください。ベータ参加希望の場合はその旨も記載してください。"
            : "できるだけ具体的にご記入ください（10文字以上）"
        }
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "送信中..." : "送信する"}
      </Button>
    </form>
  );
}
