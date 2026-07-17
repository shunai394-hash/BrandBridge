"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getSessionUser,
  requireActiveUser,
  requireAdmin,
  requireMaker,
  requirePartner,
} from "@/lib/auth";
import { reviewCase, setUserActive } from "@/lib/admin";
import {
  adminUpdateCase,
  createCase,
  updateCase,
  withdrawCase,
} from "@/lib/cases";
import { toggleFavorite } from "@/lib/favorites";
import { sendMessage } from "@/lib/messages";
import {
  addCaseImage,
  deleteCaseImage,
  reorderCaseImages,
} from "@/lib/case-images";
import { uploadProductImageOnServer } from "@/lib/product-image-upload-server";
import {
  getNegotiationById,
  markNegotiationRead,
  updatePipelineStatus,
} from "@/lib/negotiations";
import { createClient } from "@/lib/supabase/server";
import type {
  CaseCreateInput,
  CreateDealInput,
  PipelineStatus,
  ProfileUpdateInput,
  ReviewStatus,
} from "@/lib/types";
import { updateProfile } from "@/lib/profiles";
import {
  createDealFromNegotiation,
  updateDefaultCommissionRate,
} from "@/lib/deals";
import {
  createContactInquiry,
} from "@/lib/contact";
import type { ContactInput } from "@/lib/contact-types";
import { caseInputFromRegistration } from "@/lib/maker-registration";
import { partnerProfilePayloadFromDraft } from "@/lib/partner-registration";
import type {
  MakerRegistrationInput,
  PartnerRegistrationInput,
} from "@/lib/types";

function authErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "";
}

/** Auth-only setup save. Never calls signUp / signIn. */
export async function completeMakerSetupAction(
  input: Omit<MakerRegistrationInput, "email" | "password">,
): Promise<{ error: string } | void> {
  let maker;
  try {
    maker = await requireMaker();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") {
      redirect("/login?next=/maker/setup");
    }
    if (message === "ACCOUNT_INACTIVE") {
      return { error: "アカウントが停止されています" };
    }
    return { error: "メーカーアカウントでのみ登録できます" };
  }

  const imageUrl = input.productImageUrl?.trim() || null;
  console.info("[completeMakerSetupAction] start", {
    makerId: maker.id,
    productName: input.productName,
    has_product_image_url: Boolean(imageUrl),
    product_image_url_len: imageUrl?.length ?? 0,
  });

  const caseInput = caseInputFromRegistration({
    ...input,
    email: maker.email,
    password: "",
    productImageUrl: imageUrl,
  });

  if (imageUrl && caseInput.productImageUrl !== imageUrl) {
    caseInput.productImageUrl = imageUrl;
  }

  const supabase = await createClient();

  // Save profile fields first, but do NOT mark onboarding complete until case insert succeeds.
  // Otherwise a failed createCase leaves the user locked out of /maker/setup.
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
        "プロフィールの保存に失敗しました",
        profileError?.message,
        profileError?.code ? `code=${profileError.code}` : null,
        profileError?.details,
      ]
        .filter(Boolean)
        .join(" / "),
    };
  }

  console.info("[completeMakerSetupAction] profile saved", {
    table: "profiles",
    makerId: maker.id,
  });

  // Pass image URL explicitly — do not rely on nested draft mapping alone
  caseInput.productImageUrl = imageUrl;

  const result = await createCase(maker.id, caseInput);
  console.log("[sendMessage result]", result);
  if ("error" in result) {
    console.error("[completeMakerSetupAction] case insert failed", {
      table: "cases",
      makerId: maker.id,
      error: result.error,
      had_image_url: Boolean(imageUrl),
    });
    return { error: result.error };
  }

  // Belt-and-suspenders: dedicated column update after create
  if (imageUrl && result.id) {
    const { data: imgRow, error: imgError } = await supabase
      .from("cases")
      .update({ product_image_url: imageUrl })
      .eq("id", result.id)
      .eq("maker_id", maker.id)
      .select("product_image_url")
      .maybeSingle();

    if (imgError || imgRow?.product_image_url !== imageUrl) {
      console.error("[completeMakerSetupAction] image url verify failed", {
        caseId: result.id,
        error: imgError?.message,
        saved: imgRow?.product_image_url,
      });
      return {
        error:
          imgError?.message ??
          "商品画像URLの保存に失敗しました。案件は作成済みのため編集画面から画像を再設定してください。",
      };
    }
  }

  const { error: onboardError } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", maker.id);

  if (onboardError) {
    console.error("[completeMakerSetupAction] onboarding flag failed", {
      makerId: maker.id,
      error: onboardError.message,
    });
    // Case already created — surface warning but still redirect
  }

  const completePath = `/cases?created=${encodeURIComponent(result.id)}`;
  console.info("[completeMakerSetupAction] success", {
    table: "cases",
    caseId: result.id,
    makerId: maker.id,
    product_name: caseInput.productName,
    status: "open",
    reviewStatus: result.reviewStatus,
    betaAutoApproveCreates: process.env.BETA_AUTO_APPROVE_CASES === "true",
    redirect: completePath,
  });

  revalidatePath("/maker/setup");
  revalidatePath("/maker/registration-complete");
  revalidatePath("/cases");
  redirect(completePath);
}

