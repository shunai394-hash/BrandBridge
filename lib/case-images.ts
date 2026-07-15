import { MAX_CASE_IMAGES } from "@/lib/case-image-constants";
import { createClient } from "@/lib/supabase/server";
import type { CaseImage } from "@/lib/types";

export { MAX_CASE_IMAGES };

type CaseImageRow = {
  id: string;
  case_id: string;
  image_url: string;
  storage_path: string | null;
  sort_order: number;
  created_at: string;
};

function mapImage(row: CaseImageRow): CaseImage {
  return {
    id: row.id,
    caseId: row.case_id,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export async function listCaseImages(caseId: string): Promise<CaseImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_images")
    .select("id, case_id, image_url, storage_path, sort_order, created_at")
    .eq("case_id", caseId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    // Table may not exist yet on older DBs — fall back empty
    if (/case_images|schema cache/i.test(error.message)) {
      console.warn("[listCaseImages] unavailable:", error.message);
      return [];
    }
    console.error("[listCaseImages]", error.message);
    return [];
  }

  return ((data ?? []) as CaseImageRow[]).map(mapImage);
}

export async function addCaseImage(input: {
  caseId: string;
  imageUrl: string;
  storagePath?: string | null;
}): Promise<{ image?: CaseImage; error?: string }> {
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("case_images")
    .select("id", { count: "exact", head: true })
    .eq("case_id", input.caseId);

  if (countError) {
    return { error: countError.message };
  }
  if ((count ?? 0) >= MAX_CASE_IMAGES) {
    return { error: `商品画像は最大${MAX_CASE_IMAGES}枚までです` };
  }

  const nextOrder = count ?? 0;

  const { data, error } = await supabase
    .from("case_images")
    .insert({
      case_id: input.caseId,
      image_url: input.imageUrl,
      storage_path: input.storagePath ?? null,
      sort_order: nextOrder,
    })
    .select("id, case_id, image_url, storage_path, sort_order, created_at")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "画像の保存に失敗しました" };
  }

  return { image: mapImage(data as CaseImageRow) };
}

export async function deleteCaseImage(
  imageId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: row, error: fetchError } = await supabase
    .from("case_images")
    .select("id, case_id")
    .eq("id", imageId)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!row) return { error: "画像が見つかりません" };

  const { error } = await supabase
    .from("case_images")
    .delete()
    .eq("id", imageId);

  if (error) return { error: error.message };

  // Re-pack sort_order 0..n-1
  const remaining = await listCaseImages(row.case_id as string);
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].sortOrder !== i) {
      await supabase
        .from("case_images")
        .update({ sort_order: i })
        .eq("id", remaining[i].id);
    }
  }

  return {};
}

/** Reorder by array of image ids (new order). */
export async function reorderCaseImages(input: {
  caseId: string;
  orderedIds: string[];
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const current = await listCaseImages(input.caseId);
  const idSet = new Set(current.map((i) => i.id));

  if (input.orderedIds.length !== current.length) {
    return { error: "並び替え対象が不正です" };
  }
  for (const id of input.orderedIds) {
    if (!idSet.has(id)) return { error: "不明な画像IDです" };
  }

  for (let i = 0; i < input.orderedIds.length; i++) {
    const { error } = await supabase
      .from("case_images")
      .update({ sort_order: i })
      .eq("id", input.orderedIds[i])
      .eq("case_id", input.caseId);
    if (error) return { error: error.message };
  }

  return {};
}
