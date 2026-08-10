"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMaker } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EnMakerCompanySetupInput = {
  companyName: string;
  contactName: string;
  industry: string;
  companyOverview: string;
};

function authErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "";
}

/**
 * English maker first-time setup: company profile only.
 * Sets onboarding_completed without creating a product listing.
 * Product registration is handled separately via /en/maker/cases/new.
 */
export async function completeEnMakerSetupAction(
  input: EnMakerCompanySetupInput,
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

  const companyName = input.companyName.trim();
  const contactName = input.contactName.trim();
  const industry = input.industry.trim();
  const companyOverview = input.companyOverview.trim();

  if (!companyName) return { error: "Please enter your company name." };
  if (!contactName) return { error: "Please enter a contact person name." };
  if (!industry) return { error: "Please select an industry." };
  if (!companyOverview) return { error: "Please enter a company overview." };

  const supabase = await createClient();

  const { data: updated, error: profileError } = await supabase
    .from("profiles")
    .update({
      company_name: companyName,
      contact_name: contactName,
      industry,
      description: companyOverview,
      onboarding_completed: true,
      is_maker: true,
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

  revalidatePath("/en/maker/setup");
  revalidatePath("/en/maker/dashboard");
  revalidatePath("/en/maker/cases");
  revalidatePath("/en/products");
  redirect("/en/maker/dashboard");
}
