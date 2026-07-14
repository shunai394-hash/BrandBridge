"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { IntentRole } from "@/lib/auth-flow";
import { setupPathForRole } from "@/lib/auth-flow";

type GoogleAuthButtonProps = {
  /** Register flow: bind role after OAuth. Login: omit. */
  intentRole?: IntentRole;
  nextPath?: string;
  label?: string;
  className?: string;
};

export function GoogleAuthButton({
  intentRole,
  nextPath,
  label = "Googleで続ける",
  className = "w-full",
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const next =
        nextPath ??
        (intentRole ? setupPathForRole(intentRole) : "/cases");

      const params = new URLSearchParams({
        next,
      });
      if (intentRole) {
        params.set("intent_role", intentRole);
      }

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?${params.toString()}`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (oauthError) {
        setError(`Auth error: ${oauthError.message}`);
        setLoading(false);
      }
      // On success browser redirects away
    } catch (e) {
      setError(
        `Auth error: ${e instanceof Error ? e.message : String(e)}`,
      );
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className={className}
        disabled={loading}
        onClick={handleClick}
      >
        {loading ? "Googleへ移動中..." : label}
      </Button>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
