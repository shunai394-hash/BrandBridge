"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export type CaseImageStep =
  | "auth"
  | "file"
  | "storage_upload"
  | "public_url"
  | "db_update"
  | "db_verify";

export type CaseImageActionResult = {
  ok: boolean;
  error?: string;
  url?: string | null;
  path?: string;
  failedStep?: CaseImageStep | "caseId";
  steps: Partial<Record<CaseImageStep, string>>;
  /** Server-side log lines for UI / terminal diagnosis */
  logs: string[];
};

function extensionFor(file: {
  name?: string;
  type?: string;
}): string | null {
  const fromName = file.name?.split(".").pop()?.toLowerCase();
  if (fromName && ALLOWED_EXT.has(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  if (file.type === "image/jpeg") return "jpg";
  return null;
}

function mimeForExt(ext: string): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/jpeg";
}

function buildPublicUrl(supabaseUrl: string, path: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  const encoded = path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${base}/storage/v1/object/public/${BUCKET}/${encoded}`;
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

type Logger = {
  logs: string[];
  log: (step: string, detail: unknown) => void;
};

function createLogger(): Logger {
  const logs: string[] = [];
  return {
    logs,
    log(step, detail) {
      const line =
        typeof detail === "string"
          ? `[uploadCaseProductImageAction] ${step}: ${detail}`
          : `[uploadCaseProductImageAction] ${step}: ${JSON.stringify(detail)}`;
      logs.push(line);
      console.info(line);
    },
  };
}

function fail(
  logger: Logger,
  steps: CaseImageActionResult["steps"],
  failedStep: CaseImageActionResult["failedStep"],
  error: string,
  extra?: Partial<CaseImageActionResult>,
): CaseImageActionResult {
  logger.log("FAIL", { failedStep, error, steps });
  console.error("[uploadCaseProductImageAction] FAIL", {
    failedStep,
    error,
    steps,
    logs: logger.logs,
  });
  return {
    ok: false,
    error,
    failedStep,
    steps,
    logs: logger.logs,
    ...extra,
  };
}

/**
 * useActionState-compatible:
 *   (prevState, formData) => CaseImageActionResult
 *
 * FormData keys: caseId, file
 */
export async function uploadCaseProductImageAction(
  _prev: CaseImageActionResult | null,
  formData: FormData,
): Promise<CaseImageActionResult> {
  const logger = createLogger();
  const steps: CaseImageActionResult["steps"] = {};

  logger.log("start", {
    formKeys: Array.from(formData.keys()),
    hasCaseId: formData.has("caseId"),
    hasFile: formData.has("file"),
  });

  const caseId = String(formData.get("caseId") ?? "").trim();
  if (!caseId) {
    steps.file = "fail: caseId missing";
    return fail(logger, steps, "caseId", "案件IDが不正です");
  }
  logger.log("caseId", caseId);

  // ----- 1. Auth -----
  const session = await getSessionUser();
  if (!session) {
    steps.auth = "fail: no session";
    logger.log("auth", { ok: false, reason: "no session" });
    return fail(logger, steps, "auth", "ログインが必要です");
  }
  if (!session.isActive) {
    steps.auth = "fail: inactive";
    logger.log("auth", { ok: false, reason: "inactive", id: session.id });
    return fail(logger, steps, "auth", "アカウントが停止されています");
  }
  steps.auth = `ok: role=${session.role} id=${session.id}`;
  logger.log("auth", {
    ok: true,
    role: session.role,
    userId: session.id,
    isActive: session.isActive,
  });

  const supabase = await createClient();
  const {
    data: { user: authUser },
    error: authUserError,
  } = await supabase.auth.getUser();
  logger.log("auth.getUser", {
    authUid: authUser?.id ?? null,
    profileId: session.id,
    idsMatch: authUser?.id === session.id,
    error: authUserError?.message ?? null,
  });

  const { data: caseRow, error: caseError } = await supabase
    .from("cases")
    .select("id, maker_id, product_image_url")
    .eq("id", caseId)
    .maybeSingle();

  logger.log("case.preselect", {
    found: Boolean(caseRow),
    maker_id: caseRow?.maker_id ?? null,
    product_image_url_before: caseRow?.product_image_url ?? null,
    error: caseError?.message ?? null,
  });

  if (caseError || !caseRow) {
    steps.db_update = `fail: case ${caseError?.message ?? "not found"}`;
    return fail(logger, steps, "db_update", "案件が見つかりません");
  }

  if (session.role !== "admin" && caseRow.maker_id !== session.id) {
    steps.db_update = "fail: not owner";
    logger.log("auth.ownership", {
      ok: false,
      maker_id: caseRow.maker_id,
      sessionId: session.id,
    });
    return fail(
      logger,
      steps,
      "db_update",
      "この案件の画像を更新する権限がありません",
    );
  }

  // ----- 2. File -----
  const rawFile = formData.get("file");
  logger.log("file.raw", {
    typeof: typeof rawFile,
    isNull: rawFile == null,
    isString: typeof rawFile === "string",
    ctor: rawFile && typeof rawFile === "object" ? (rawFile as object).constructor?.name : null,
    keys:
      rawFile && typeof rawFile === "object"
        ? Object.keys(rawFile as object)
        : [],
  });

  const file =
    rawFile &&
    typeof rawFile === "object" &&
    "arrayBuffer" in rawFile &&
    typeof (rawFile as Blob).arrayBuffer === "function" &&
    typeof (rawFile as Blob).size === "number"
      ? (rawFile as File)
      : null;

  if (!file || file.size === 0) {
    steps.file = `fail: no file (typeof=${typeof rawFile}, size=${
      file?.size ?? "n/a"
    })`;
    logger.log("file", { ok: false, detail: steps.file });
    return fail(logger, steps, "file", "画像ファイルを選択してください");
  }

  const ext = extensionFor(file);
  const typeOk = ALLOWED_TYPES.has(file.type) || Boolean(ext);
  if (!typeOk || !ext) {
    steps.file = `fail: type=${file.type || "unknown"} name=${file.name}`;
    logger.log("file", { ok: false, detail: steps.file });
    return fail(
      logger,
      steps,
      "file",
      "画像形式は JPEG / PNG / WebP / GIF のみ対応しています",
    );
  }
  if (file.size > MAX_BYTES) {
    steps.file = `fail: size ${file.size}`;
    logger.log("file", { ok: false, size: file.size });
    return fail(logger, steps, "file", "画像サイズは5MB以下にしてください");
  }

  steps.file = `ok: name=${file.name} size=${file.size} type=${file.type || ext}`;
  logger.log("file", {
    ok: true,
    name: file.name,
    size: file.size,
    type: file.type,
    ext,
  });

  // ----- 3. Storage upload -----
  // Prefer auth.uid() for storage RLS folder check
  const storageUserId = authUser?.id ?? session.id;
  const path = `${storageUserId}/${Date.now()}.${ext}`;
  const contentType = file.type || mimeForExt(ext);
  const bytes = new Uint8Array(await file.arrayBuffer());

  logger.log("storage.upload.start", {
    bucket: BUCKET,
    path,
    contentType,
    byteLength: bytes.byteLength,
  });

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, {
      upsert: true,
      contentType,
      cacheControl: "3600",
    });

  if (uploadError) {
    steps.storage_upload = `fail: ${uploadError.message}`;
    logger.log("storage.upload", {
      ok: false,
      message: uploadError.message,
      name: uploadError.name,
      statusCode:
        "statusCode" in uploadError
          ? String((uploadError as { statusCode?: string }).statusCode)
          : null,
    });
    return fail(
      logger,
      steps,
      "storage_upload",
      `Storage アップロード失敗: ${uploadError.message}`,
    );
  }

  steps.storage_upload = `ok: ${BUCKET}/${path}`;
  logger.log("storage.upload", { ok: true, data: uploadData, path });

  // ----- 4. getPublicUrl -----
  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  let url = publicData.publicUrl?.trim() || "";
  logger.log("getPublicUrl.raw", { publicUrl: publicData.publicUrl ?? null });

  if (!url || !url.includes("/storage/")) {
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    if (!envUrl) {
      steps.public_url = "fail: empty public url + no env";
      logger.log("getPublicUrl", { ok: false, reason: "no env fallback" });
      return fail(logger, steps, "public_url", "公開URLの取得に失敗しました");
    }
    url = buildPublicUrl(envUrl, path);
    logger.log("getPublicUrl.fallback", { url });
  }

  steps.public_url = `ok: ${url}`;
  logger.log("getPublicUrl", { ok: true, url });

  // ----- 5. cases UPDATE (no select) -----
  let updateQuery = supabase
    .from("cases")
    .update({ product_image_url: url })
    .eq("id", caseId);

  if (session.role !== "admin") {
    updateQuery = updateQuery.eq("maker_id", session.id);
  }

  const { data: updateData, error: updateError, count } = await updateQuery
    .select("id, product_image_url, maker_id")
    .maybeSingle();

  logger.log("cases.UPDATE", {
    ok: !updateError && Boolean(updateData),
    error: updateError
      ? {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
          hint: updateError.hint,
        }
      : null,
    count: count ?? null,
    returned: updateData,
    filter: {
      caseId,
      maker_id:
        session.role !== "admin" ? session.id : "(admin: no maker filter)",
      role: session.role,
    },
    payload: { product_image_url: url },
  });

  if (updateError) {
    steps.db_update = `fail: ${updateError.message} (code=${updateError.code})`;
    return fail(
      logger,
      steps,
      "db_update",
      `DB更新失敗: ${updateError.message}`,
      { url, path },
    );
  }
  if (!updateData) {
    steps.db_update = "fail: 0 rows (RLS or id mismatch)";
    return fail(
      logger,
      steps,
      "db_update",
      "cases.product_image_url を更新できませんでした（権限または案件IDを確認）",
      { url, path },
    );
  }

  steps.db_update = `ok: id=${updateData.id} product_image_url=${updateData.product_image_url}`;
  logger.log("cases.UPDATE.returned", {
    id: updateData.id,
    product_image_url: updateData.product_image_url,
    maker_id: updateData.maker_id,
  });

  // ----- 6. SELECT after UPDATE (independent read) -----
  const { data: verifyRow, error: verifyError } = await supabase
    .from("cases")
    .select("id, product_image_url")
    .eq("id", caseId)
    .maybeSingle();

  logger.log("cases.SELECT_after_UPDATE", {
    ok: !verifyError && Boolean(verifyRow),
    error: verifyError?.message ?? null,
    row: verifyRow,
  });

  const saved =
    (verifyRow?.product_image_url as string | null | undefined)?.trim() || null;

  if (verifyError) {
    steps.db_verify = `fail: select error ${verifyError.message}`;
    return fail(
      logger,
      steps,
      "db_verify",
      `UPDATE後のSELECTに失敗: ${verifyError.message}`,
      { url, path },
    );
  }

  if (saved !== url) {
    steps.db_verify = `fail: expected=${url} got=${saved}`;
    logger.log("cases.SELECT_mismatch", { expected: url, got: saved });
    return fail(
      logger,
      steps,
      "db_verify",
      `DBにURLが保存されていません（SELECT結果: ${saved ?? "NULL"}）`,
      { url, path },
    );
  }

  steps.db_verify = `ok: product_image_url=${saved}`;
  logger.log("SUCCESS", {
    caseId,
    path,
    url: saved,
    by: session.id,
    role: session.role,
  });

  revalidateCaseImagePaths(caseId);
  return {
    ok: true,
    url: saved,
    path,
    steps,
    logs: logger.logs,
  };
}

/** Clear product_image_url (set NULL). */
export async function clearCaseProductImageAction(
  caseId: string,
): Promise<CaseImageActionResult> {
  const logger = createLogger();
  const steps: CaseImageActionResult["steps"] = {};

  const session = await getSessionUser();
  if (!session) {
    steps.auth = "fail: no session";
    return fail(logger, steps, "auth", "ログインが必要です");
  }
  if (!session.isActive) {
    steps.auth = "fail: inactive";
    return fail(logger, steps, "auth", "アカウントが停止されています");
  }
  steps.auth = `ok: ${session.role}`;
  logger.log("clear.auth", { role: session.role, userId: session.id });

  const supabase = await createClient();
  let query = supabase
    .from("cases")
    .update({ product_image_url: null })
    .eq("id", caseId);

  if (session.role !== "admin") {
    query = query.eq("maker_id", session.id);
  }

  const { data, error } = await query
    .select("id, product_image_url")
    .maybeSingle();

  logger.log("clear.UPDATE", { data, error: error?.message ?? null });

  if (error) {
    steps.db_update = `fail: ${error.message}`;
    return fail(logger, steps, "db_update", `クリア失敗: ${error.message}`);
  }
  if (!data) {
    steps.db_update = "fail: 0 rows";
    return fail(logger, steps, "db_update", "案件を更新できませんでした");
  }

  const { data: verifyRow, error: verifyError } = await supabase
    .from("cases")
    .select("id, product_image_url")
    .eq("id", caseId)
    .maybeSingle();

  logger.log("clear.SELECT_after", {
    row: verifyRow,
    error: verifyError?.message ?? null,
  });

  const saved =
    (verifyRow?.product_image_url as string | null | undefined)?.trim() || null;
  if (saved !== null) {
    steps.db_verify = `fail: still ${saved}`;
    return fail(logger, steps, "db_verify", "NULL にできませんでした");
  }
  steps.db_update = "ok";
  steps.db_verify = "ok: null";

  revalidateCaseImagePaths(caseId);
  return { ok: true, url: null, steps, logs: logger.logs };
}