/** Auth-only setup save. Never calls signUp / signIn. */
export async function completePartnerSetupAction(
  input: Omit<PartnerRegistrationInput, "email" | "password">,
): Promise<{ error: string } | void> {
  let partner;
  try {
    partner = await requirePartner();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") {
      redirect("/login?next=/partner/setup");
    }
    if (message === "ACCOUNT_INACTIVE") {
      return { error: "アカウントが停止されています" };
    }
    return { error: "パートナーアカウントでのみ登録できます" };
  }

  const payload = partnerProfilePayloadFromDraft(input);
  const supabase = await createClient();
  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", partner.id)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    return {
      error:
        updateError?.message ??
        "プロフィールの保存に失敗しました。ログインし直してから再度お試しください。",
    };
  }

  revalidatePath("/partner/setup");
  revalidatePath("/cases");
  redirect("/cases?welcome=partner");
}

export async function createCaseAction(
  input: CaseCreateInput,
): Promise<{ error: string } | void> {
  let maker;
  try {
    maker = await requireMaker();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") redirect("/login");
    if (message === "ACCOUNT_INACTIVE") {
      return { error: "アカウントが停止されています" };
    }
    return { error: "メーカーアカウントでのみ案件を登録できます" };
  }

  const result = await createCase(maker.id, {
    ...input,
    productImageUrl: input.productImageUrl?.trim() || null,
  });
  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath("/cases");
  revalidatePath("/maker/cases");
  redirect(`/cases?created=${encodeURIComponent(result.id)}`);
}

export async function updateCaseAction(
  caseId: string,
  input: CaseCreateInput,
): Promise<{ error: string } | void> {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) redirect("/login");

  const result = await updateCase(caseId, {
    ...input,
    productImageUrl: input.productImageUrl?.trim() || null,
  });
  if (result.error) return { error: result.error };

  revalidatePath("/cases");
  revalidatePath("/maker/cases");
  revalidatePath(`/maker/cases/${caseId}/edit`);
  revalidatePath(`/cases/${caseId}`);
  redirect("/maker/cases");
}

/** Admin: full case content edit (incl. product_image_url) */
export async function adminUpdateCaseAction(
  caseId: string,
  input: CaseCreateInput,
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") return { error: "ログインが必要です" };
    return { error: "管理者のみ編集できます" };
  }

  const result = await adminUpdateCase(caseId, {
    ...input,
    productImageUrl: input.productImageUrl?.trim() || null,
  });
  if (result.error) return { error: result.error };

  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/admin/cases");
  revalidatePath(`/admin/cases/${caseId}`);
  revalidatePath(`/admin/cases/${caseId}/edit`);
  revalidatePath("/maker/cases");
  return {};
}

