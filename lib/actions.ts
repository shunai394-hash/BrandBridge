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
import { createCase } from "@/lib/cases";
import { toggleFavorite } from "@/lib/favorites";
import { sendMessage } from "@/lib/messages";
import {
  createNegotiation,
  getNegotiationById,
  updateNegotiationStatus,
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

function authErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "";
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

  const result = await createCase(maker.id, input);
  if ("error" in result) {
    return { error: result.error };
  }

  redirect(`/cases/${result.id}?pending=1`);
}

export async function createNegotiationAction(input: {
  caseId: string;
  message?: string;
}): Promise<{ error?: string; success?: boolean }> {
  let partner;
  try {
    partner = await requirePartner();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") return { error: "LOGIN_REQUIRED" };
    if (message === "ACCOUNT_INACTIVE") {
      return { error: "アカウントが停止されています" };
    }
    return { error: "販売パートナーのみ交渉を申し込めます" };
  }

  const result = await createNegotiation({
    caseId: input.caseId,
    partnerId: partner.id,
    message: input.message,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  return { success: true };
}

export async function acceptNegotiationAction(
  negotiationId: string,
): Promise<{ error?: string }> {
  try {
    await requireMaker();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") redirect("/login");
    return { error: "メーカーのみ承認できます" };
  }

  const result = await updateNegotiationStatus(negotiationId, "accepted");
  if (result.error) return { error: result.error };

  revalidatePath("/negotiations");
  revalidatePath(`/negotiations/${negotiationId}`);
  return {};
}

export async function rejectNegotiationAction(
  negotiationId: string,
): Promise<{ error?: string }> {
  try {
    await requireMaker();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") redirect("/login");
    return { error: "メーカーのみ却下できます" };
  }

  const result = await updateNegotiationStatus(negotiationId, "rejected");
  if (result.error) return { error: result.error };

  revalidatePath("/negotiations");
  revalidatePath(`/negotiations/${negotiationId}`);
  return {};
}

export async function sendMessageAction(input: {
  negotiationId: string;
  body: string;
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

  if (negotiation.applicationStatus !== "accepted") {
    return { error: "承認済みの交渉でのみメッセージを送れます" };
  }

  const result = await sendMessage({
    negotiationId: input.negotiationId,
    senderId: user.id,
    body: input.body,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath(`/negotiations/${input.negotiationId}`);
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

  if (negotiation.applicationStatus !== "accepted") {
    return { error: "申込承認後のみパイプラインを変更できます" };
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
  await supabase.auth.signOut();
  redirect("/");
}
