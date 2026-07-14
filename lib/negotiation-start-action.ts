"use server";

import { revalidatePath } from "next/cache";
import { requirePartner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const TOPIC_MAX = 120;

export type StartNegotiationAttachment = {
  path: string;
  name: string;
  mime: string;
  size: number;
};

export type StartNegotiationResult = {
  ok: boolean;
  id?: string;
  messageId?: string;
  error?: string;
  logs: string[];
};

function authErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "";
}

/**
 * Canonical negotiation start (024+).
 * 1) negotiations INSERT with topic
 * 2) messages INSERT opening row (negotiation_id, sender_id, topic, body)
 * 3) caller redirects only when ok===true
 */
export async function startNegotiationAction(input: {
  caseId: string;
  topic: string;
  /** Preferred body field from email-style form */
  body?: string;
  /** @deprecated use body */
  message?: string;
  attachment?: StartNegotiationAttachment | null;
}): Promise<StartNegotiationResult> {
  const logs: string[] = [];
  const log = (step: string, detail?: unknown) => {
    const line =
      detail === undefined
        ? `[negotiation-start] ${step}`
        : `[negotiation-start] ${step} ${JSON.stringify(detail)}`;
    logs.push(line);
    console.info(line);
  };

  const inputBody = input.body ?? input.message;

  // Required diagnostic lines (always printed)
  log("input topic:", {
    raw: input.topic,
    typeof: typeof input.topic,
    isNull: input.topic == null,
    isUndefined: input.topic === undefined,
  });
  log("input body:", {
    raw: inputBody ?? null,
    typeof: typeof inputBody,
    isNull: inputBody == null,
    isUndefined: inputBody === undefined,
  });

  if (input.topic == null || input.topic === undefined) {
    log("FAIL topic is null/undefined");
    return { ok: false, error: "件名が未設定です（topic null/undefined）", logs };
  }

  let partner;
  try {
    partner = await requirePartner();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") {
      return { ok: false, error: "LOGIN_REQUIRED", logs };
    }
    if (message === "ACCOUNT_INACTIVE") {
      return { ok: false, error: "アカウントが停止されています", logs };
    }
    return {
      ok: false,
      error: "販売パートナーのみ交渉を申し込めます",
      logs,
    };
  }

  const topic = String(input.topic).trim();
  if (!topic) {
    log("FAIL topic empty after trim");
    return { ok: false, error: "件名を入力してください", logs };
  }
  if (topic.length > TOPIC_MAX) {
    return {
      ok: false,
      error: `件名は${TOPIC_MAX}文字以内にしてください`,
      logs,
    };
  }

  const hasAttachment = Boolean(input.attachment?.path);
  const body =
    (inputBody != null ? String(inputBody).trim() : "") ||
    (hasAttachment ? "ファイルを添付しました" : "交渉を申し込みました");

  log("resolved topic/body:", {
    topic,
    body,
    topicIsNull: topic == null,
    bodyIsNull: body == null,
  });

  const supabase = await createClient();

  // ----- 1) negotiations INSERT (must include topic) -----
  const negotiationPayload = {
    case_id: input.caseId,
    partner_id: partner.id,
    topic,
    message: body,
    application_status: "pending" as const,
  };

  log("negotiation insert payload:", negotiationPayload);

  const { data: nego, error: negoError } = await supabase
    .from("negotiations")
    .insert(negotiationPayload)
    .select("id, topic, message, partner_id, application_status")
    .single();

  if (negoError || !nego) {
    log("negotiation insert FAIL", {
      message: negoError?.message,
      code: negoError?.code,
      details: negoError?.details,
    });
    return {
      ok: false,
      error: `negotiations INSERT 失敗: ${negoError?.message ?? "unknown"}`,
      logs,
    };
  }

  const negotiationId = nego.id as string;
  log("negotiation id:", negotiationId);
  log("negotiation saved topic:", {
    saved: nego.topic,
    expected: topic,
    savedIsNull: nego.topic == null,
  });

  if (nego.topic == null || String(nego.topic).trim() !== topic) {
    log("FAIL negotiations.topic null/mismatch", {
      expected: topic,
      saved: nego.topic,
    });
    return {
      ok: false,
      error:
        "negotiations.topic が保存されませんでした（null または不一致）",
      id: negotiationId,
      logs,
    };
  }

  if (input.attachment?.path) {
    const expectedPrefix = `${negotiationId}/${partner.id}/`;
    if (!input.attachment.path.startsWith(expectedPrefix)) {
      return {
        ok: false,
        error: "添付ファイルのパスが不正です",
        id: negotiationId,
        logs,
      };
    }
  }

  // ----- 2) messages INSERT — always runs after successful negotiation insert -----
  const messagePayload = {
    negotiation_id: negotiationId,
    sender_id: partner.id,
    topic,
    body,
    attachment_path: input.attachment?.path ?? null,
    attachment_name: input.attachment?.name ?? null,
    attachment_mime: input.attachment?.mime ?? null,
    attachment_size: input.attachment?.size ?? null,
  };

  log("message insert payload:", {
    negotiation_id: messagePayload.negotiation_id,
    sender_id: messagePayload.sender_id,
    topic: messagePayload.topic,
    body: messagePayload.body,
    topicIsNull: messagePayload.topic == null,
    bodyIsNull: messagePayload.body == null,
  });

  const { data: msg, error: msgError } = await supabase
    .from("messages")
    .insert(messagePayload)
    .select("id, negotiation_id, sender_id, topic, body, created_at")
    .single();

  log("message insert result:", {
    ok: !msgError && Boolean(msg),
    error: msgError
      ? {
          message: msgError.message,
          code: msgError.code,
          details: msgError.details,
          hint: msgError.hint,
        }
      : null,
    row: msg
      ? {
          id: msg.id,
          negotiation_id: msg.negotiation_id,
          sender_id: msg.sender_id,
          topic: msg.topic,
          body: msg.body,
          created_at: msg.created_at,
          topicIsNull: msg.topic == null,
        }
      : null,
  });

  if (msgError || !msg) {
    return {
      ok: false,
      error: `messages INSERT 失敗: ${msgError?.message ?? "unknown"}（negotiation_id=${negotiationId}）`,
      id: negotiationId,
      logs,
    };
  }

  if (msg.topic == null || String(msg.topic).trim() !== topic) {
    log("FAIL messages.topic null/mismatch", {
      expected: topic,
      saved: msg.topic,
    });
    return {
      ok: false,
      error: "messages.topic が保存されませんでした（null または不一致）",
      id: negotiationId,
      messageId: msg.id as string,
      logs,
    };
  }

  // Verify row is readable
  const { data: verified, error: verifyError } = await supabase
    .from("messages")
    .select("id, negotiation_id, sender_id, topic, body, created_at")
    .eq("id", msg.id)
    .maybeSingle();

  if (verifyError || !verified) {
    log("message verify FAIL", { error: verifyError?.message });
    return {
      ok: false,
      error: "messages INSERT 後の確認に失敗しました",
      id: negotiationId,
      logs,
    };
  }

  revalidatePath("/partner/negotiations");
  revalidatePath("/maker/negotiations");
  revalidatePath("/negotiations");
  revalidatePath(`/negotiations/${negotiationId}`);
  revalidatePath(`/cases/${input.caseId}`);

  log("redirect", { href: `/negotiations/${negotiationId}` });

  return {
    ok: true,
    id: negotiationId,
    messageId: verified.id as string,
    logs,
  };
}

