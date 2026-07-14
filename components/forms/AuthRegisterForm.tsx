"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { GoogleAuthButton } from "@/components/forms/GoogleAuthButton";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site";
import { resolveRoleDestination, setupPathForRole } from "@/lib/auth-flow";

type AuthRegisterFormProps = {
  role: "maker" | "partner";
  setupPath: string;
  titleDone?: string;
};

export function AuthRegisterForm({
  role,
  setupPath,
  titleDone = "確認メールを送信しました",
}: AuthRegisterFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Already authenticated → setup / home (never re-prompt email verify).
  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      router.replace(
        resolveRoleDestination({
          role: profile?.role ?? role,
          onboardingCompleted: profile?.onboarding_completed === true,
          requestedNext: setupPath,
        }),
      );
    })();
  }, [router, role, setupPath]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("パスワードは8文字以上にしてください");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user: existing },
    } = await supabase.auth.getUser();
    if (existing) {
      setLoading(false);
      router.replace(setupPath);
      return;
    }

    const siteUrl =
      typeof window !== "undefined" ? window.location.origin : getSiteUrl();

    // signUp is only allowed here (account creation). Setup pages must not call it.
    // No profile/product data is saved until email verify + setup.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(setupPath)}&intent_role=${role}`,
        data: {
          role,
          company_name: "",
          contact_name: "",
          onboarding_completed: false,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(`Auth error: ${signUpError.message}`);
      return;
    }

    // Email confirm must be required. If a session appears without confirm, sign out.
    if (data.session && !data.user?.email_confirmed_at) {
      await supabase.auth.signOut();
      setLoading(false);
      setSubmitted(true);
      return;
    }

    if (data.session && data.user?.email_confirmed_at) {
      setLoading(false);
      router.push(setupPathForRole(role));
      router.refresh();
      return;
    }

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="animate-fade-up rounded-lg border border-teal/30 bg-cream p-8 text-center">
        <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy">
          {titleDone}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          メール内のリンクで認証を完了してください。認証後、プロフィール入力画面へ進みます。会社情報・商品情報は認証後に保存されます。
        </p>
        <ol className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-navy">
          <li>1. メール認証</li>
          <li>2. プロフィール / 商品情報の入力</li>
          <li>3. マッチング開始</li>
        </ol>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/login" className="w-full sm:w-auto">
            ログインへ
          </Button>
          <Button href="/" variant="outline" className="w-full sm:w-auto">
            トップへ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-5">
      <p className="text-sm text-muted">
        まずはアカウントを作成します。詳細情報はメール認証（またはGoogleログイン）後に入力します。
      </p>
      <GoogleAuthButton
        intentRole={role}
        nextPath={setupPath}
        label="Googleで登録"
      />
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-navy/15" />
        またはメール
        <span className="h-px flex-1 bg-navy/15" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="メールアドレス（必須）"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label="パスワード（必須・8文字以上）"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
          {loading ? "送信中..." : "確認メールを送る"}
        </Button>
      </form>
    </div>
  );
}
