"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendCompanyEmailAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";

type AdminCompanyEmailFormProps = {
  companyId: string;
  recipientEmail: string;
  companyName: string;
};

export function AdminCompanyEmailForm({
  companyId,
  recipientEmail,
  companyName,
}: AdminCompanyEmailFormProps) {
  const router = useRouter();
  const [subject, setSubject] = useState(
    `【BrandBridge】${companyName}様へのご案内`,
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
    const result = await sendCompanyEmailAction({
      companyId,
      subject,
      body,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess("営業メールを送信しました。");
    setBody("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 space-y-4 rounded-lg border border-border bg-surface p-5 md:p-6"
    >
      <div>
        <p className="text-sm font-medium text-navy">宛先</p>
        <p className="mt-1 text-sm text-muted">{recipientEmail}</p>
      </div>
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
        placeholder="提携のご案内・営業文面を入力してください"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-teal">{success}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "送信中..." : "送信する"}
      </Button>
    </form>
  );
}