/**
 * Attachment flow needs negotiationId before Storage upload.
 * Creates negotiation WITH topic, without message yet.
 */
export async function startNegotiationDraftAction(input: {
  caseId: string;
  topic: string;
  body?: string;
  /** @deprecated use body */
  message?: string;
}): Promise<StartNegotiationResult> {
  const logs: string[] = [];
  const log = (step: string, detail?: unknown) => {
    const line =
      detail === undefined
        ? `[negotiation-start] ${step}`
        : `[negotiation-start] ${step} ${JSON.stringify(detail)}`;
    logs.push(line);
    console.info(line);
  };

  let partner;
  try {
    partner = await requirePartner();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") {
      return { ok: false, error: "LOGIN_REQUIRED", logs };
    }
    return {
      ok: false,
      error: "販売パートナーのみ交渉を申し込めます",
      logs,
    };
  }

  const topic = input.topic.trim();
  if (!topic) return { ok: false, error: "件名を入力してください", logs };
  if (topic.length > TOPIC_MAX) {
    return { ok: false, error: `件名は${TOPIC_MAX}文字以内にしてください`, logs };
  }

  const body =
    (input.body ?? input.message)?.trim() || "交渉を申し込みました";
  const supabase = await createClient();

  log("negotiation insert (draft)", { topic, caseId: input.caseId });

  const { data: nego, error } = await supabase
    .from("negotiations")
    .insert({
      case_id: input.caseId,
      partner_id: partner.id,
      message: body,
      topic,
      application_status: "pending",
    })
    .select("id, topic")
    .single();

  if (error || !nego) {
    log("negotiation insert FAIL", { message: error?.message });
    return {
      ok: false,
      error: `negotiations INSERT 失敗: ${error?.message ?? "unknown"}`,
      logs,
    };
  }

  if (!nego.topic || String(nego.topic).trim() !== topic) {
    return {
      ok: false,
      error: "negotiations.topic が保存されませんでした",
      id: nego.id as string,
      logs,
    };
  }

  log("negotiation insert ok", { id: nego.id, topic: nego.topic });
  return { ok: true, id: nego.id as string, logs };
}