function revalidateCaseImagePaths(caseId: string) {
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/maker/cases");
  revalidatePath(`/maker/cases/${caseId}/edit`);
  revalidatePath("/admin/cases");
  revalidatePath(`/admin/cases/${caseId}`);
  revalidatePath(`/admin/cases/${caseId}/edit`);
}

async function assertCanManageCaseImages(
  caseId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSessionUser();
  if (!session) return { ok: false, error: "ログインが必要です" };
  if (!session.isActive) {
    return { ok: false, error: "アカウントが停止されています" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select("id, maker_id")
    .eq("id", caseId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "案件が見つかりません" };
  }
  if (session.role !== "admin" && data.maker_id !== session.id) {
    return { ok: false, error: "この案件の画像を更新する権限がありません" };
  }
  return { ok: true };
}

/** Add a gallery image (case_images). Syncs cases.product_image_url via trigger. */
export async function addCaseImageAction(input: {
  caseId: string;
  imageUrl: string;
  storagePath?: string | null;
}): Promise<{ error?: string; imageId?: string }> {
  const access = await assertCanManageCaseImages(input.caseId);
  if (!access.ok) return { error: access.error };

  const result = await addCaseImage({
    caseId: input.caseId,
    imageUrl: input.imageUrl,
    storagePath: input.storagePath,
  });
  if (result.error) return { error: result.error };

  revalidateCaseImagePaths(input.caseId);
  return { imageId: result.image?.id };
}

/**
 * Upload product image only (cookie JWT). FormData key: file
 * Used by registration / single-image fields.
 */
export async function uploadProductImageAction(
  formData: FormData,
): Promise<{ error?: string; url?: string; path?: string }> {
  const session = await getSessionUser();
  if (!session) return { error: "ログインが必要です" };
  if (!session.isActive) return { error: "アカウントが停止されています" };

  const raw = formData.get("file");
  const file =
    raw &&
    typeof raw === "object" &&
    "arrayBuffer" in raw &&
    typeof (raw as Blob).arrayBuffer === "function"
      ? (raw as File)
      : null;

  if (!file || file.size === 0) {
    return { error: "画像ファイルを選択してください" };
  }

  const uploaded = await uploadProductImageOnServer(file);
  if (!uploaded.ok) return { error: uploaded.error };
  return { url: uploaded.url, path: uploaded.path };
}

/**
 * Upload product image on the server (cookie JWT) then insert case_images.
 * FormData keys: caseId, file
 */
export async function uploadAndAddCaseImageAction(
  formData: FormData,
): Promise<{
  error?: string;
  imageId?: string;
  imageUrl?: string;
  storagePath?: string;
}> {
  const caseId = String(formData.get("caseId") ?? "").trim();
  if (!caseId) return { error: "案件IDが不正です" };

  const access = await assertCanManageCaseImages(caseId);
  if (!access.ok) return { error: access.error };

  const raw = formData.get("file");
  const file =
    raw &&
    typeof raw === "object" &&
    "arrayBuffer" in raw &&
    typeof (raw as Blob).arrayBuffer === "function"
      ? (raw as File)
      : null;

  if (!file || file.size === 0) {
    return { error: "画像ファイルを選択してください" };
  }

  const uploaded = await uploadProductImageOnServer(file);
  if (!uploaded.ok) {
    return { error: uploaded.error };
  }

  const result = await addCaseImage({
    caseId,
    imageUrl: uploaded.url,
    storagePath: uploaded.path,
  });
  if (result.error) {
    return { error: result.error };
  }

  revalidateCaseImagePaths(caseId);
  return {
    imageId: result.image?.id,
    imageUrl: uploaded.url,
    storagePath: uploaded.path,
  };
}

export async function deleteCaseImageAction(input: {
  caseId: string;
  imageId: string;
}): Promise<{ error?: string }> {
  const access = await assertCanManageCaseImages(input.caseId);
  if (!access.ok) return { error: access.error };

  const result = await deleteCaseImage(input.imageId);
  if (result.error) return { error: result.error };

  revalidateCaseImagePaths(input.caseId);
  return {};
}

export async function reorderCaseImagesAction(input: {
  caseId: string;
  orderedIds: string[];
}): Promise<{ error?: string }> {
  const access = await assertCanManageCaseImages(input.caseId);
  if (!access.ok) return { error: access.error };

  const result = await reorderCaseImages(input);
  if (result.error) return { error: result.error };

  revalidateCaseImagePaths(input.caseId);
  return {};
}

/** Legacy single-URL setter (kept for create/registration flows). */
export async function updateCaseProductImageAction(input: {
  caseId: string;
  productImageUrl: string | null;
}): Promise<{ error?: string }> {
  const session = await getSessionUser();
  if (!session) return { error: "ログインが必要です" };
  if (!session.isActive) return { error: "アカウントが停止されています" };

  const imageUrl = input.productImageUrl?.trim() || null;
  const supabase = await createClient();

  let query = supabase
    .from("cases")
    .update({ product_image_url: imageUrl })
    .eq("id", input.caseId);

  if (session.role !== "admin") {
    query = query.eq("maker_id", session.id);
  }

  const { data, error } = await query
    .select("id, product_image_url, maker_id")
    .maybeSingle();

  if (error) {
    console.error("[updateCaseProductImageAction]", error.message);
    return { error: `画像URLの保存に失敗しました: ${error.message}` };
  }
  if (!data) {
    return {
      error:
        "案件を更新できません。権限がないか、案件IDが不正です。",
    };
  }

  const savedUrl =
    (data.product_image_url as string | null | undefined)?.trim() || null;
  if (savedUrl !== imageUrl) {
    return { error: "画像URLがDBに反映されませんでした。再試行してください。" };
  }

  revalidateCaseImagePaths(input.caseId);
  return {};
}

export async function withdrawCaseAction(
  caseId: string,
): Promise<{ error?: string }> {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) return { error: "LOGIN_REQUIRED" };

  const result = await withdrawCase(caseId);
  if (result.error) return { error: result.error };

  revalidatePath("/cases");
  revalidatePath("/maker/cases");
  revalidatePath(`/cases/${caseId}`);
  return {};
}

