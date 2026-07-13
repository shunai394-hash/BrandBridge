"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import type { PartnerProfileInput } from "@/lib/types";

const initial: PartnerProfileInput = {
  companyName: "",
  contactName: "",
  email: "",
  password: "",
  salesChannel: "",
  area: "",
  strength: "",
};

export function PartnerRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<PartnerProfileInput>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof PartnerProfileInput>(
    key: K,
    value: PartnerProfileInput[K],
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
          role: "partner",
          company_name: form.companyName,
          contact_name: form.contactName,
          sales_channel: form.salesChannel,
          area: form.area,
          strength: form.strength,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/cases");
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
        label="販売チャネル"
        name="salesChannel"
        required
        placeholder="例: 実店舗 / EC / 卸売"
        value={form.salesChannel}
        onChange={(e) => update("salesChannel", e.target.value)}
      />
      <Input
        label="対応エリア"
        name="area"
        required
        value={form.area}
        onChange={(e) => update("area", e.target.value)}
      />
      <TextArea
        label="強み"
        name="strength"
        required
        value={form.strength}
        onChange={(e) => update("strength", e.target.value)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
        {loading ? "登録中..." : "パートナー登録する"}
      </Button>
    </form>
  );
}