/** Insert opening message after optional attachment upload. */
export async function completeNegotiationOpeningAction(input: {
  negotiationId: string;
  caseId: string;
  topic: string;
  body?: string;
  /** @deprecated use body */
  message?: string;
  attachment?: StartNegotiationAttachment | null;
}): Promise<StartNegotiationResult> {
  const logs: string[] = [];
  const log = (step: string, detail?: unknown) => {
    const line =
      detail === undefined
        ? `[negotiation-start] ${step}`
        : `[negotiation-start] ${step} ${JSON.stringify(detail)}`;
    logs.push(line);
    console.info(line);
  };

  let partner;
  try {
    partner = await requirePartner();
  } catch (e) {
    const message = authErrorMessage(e);
    if (message === "UNAUTHORIZED") {
      return { ok: false, error: "LOGIN_REQUIRED", logs };
    }
    return {
      ok: false,
      error: "販売パートナーのみ交渉を申し込めます",
      logs,
    };
  }

  const topic = input.topic.trim();
  if (!topic) return { ok: false, error: "件名を入力してください", logs };

  const hasAttachment = Boolean(input.attachment?.path);
  const body =
    (input.body ?? input.message)?.trim() ||
    (hasAttachment ? "ファイルを添付しました" : "交渉を申し込みました");

  const supabase = await createClient();

  const { data: nego, error: negoError } = await supabase
    .from("negotiations")
    .select("id, partner_id, application_status, topic")
    .eq("id", input.negotiationId)
    .maybeSingle();

  if (negoError || !nego) {
    return { ok: false, error: "交渉が見つかりません", logs };
  }
  if (nego.partner_id !== partner.id) {
    return { ok: false, error: "権限がありません", logs };
  }

  // Ensure topic on negotiation
  if (!nego.topic || String(nego.topic).trim() !== topic) {
    const { error: topicErr } = await supabase
      .from("negotiations")
      .update({ topic, message: body })
      .eq("id", input.negotiationId)
      .eq("partner_id", partner.id);
    if (topicErr) {
      log("negotiation topic update FAIL", { message: topicErr.message });
    } else {
      log("negotiation topic update ok", { topic });
    }
  }

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("negotiation_id", input.negotiationId);

  if ((count ?? 0) > 0) {
    const { data: existing } = await supabase
      .from("messages")
      .select("id")
      .eq("negotiation_id", input.negotiationId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    log("message already exists", { count, messageId: existing?.id });
    log("redirect", { href: `/negotiations/${input.negotiationId}` });
    return {
      ok: true,
      id: input.negotiationId,
      messageId: (existing?.id as string | undefined) ?? "existing",
      logs,
    };
  }

  if (input.attachment?.path) {
    const expectedPrefix = `${input.negotiationId}/${partner.id}/`;
    if (!input.attachment.path.startsWith(expectedPrefix)) {
      return { ok: false, error: "添付ファイルのパスが不正です", logs };
    }
  }

  log("message insert", {
    negotiationId: input.negotiationId,
    senderId: partner.id,
    topic,
    bodyLen: body.length,
  });

  const { data: msg, error: msgError } = await supabase
    .from("messages")
    .insert({
      negotiation_id: input.negotiationId,
      sender_id: partner.id,
      topic,
      body,
      attachment_path: input.attachment?.path ?? null,
      attachment_name: input.attachment?.name ?? null,
      attachment_mime: input.attachment?.mime ?? null,
      attachment_size: input.attachment?.size ?? null,
    })
    .select("id, negotiation_id, sender_id, topic, body, created_at")
    .single();

  if (msgError || !msg) {
    log("message insert FAIL", {
      message: msgError?.message,
      code: msgError?.code,
    });
    return {
      ok: false,
      error: `messages INSERT 失敗: ${msgError?.message ?? "unknown"}`,
      id: input.negotiationId,
      logs,
    };
  }

  log("message insert ok", {
    messageId: msg.id,
    negotiation_id: msg.negotiation_id,
    sender_id: msg.sender_id,
    topic: msg.topic,
    body: msg.body,
    created_at: msg.created_at,
  });

  revalidatePath("/partner/negotiations");
  revalidatePath("/maker/negotiations");
  revalidatePath("/negotiations");
  revalidatePath(`/negotiations/${input.negotiationId}`);
  revalidatePath(`/cases/${input.caseId}`);

  log("redirect", { href: `/negotiations/${input.negotiationId}` });

  return {
    ok: true,
    id: input.negotiationId,
    messageId: msg.id as string,
    logs,
  };
}
