"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateNegotiationPipelineStatus(
  negotiationId: string,
  status: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("negotiations")
    .update({
      pipeline_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", negotiationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/contracts");
  revalidatePath(`/admin/contracts/${negotiationId}`);
}
