import { createClient } from "@/lib/supabase/server";

export async function getAdminContracts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("deals")
    .select(`
      *,
      negotiations (
        pipeline_status
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getAdminContract(id?: string) {
  if (!id) {
    throw new Error("Contract ID is missing");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("deals")
    .select(`
      *,
      negotiations (
        pipeline_status
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  console.log("[ADMIN CONTRACTS DATA]", data);
  return data;
}

