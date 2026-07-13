"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createNegotiationAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import type { SessionUser } from "@/lib/types";

type NegotiationFormProps = {
  caseId: string;
  user: SessionUser | null;
  alreadyApplied: boolean;
};

export function NegotiationForm({
  caseId,
  user,
  alreadyApplied,
}: NegotiationFormProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(alreadyApplied);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await createNegotiationAction({
      caseId,
      message,
    });

    setLoading(false);

    if (result.error === "LOGIN_REQUIRED") {
      window.location.href = `/login?next=/cases/${caseId}`;
      return;
    }

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
  }

  if (!user) {
    return (
      <div className="mt-10 rounded-lg border border-teal/25 bg-cream/70 p-6">
        <p className="text-sm leading-relaxed text-muted">
          交渉を申し込むには、販売パートナーとしてログインしてください。
        </p>
        <div className="mt-4">
          <Button href={`/login?next=/cases/${caseId}`}>ログインして申し込む</Button>
        </div>
      </div>
    );
  }

  if (user.role === "maker") {
    return (
      <div className="mt-10 rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-muted">
          メーカーアカウントでは交渉申込はできません。販売パートナーとして登録・ログインしてください。
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mt-10 rounded-lg border border-teal/30 bg-cream p-6">
        <h3 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          交渉を申し込みました
        </h3>
        <p className="mt-2 text-sm text-muted">
          メーカー側の審査をお待ちください。進捗は交渉管理から確認できます。
        </p>
        <Link
          href="/negotiations"
          className="mt-4 inline-block text-sm text-teal hover:underline"
        >
          交渉管理を開く
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-lg border border-teal/25 bg-cream/70 p-6">
      <h3 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
        交渉を申し込む
      </h3>
      <p className="mt-2 text-sm text-muted">
        一言メッセージを添えて、メーカーへ交渉を申し込めます。
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <TextArea
          label="メッセージ（任意）"
          name="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="取り扱い可能なチャネルや興味のある点など"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "送信中..." : "交渉を申し込む"}
        </Button>
      </form>
    </div>
  );
}
