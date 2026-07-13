"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import type { MakerProfileInput } from "@/lib/types";

const initial: MakerProfileInput = {
  companyName: "",
  contactName: "",
  email: "",
  password: "",
  industry: "",
  productOverview: "",
};

export function MakerRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<MakerProfileInput>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof MakerProfileInput>(
    key: K,
    value: MakerProfileInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role: "maker",
          company_name: form.companyName,
          contact_name: form.contactName,
          industry: form.industry,
          product_overview: form.productOverview,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/maker/cases/new");
      router.refresh();
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="animate-fade-up rounded-lg border border-teal/30 bg-cream p-8 text-center">
        <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy">
          確認メールを送信しました
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          メール内のリンクで認証後、ログインしてください。メール確認を無効にしている場合はすぐにログインできます。
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/login">ログインへ</Button>
          <Button href="/cases" variant="outline">
            案件を見る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up space-y-5">
      <Input
        label="会社名"
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
      <Input
        label="メールアドレス"
        name="email"
        type="email"
        required
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
      />
      <Input
        label="パスワード"
        name="password"
        type="password"
        required
        minLength={8}
        value={form.password}
        onChange={(e) => update("password", e.target.value)}
      />
      <Input
        label="業種"
        name="industry"
        required
        value={form.industry}
        onChange={(e) => update("industry", e.target.value)}
      />
      <TextArea
        label="取り扱い商品概要"
        name="productOverview"
        required
        value={form.productOverview}
        onChange={(e) => update("productOverview", e.target.value)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
        {loading ? "登録中..." : "メーカー登録する"}
      </Button>
    </form>
  );
}
