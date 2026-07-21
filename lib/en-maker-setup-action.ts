"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMaker } from "@/lib/auth";
import { createCase } from "@/lib/cases";
import { ENGLISH_CASE_MARKER } from "@/lib/inquiry-language";
import { caseInputFromRegistration } from "@/lib/maker-registration";
import { createClient } from "@/lib/supabase/server";
import type { MakerRegistrationInput } from "@/lib/types";

function authErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "";
}

function lineValue(block: string, label: string): string | null {
  const re = new RegExp(`^${label}:\\s*(.+)$`, "im");
  const m = block.match(re);
  return m?.[1]?.trim() || null;
}

/**
 * English-only maker setup save.
 * Reuses the same profile + createCase path as completeMakerSetupAction,
 * but redirects to /en/products (does not modify the Japanese action).
 */
export async function completeEnMakerSetupAction(
  input: Omit<MakerRegistrationInput, "email" | "password">,
): Promise<{ error: string } | void> {
  let maker;
  try {
    maker = await requireMaker();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") {
      redirect(`/en/login?next=${encodeURIComponent("/en/maker/setup")}`);
    }
    if (message === "ACCOUNT_INACTIVE") {
      return { error: "Your account has been suspended." };
    }
    return { error: "Product supplier accounts only." };
  }

  const imageUrl = input.productImageUrl?.trim() || null;
  const caseInput = caseInputFromRegistration({
    ...input,
    email: maker.email,
    password: "",
    productImageUrl: imageUrl,
  });
  caseInput.productImageUrl = imageUrl;

  // Map English-only folded fields onto existing case columns (no schema change).
  const terms = input.dealTerms ?? "";
  const wholesale = lineValue(terms, "Wholesale Price");
  const moq = lineValue(terms, "MOQ");
  const origin = lineValue(terms, "Country of Origin");
  if (wholesale) caseInput.priceBand = wholesale;
  if (moq) caseInput.minOrder = moq;
  if (origin) caseInput.shipFrom = origin;

  if (!caseInput.description.includes(ENGLISH_CASE_MARKER)) {
    caseInput.description = `${ENGLISH_CASE_MARKER}\n${caseInput.description}`;
  }
  const offerBase = caseInput.offer?.trim() || "";
  caseInput.offer = offerBase.includes(ENGLISH_CASE_MARKER)
    ? offerBase
    : `${ENGLISH_CASE_MARKER}\n${offerBase}`.trim();

  const supabase = await createClient();

  const { data: updated, error: profileError } = await supabase
    .from("profiles")
    .update({
      company_name: input.companyName.trim(),
      contact_name: input.contactName.trim(),
      industry: input.industry,
      description: input.companyOverview.trim(),
      product_overview: input.productSummary.trim(),
    })
    .eq("id", maker.id)
    .select("id")
    .maybeSingle();

  if (profileError || !updated) {
    return {
      error: [
        "Failed to save profile",
        profileError?.message,
        profileError?.code ? `code=${profileError.code}` : null,
      ]
        .filter(Boolean)
        .join(" / "),
    };
  }

  const result = await createCase(maker.id, caseInput);
  if ("error" in result) {
    return { error: result.error };
  }

  if (imageUrl && result.id) {
    const { data: imgRow, error: imgError } = await supabase
      .from("cases")
      .update({ product_image_url: imageUrl })
      .eq("id", result.id)
      .eq("maker_id", maker.id)
      .select("product_image_url")
      .maybeSingle();

    if (imgError || imgRow?.product_image_url !== imageUrl) {
      return {
        error:
          imgError?.message ??
          "Product image URL could not be saved. The listing was created—set the image again from edit if needed.",
      };
    }
  }

  await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", maker.id);

  const completePath = `/en/products?created=${encodeURIComponent(result.id)}`;

  revalidatePath("/en/maker/setup");
  revalidatePath("/en/products");
  revalidatePath("/en/maker/dashboard");
  revalidatePath("/en/cases");
  revalidatePath("/cases");
  redirect(completePath);
}
