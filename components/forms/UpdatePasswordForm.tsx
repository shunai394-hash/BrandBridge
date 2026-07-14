"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { resolveRoleDestination } from "@/lib/auth-flow";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login/forgot?error=session");
        return;
      }
      setReady(true);
    });
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("パスワードは8文字以上にしてください");
      return;
    }
    if (password !== confirm) {
      setError("パスワードが一致しません");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(`Auth error: ${updateError.message}`);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      const destination = resolveRoleDestination({
        role: profile?.role,
        onboardingCompleted: profile?.onboarding_completed === true,
      });

      window.location.assign(destination);
    } catch (err) {
      setError(
        `予期しないエラー: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <p className="animate-fade-up text-center text-sm text-muted">
        セッションを確認しています…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up space-y-5">
      <p className="text-sm text-muted">新しいパスワードを設定してください。</p>
      <PasswordInput
        label="新しいパスワード（8文字以上）"
        name="password"
        required
        minLength={8}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordInput
        label="新しいパスワード（確認）"
        name="confirm"
        required
        minLength={8}
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "更新中..." : "パスワードを更新"}
      </Button>
      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-teal hover:underline">
          ログインに戻る
        </Link>
      </p>
    </form>
  );
}