export async function sendMessageAction(input: {
  negotiationId: string;
  body: string;
  topic?: string | null;
  attachment?: {
    path: string;
    name: string;
    mime: string;
    size: number;
  } | null;
}): Promise<{ error?: string }> {
  let user;
  try {
    user = await requireActiveUser();
  } catch {
    redirect("/login");
  }

  const negotiation = await getNegotiationById(input.negotiationId, user);
  if (!negotiation) {
    return { error: "交渉が見つかりません" };
  }

  if (negotiation.applicationStatus === "rejected") {
    return { error: "この交渉は終了しているためメッセージを送れません" };
  }

  const result = await sendMessage({
    negotiationId: input.negotiationId,
    senderId: user.id,
    body: input.body,
    topic: input.topic ?? null,
    attachment: input.attachment ?? null,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  await markNegotiationRead(input.negotiationId, user.id);

  revalidatePath(`/negotiations/${input.negotiationId}`);
  revalidatePath("/maker/negotiations");
  revalidatePath("/partner/negotiations");
  revalidatePath("/negotiations");
  return {};
}

export async function updateProfileAction(
  input: ProfileUpdateInput,
): Promise<{ error?: string } | void> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/profile/edit");
  }
  if (!user.isActive) {
    return { error: "アカウントが停止されています" };
  }

  if (!input.companyName.trim() || !input.contactName.trim()) {
    return { error: "会社名と担当者名は必須です" };
  }

  const roleForUpdate = user.role === "maker" ? "maker" : "partner";
  const result = await updateProfile(user.id, input, roleForUpdate);
  if (result.error) {
    return { error: result.error };
  }

  revalidatePath(`/profiles/${user.id}`);
  revalidatePath("/profile/edit");
  revalidatePath("/cases");
  redirect(`/profiles/${user.id}`);
}

