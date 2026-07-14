"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const siteUrl =
        typeof window !== "undefined" ? window.location.origin : getSiteUrl();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/login/update-password")}`,
        },
      );

      if (resetError) {
        setError(`Auth error: ${resetError.message}`);
        return;
      }

      setSent(true);
    } catch (err) {
      setError(
        `予期しないエラー: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="animate-fade-up rounded-lg border border-teal/30 bg-cream p-8 text-center">
        <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy">
          リセットメールを送信しました
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          メール内のリンクから新しいパスワードを設定してください。リンクの有効期限が切れている場合は、もう一度お試しください。
        </p>
        <div className="mt-6">
          <Button href="/login" className="w-full sm:w-auto">
            ログインへ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up space-y-5">
      <p className="text-sm text-muted">
        登録済みのメールアドレスを入力してください。パスワード再設定用のリンクを送信します。
      </p>
      <Input
        label="メールアドレス"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "送信中..." : "リセットメールを送る"}
      </Button>
      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-teal hover:underline">
          ログインに戻る
        </Link>
      </p>
    </form>
  );
}
