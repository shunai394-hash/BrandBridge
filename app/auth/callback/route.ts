import { createClient } from "@/lib/supabase/server";
import { caseInputFromMakerDraft } from "@/lib/maker-registration";
import { partnerProfilePayloadFromDraft } from "@/lib/partner-registration";
import { createCase } from "@/lib/cases";
import type { MakerCaseDraftMeta, PartnerProfileDraftMeta } from "@/lib/types";
import { NextResponse } from "next/server";

/**
 * Supabase email confirmation redirect.
 * Flushes maker case draft / partner profile draft from user_metadata.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role as string | undefined;

      if (role === "maker") {
        await flushMakerCaseDraft();
        const next =
          url.searchParams.get("next") ?? "/maker/registration-complete";
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (role === "partner") {
        await flushPartnerProfileDraft();
        const next = url.searchParams.get("next") ?? "/cases?welcome=partner";
        return NextResponse.redirect(`${origin}${next}`);
      }

      const next = url.searchParams.get("next") ?? "/cases";
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}

async function flushMakerCaseDraft() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "maker") return;

  const draft = user.user_metadata?.case_draft as MakerCaseDraftMeta | undefined;
  if (!draft?.productName) return;

  const { data: existing } = await supabase
    .from("cases")
    .select("id")
    .eq("maker_id", user.id)
    .eq("product_name", draft.productName)
    .limit(1);

  if (existing && existing.length > 0) {
    await supabase.auth.updateUser({
      data: { case_draft: null, case_draft_flushed: true },
    });
    return;
  }

  const input = caseInputFromMakerDraft(draft);
  await createCase(user.id, input);

  if (draft.companyOverview) {
    await supabase
      .from("profiles")
      .update({
        description: draft.companyOverview,
        industry: draft.industry,
        product_overview: draft.productSummary,
        onboarding_completed: true,
      })
      .eq("id", user.id);
  }

  await supabase.auth.updateUser({
    data: { case_draft: null, case_draft_flushed: true },
  });
}

async function flushPartnerProfileDraft() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "partner") return;

  const draft = user.user_metadata
    ?.partner_draft as PartnerProfileDraftMeta | undefined;
  if (!draft?.displayName && !draft?.contactName) return;

  const payload = partnerProfilePayloadFromDraft(draft);
  await supabase.from("profiles").update(payload).eq("id", user.id);

  await supabase.auth.updateUser({
    data: { partner_draft: null, partner_draft_flushed: true },
  });
}
