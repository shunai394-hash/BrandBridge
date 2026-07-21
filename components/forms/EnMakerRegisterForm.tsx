"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { GoogleAuthButton } from "@/components/forms/GoogleAuthButton";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site";
import type { SupabaseClient } from "@supabase/supabase-js";

const SETUP_PATH = "/en/maker/setup";

/** English register only: ensure profiles.role=maker before opening setup. */
async function ensureMakerRoleForEnglishRegister(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role === "admin") return;
  if (profile?.onboarding_completed === true && profile.role) return;

  if (profile?.role !== "maker") {
    const { error } = await supabase
      .from("profiles")
      .update({ role: "maker" })
      .eq("id", userId);
    if (error) {
      console.error("[EnMakerRegisterForm] role update failed", error.message);
    }
  }

  await supabase.auth.updateUser({
    data: { role: "maker" },
  });
}

function goToMakerSetup() {
  // Full navigation so setup page reads the updated session/role.
  window.location.assign(SETUP_PATH);
}

export function EnMakerRegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

      const metaRole = user.user_metadata?.role as string | undefined;
      const fromEnglishRegister =
        user.user_metadata?.registration_source === "/en/register/maker" ||
        user.user_metadata?.registration_locale === "en";

      if (profile?.onboarding_completed === true && profile.role === "maker") {
        router.replace("/en/maker/dashboard");
        return;
      }

      // Already a maker (or English signup metadata) → finish setup, not /cases.
      if (
        profile?.role === "maker" ||
        metaRole === "maker" ||
        fromEnglishRegister
      ) {
        if (profile?.role !== "maker") {
          await ensureMakerRoleForEnglishRegister(supabase, user.id);
        }
        goToMakerSetup();
        return;
      }
    })();
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const companyName = String(form.get("companyName") ?? "").trim();
    const contactPerson = String(form.get("contactPerson") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const country = String(form.get("country") ?? "").trim();
    const productCategory = String(form.get("productCategory") ?? "").trim();
    const productDescription = String(
      form.get("productDescription") ?? "",
    ).trim();
    const password = String(form.get("password") ?? "");

    if (!companyName || !contactPerson || !email || !country) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!productCategory || !productDescription) {
      setError("Please fill in product category and description.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user: existing },
    } = await supabase.auth.getUser();
    if (existing) {
      await ensureMakerRoleForEnglishRegister(supabase, existing.id);
      setLoading(false);
      goToMakerSetup();
      return;
    }

    const siteUrl =
      typeof window !== "undefined" ? window.location.origin : getSiteUrl();

    // Same auth signUp path as Japanese maker registration (no new tables).
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(SETUP_PATH)}&intent_role=maker`,
        data: {
          role: "maker",
          company_name: companyName,
          contact_name: contactPerson,
          onboarding_completed: false,
          registration_locale: "en",
          registration_source: "/en/register/maker",
          country,
          product_category: productCategory,
          product_description: productDescription.slice(0, 2000),
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(`Auth error: ${signUpError.message}`);
      return;
    }

    if (data.session && !data.user?.email_confirmed_at) {
      await supabase.auth.signOut();
      setLoading(false);
      setSubmitted(true);
      return;
    }

    if (data.session && data.user) {
      await ensureMakerRoleForEnglishRegister(supabase, data.user.id);
      setLoading(false);
      goToMakerSetup();
      return;
    }

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="animate-fade-up rounded-lg border border-teal/30 bg-cream p-8 text-center">
        <h2 className="font-[family-name:var(--font-shippori)] text-2xl text-navy">
          Check your email
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We sent a confirmation link. After verifying your email, you will
          continue to the product supplier setup page ({SETUP_PATH}).
        </p>
        <ol className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-navy">
          <li>1. Confirm your email</li>
          <li>2. Complete your profile / product details</li>
          <li>3. Start matching with sales partners</li>
        </ol>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/login?next=/en/maker/setup" className="w-full sm:w-auto">
            Go to login
          </Button>
          <Button href="/en" variant="outline" className="w-full sm:w-auto">
            English home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-5">
      <p className="text-sm text-muted">
        Create your account and share basic brand information. Full product
        listing details can be completed after email verification.
      </p>
      <GoogleAuthButton
        intentRole="maker"
        nextPath={SETUP_PATH}
        label="Continue with Google"
      />
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-navy/15" />
        or email
        <span className="h-px flex-1 bg-navy/15" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Company Name"
          name="companyName"
          required
          maxLength={200}
          autoComplete="organization"
        />
        <Input
          label="Contact Person"
          name="contactPerson"
          required
          maxLength={100}
          autoComplete="name"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          maxLength={200}
          autoComplete="email"
        />
        <PasswordInput
          label="Password (min. 8 characters)"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Input
          label="Country"
          name="country"
          required
          maxLength={100}
          placeholder="e.g. United States, Singapore, Thailand"
          autoComplete="country-name"
        />
        <Input
          label="Product Category"
          name="productCategory"
          required
          maxLength={200}
          placeholder="e.g. Beauty, Food & Beverage, Home"
        />
        <TextArea
          label="Product Description"
          name="productDescription"
          required
          rows={5}
          maxLength={2000}
          placeholder="Briefly describe your brand and products for the Japanese market."
        />
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
          {loading ? "Submitting..." : "Submit Registration"}
        </Button>
      </form>
    </div>
  );
}
