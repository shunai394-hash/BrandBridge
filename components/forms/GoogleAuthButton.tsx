"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSafeAppPath } from "@/lib/auth-flow";

type GoogleAuthButtonProps = {
  /** Post-auth path (setup / cases / etc.) */
  nextPath?: string;
  /** Register flow: set profile role after OAuth */
  intentRole?: "maker" | "partner";
  label?: string;
  className?: string;
};

function mapGoogleOAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("provider is not enabled") ||
    lower.includes("unsupported provider") ||
    lower.includes("validation_failed")
  ) {
    return "Googleログインが有効になっていません。Supabase の Authentication → Providers → Google を有効にし、Client ID / Secret を設定してください。";
  }
  if (lower.includes("redirect") && lower.includes("uri")) {
    return "リダイレクトURLが許可されていません。Supabase の Redirect URLs にサイトの /auth/callback を追加してください。";
  }
  if (lower.includes("popup") || lower.includes("blocked")) {
    return "ポップアップがブロックされました。ブラウザの設定を確認してから再度お試しください。";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "ネットワークエラーが発生しました。接続を確認して再度お試しください。";
  }
  return `Googleログインに失敗しました: ${message}`;
}

export function GoogleAuthButton({
  nextPath,
  intentRole,
  label = "Googleで続ける",
  className = "",
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setError("");
    setLoading(true);

    const origin = window.location.origin;
    const callback = new URL("/auth/callback", origin);
    if (isSafeAppPath(nextPath)) {
      callback.searchParams.set("next", nextPath);
    }
    if (intentRole === "maker" || intentRole === "partner") {
      callback.searchParams.set("intent_role", intentRole);
    }

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callback.toString(),
          // Do not force prompt=select_account: BrandBridge session cookies
          // keep the user signed in; Google UI only appears when needed.
        },
      });

      if (oauthError) {
        setError(mapGoogleOAuthError(oauthError.message));
        setLoading(false);
      }
      // On success the browser navigates away to Google
    } catch (err) {
      const message = err instanceof Error ? err.message : "不明なエラー";
      setError(mapGoogleOAuthError(message));
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2.5 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-cream disabled:opacity-60"
      >
        <GoogleIcon />
        {loading ? "Googleへ移動中..." : label}
      </button>
      {error ? (
        <p className="mt-2 text-left text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
