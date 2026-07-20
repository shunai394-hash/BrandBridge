"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { replyContactInquiryAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";

type AdminInquiryReplyFormProps = {
  inquiryId: string;
  defaultSubject: string;
};

export function AdminInquiryReplyForm({
  inquiryId,
  defaultSubject,
}: AdminInquiryReplyFormProps) {
  const router = useRouter();
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const result = await replyContactInquiryAction({
      inquiryId,
      subject,
      body,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess("返信を送信しました。");
    setBody("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 space-y-4 rounded-lg border border-border bg-surface p-5 md:p-6"
    >
      <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
        返信する
      </h2>
      <p className="text-sm text-muted">
        問い合わせ者のメールアドレスへ Resend で送信し、履歴に保存します。
      </p>
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
        rows={8}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-teal">{success}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "送信中..." : "返信を送信"}
      </Button>
    </form>
  );
}