export async function reviewCaseAction(input: {
  caseId: string;
  reviewStatus: Extract<ReviewStatus, "approved" | "rejected">;
  reviewNote?: string;
}): Promise<{ error?: string }> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") redirect("/login");
    return { error: "管理者のみ審査できます" };
  }

  const result = await reviewCase({
    caseId: input.caseId,
    adminId: admin.id,
    reviewStatus: input.reviewStatus,
    reviewNote: input.reviewNote,
  });

  if (result.error) return { error: result.error };

  revalidatePath("/admin");
  revalidatePath("/admin/cases");
  revalidatePath(`/admin/cases/${input.caseId}`);
  revalidatePath("/cases");
  revalidatePath(`/cases/${input.caseId}`);
  return {};
}

export async function setUserActiveAction(input: {
  userId: string;
  isActive: boolean;
}): Promise<{ error?: string }> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") redirect("/login");
    return { error: "管理者のみユーザーを管理できます" };
  }

  if (input.userId === admin.id) {
    return { error: "自分自身を停止することはできません" };
  }

  const result = await setUserActive(input.userId, input.isActive);
  if (result.error) return { error: result.error };

  revalidatePath("/admin/users");
  return {};
}

export async function toggleFavoriteAction(
  caseId: string,
): Promise<{ favorited?: boolean; error?: string }> {
  let user;
  try {
    user = await requireActiveUser();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") return { error: "LOGIN_REQUIRED" };
    return { error: "アカウントが停止されています" };
  }

  const result = await toggleFavorite(user.id, caseId);
  if ("error" in result) return { error: result.error };

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/favorites");
  return { favorited: result.favorited };
}

export async function updatePipelineStatusAction(input: {
  negotiationId: string;
  pipelineStatus: PipelineStatus;
}): Promise<{ error?: string }> {
  let user;
  try {
    user = await requireActiveUser();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") redirect("/login");
    return { error: "アカウントが停止されています" };
  }

  const negotiation = await getNegotiationById(input.negotiationId, user);
  if (!negotiation) {
    return { error: "交渉が見つかりません" };
  }

  if (negotiation.applicationStatus === "rejected") {
    return { error: "終了した交渉のステータスは変更できません" };
  }

  const result = await updatePipelineStatus(
    input.negotiationId,
    input.pipelineStatus,
  );
  if (result.error) return { error: result.error };

  revalidatePath("/negotiations");
  revalidatePath(`/negotiations/${input.negotiationId}`);
  revalidatePath("/admin/negotiations");
  return {};
}

export async function createDealAction(
  input: CreateDealInput,
): Promise<{ error?: string; id?: string }> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") redirect("/login");
    return { error: "管理者のみ成約登録できます" };
  }

  const result = await createDealFromNegotiation(input, admin.id);
  if ("error" in result) return { error: result.error };

  revalidatePath("/deals");
  revalidatePath("/admin");
  revalidatePath("/admin/negotiations");
  revalidatePath(`/negotiations/${input.negotiationId}`);
  return { id: result.id };
}

export async function updateCommissionRateAction(
  rate: number,
): Promise<{ error?: string }> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") redirect("/login");
    return { error: "管理者のみ手数料率を変更できます" };
  }

  const result = await updateDefaultCommissionRate(rate, admin.id);
  if (result.error) return { error: result.error };

  revalidatePath("/admin");
  revalidatePath("/admin/negotiations");
  revalidatePath("/deals");
  return {};
}

export async function submitContactAction(
  input: ContactInput,
): Promise<{ error?: string }> {
  return createContactInquiry(input);
}

export async function signOutAction() {
  const supabase = await createClient();
  // Local scope clears BrandBridge cookies; does not revoke Google account login
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}
