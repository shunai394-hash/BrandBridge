"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendOutboundEmailAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";

export function AdminOutboundMailComposeForm() {
  const router = useRouter();
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState(
    "【BrandBridge】提携・掲載のご案内",
  );
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const result = await sendOutboundEmailAction({
      toEmail,
      subject,
      body,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      if (result.id) {
        router.push(`/admin/mail/${result.id}`);
        router.refresh();
      }
      return;
    }
    setSuccess("営業メールを送信しました。");
    setToEmail("");
    setBody("");
    if (result.id) {
      router.push(`/admin/mail/${result.id}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
        新規メール作成
      </h2>
      <p className="text-sm text-muted">
        未登録企業への掲載案内・提携依頼を送信します。
      </p>
      <Input
        label="宛先メールアドレス"
        name="toEmail"
        type="email"
        value={toEmail}
        onChange={(e) => setToEmail(e.target.value)}
        required
        placeholder="partner@example.com"
      />
      <Input
        label="件名"
        name="subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        maxLength={200}
      />
      <TextArea
        label="本文"
        name="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={12}
        placeholder="提携依頼・営業のご案内文を入力してください"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-teal">{success}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "送信中..." : "送信する"}
      </Button>
    </form>
  );
}
