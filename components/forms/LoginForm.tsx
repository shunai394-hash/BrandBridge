"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { GoogleAuthButton } from "@/components/forms/GoogleAuthButton";
import { createClient } from "@/lib/supabase/client";
import {
  isSafeAppPath,
  resolveRoleDestination,
} from "@/lib/auth-flow";

type LoginFormProps = {
  nextPath?: string;
  initialError?: string;
  initialKind?: "login" | "permission" | "";
  /** Default Japanese (/login). English UI for /en/login only. */
  locale?: "ja" | "en";
};

function authEnvOk(en: boolean): { ok: true } | { ok: false; message: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) {
    return {
      ok: false,
      message: en
        ? "Supabase URL / anon key is not configured."
        : "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です",
    };
  }
  if (url.includes("placeholder") || key.includes("placeholder")) {
    return {
      ok: false,
      message: en
        ? "Supabase is still using placeholder credentials. Set the production URL and anon key."
        : "Supabase が placeholder 設定のままです。本番の URL / anon key を設定してください",
    };
  }
  return { ok: true };
}

export function LoginForm({
  nextPath,
  initialError,
  initialKind,
  locale = "ja",
}: LoginFormProps) {
  const en = locale === "en";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    initialKind !== "permission" ? (initialError ?? "") : "",
  );
  const [info, setInfo] = useState(
    initialKind === "permission" ? (initialError ?? "") : "",
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("[LOGIN] submit");

    setError("");
    setInfo("");
    setLoading(true);

    try {
      const env = authEnvOk(en);
      if (!env.ok) {
        console.log("[LOGIN] error message=" + env.message + " status=env");
        setError(env.message);
        return;
      }

      const supabase = createClient();
      const wantsAdmin = isSafeAppPath(nextPath) && nextPath.startsWith("/admin");

      console.log("[LOGIN] auth start");
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        const message = signInError.message || "unknown error";
        const status = String(signInError.status ?? "");
        console.log(`[LOGIN] error message=${message} status=${status}`);
        setError(
          `Auth error: ${message}${status ? ` (status=${status})` : ""}`,
        );
        return;
      }

      if (!signInData.user) {
        console.log("[LOGIN] error message=no user returned status=");
        setError(
          en
            ? "Auth error: no user returned"
            : "Auth error: user が返ってきませんでした",
        );
        return;
      }

      // Email confirmation required for password login
      if (!signInData.user.email_confirmed_at) {
        await supabase.auth.signOut();
        setError(
          en
            ? "Email not confirmed yet. Open the link in your confirmation email, then sign in."
            : "メール認証が完了していません。確認メールのリンクを開いてからログインしてください。",
        );
        return;
      }

      console.log(`[LOGIN] success user.id=${signInData.user.id}`);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        const message = sessionError?.message ?? "session is null";
        console.log(`[LOGIN] error message=${message} status=session`);
        setError(
          `Auth error (session): ${message} / user.id=${signInData.user.id}`,
        );
        return;
      }

      const authUserId = session.user.id;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, onboarding_completed, is_active, email")
        .eq("id", authUserId)
        .maybeSingle();

      if (profileError) {
        console.log(
          `[LOGIN] error message=${profileError.message} status=profiles`,
        );
        setError(
          `profiles error: ${profileError.message} / user.id=${authUserId}`,
        );
        return;
      }

      if (!profile) {
        console.log(
          `[LOGIN] error message=no profile status=profiles user.id=${authUserId}`,
        );
        setError(
          en
            ? `profiles error: no profile row for user.id=${authUserId}`
            : `profiles error: user.id=${authUserId} に対応する profiles 行がありません`,
        );
        return;
      }

      if (profile.is_active === false) {
        console.log(
          `[LOGIN] error message=inactive status=permission user.id=${authUserId}`,
        );
        setError(
          en
            ? `role error: account suspended (is_active=false) / user.id=${authUserId} / role=${profile.role}`
            : `role error: アカウント停止中 (is_active=false) / user.id=${authUserId} / role=${profile.role}`,
        );
        return;
      }

      const role = String(profile.role);
      console.log(`[LOGIN] profile ok user.id=${authUserId} role=${role}`);

      if (wantsAdmin && role !== "admin") {
        console.log(
          `[LOGIN] error message=role insufficient status=permission role=${role}`,
        );
        setInfo(
          en
            ? [
                "Auth login succeeded.",
                `user.id=${authUserId}`,
                `profiles.role=${role}`,
                "Required role=admin",
                `update public.profiles set role='admin', is_active=true where id='${authUserId}';`,
              ].join("\n")
            : [
                "Auth login は成功しています。",
                `user.id=${authUserId}`,
                `profiles.role=${role}`,
                "必要な role=admin",
                `update public.profiles set role='admin', is_active=true where id='${authUserId}';`,
              ].join("\n"),
        );
        setError(
          en
            ? `role error: current role=${role} (not an Auth error)`
            : `role error: 現在の role=${role}（Auth error ではありません）`,
        );
        return;
      }

      const destination = resolveRoleDestination({
        role,
        onboardingCompleted: profile.onboarding_completed === true,
        requestedNext: wantsAdmin ? nextPath : nextPath,
        registrationLocale:
          (session.user.user_metadata?.registration_locale as
            | string
            | undefined) ?? null,
        registrationSource:
          (session.user.user_metadata?.registration_source as
            | string
            | undefined) ?? null,
      });

      console.log(`[LOGIN] redirect -> ${destination}`);
      window.location.assign(destination);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`[LOGIN] error message=${message} status=exception`);
      setError(
        en ? `Unexpected error: ${message}` : `予期しないエラー: ${message}`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up space-y-5" lang={en ? "en" : undefined}>
      {isSafeAppPath(nextPath) && nextPath.startsWith("/admin") ? (
        <p className="rounded-md border border-teal/30 bg-cream px-3 py-2 text-xs text-muted">
          {en
            ? "Admin login. Errors are shown in red."
            : "管理画面ログインです。失敗理由は必ず赤文字で表示されます。"}
        </p>
      ) : null}

      <GoogleAuthButton
        nextPath={
          isSafeAppPath(nextPath)
            ? nextPath
            : en
              ? "/en/cases"
              : "/cases"
        }
        label={en ? "Continue with Google" : "Googleでログイン"}
        locale={en ? "en" : "ja"}
      />

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-navy/15" />
        {en ? "or email" : "またはメール"}
        <span className="h-px flex-1 bg-navy/15" />
      </div>

      <form
        onSubmit={handleSubmit}
        method="post"
        action="#"
        className="space-y-5"
      >
        <Input
          label={en ? "Email" : "メールアドレス"}
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label={en ? "Password" : "パスワード"}
          name="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-right text-sm">
          {en ? (
            <Link href="/en/contact" className="text-teal hover:underline">
              Need help signing in? Contact us
            </Link>
          ) : (
            <Link href="/login/forgot" className="text-teal hover:underline">
              パスワードをお忘れの方
            </Link>
          )}
        </p>
        {loading ? (
          <p className="text-sm text-muted">
            {en ? "Signing in…" : "ログイン処理中…（コンソールに [LOGIN] ログ）"}
          </p>
        ) : null}
        {error ? (
          <p
            className="whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {info ? (
          <p
            className="whitespace-pre-wrap rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
            role="status"
          >
            {info}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? en
              ? "Signing in..."
              : "ログイン中..."
            : en
              ? "Login"
              : "ログイン"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        {en ? (
          <>
            New here?{" "}
            <Link
              href="/en/register/maker"
              className="text-teal hover:underline"
            >
              Register your product
            </Link>
          </>
        ) : (
          <>
            アカウントをお持ちでない方は{" "}
            <Link href="/register/maker" className="text-teal hover:underline">
              商品提供企業として登録
            </Link>
            {" / "}
            <Link href="/register/partner" className="text-teal hover:underline">
              パートナー登録
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
