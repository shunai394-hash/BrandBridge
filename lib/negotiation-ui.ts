import type { ApplicationStatus, PipelineStatus, UserRole } from "@/lib/types";

export type NegotiationUiLocale = "ja" | "en";

export const applicationStatusLabelsEn: Record<ApplicationStatus, string> = {
  pending: "Preparing",
  accepted: "Active",
  rejected: "Closed",
};

export const pipelineStatusLabelsEn: Record<PipelineStatus, string> = {
  in_negotiation: "In negotiation",
  terms_review: "Terms review",
  contract_prep: "Contract prep",
  won: "Won",
  closed: "Closed",
};

export function negotiationsListPathForLocale(
  role: UserRole | null | undefined,
  locale: NegotiationUiLocale,
): string {
  if (locale === "en") {
    if (role === "admin") return "/admin/negotiations";
    return "/en/negotiations";
  }
  if (role === "maker") return "/maker/negotiations";
  if (role === "partner") return "/partner/negotiations";
  if (role === "admin") return "/admin/negotiations";
  return "/negotiations";
}

export const negotiationInboxCopy = {
  en: {
    title: "Negotiations",
    subtitle:
      "Your negotiation inbox. Open a conversation to reply and manage attachments.",
    countLabel: (count: number) => `Negotiations: ${count}`,
    unreadThreads: (count: number) => `Unread threads: ${count}`,
    filters: {
      all: "All",
      unread: "Unread",
      active: "Active",
      closed: "Closed",
    },
    empty: "No negotiations yet.",
    emptyFiltered: "No negotiations match this filter.",
    emptyHintMaker:
      "Requests from Japanese sales partners will appear here.",
    emptyHintPartner: "Start a negotiation from a product page to see it here.",
    sku: "SKU",
    counterpart: "With",
    unreadCount: (n: number) => `Unread ${n}`,
    messageCount: (n: number) => `Messages ${n}`,
    noMessage: "(No messages yet)",
    statusActive: "Active",
    statusClosed: "Closed",
  },
  ja: {
    title: "交渉一覧",
    subtitle:
      "交渉インボックスです。スレッドを開いて返信・添付できます。",
    countLabel: (count: number) => `交渉件数: ${count}`,
    unreadThreads: (count: number) => `未読スレッド: ${count}`,
    filters: {
      all: "すべて",
      unread: "未読",
      active: "交渉中",
      closed: "終了",
    },
    empty: "まだ交渉がありません。",
    emptyFiltered: "該当する交渉がありません。",
    emptyHintMaker: "パートナーからの申込があるとここに表示されます。",
    emptyHintPartner: "商品詳細から「交渉する」とここに表示されます。",
    sku: "商品コード（SKU）",
    counterpart: "相手",
    unreadCount: (n: number) => `未読 ${n}件`,
    messageCount: (n: number) => `メッセージ ${n}件`,
    noMessage: "（メッセージなし）",
    statusActive: "交渉中",
    statusClosed: "終了",
  },
} as const;

export const negotiationDetailCopy = {
  en: {
    back: "← Back to negotiations",
    topic: "Subject",
    sku: "SKU:",
    counterpart: "With",
    product: "Product",
    openProduct: "View product details",
    pipelineTitle: "Deal pipeline",
    pipelineHint: "In negotiation → Terms review → Contract prep → Won / Closed",
    status: "Status",
    hasDeal: "A deal record is registered.",
    dealsLink: "View deals",
    closedNotice:
      "This negotiation is closed. You can no longer exchange messages.",
    thread: "Thread",
    partnerFallback: "Sales partner",
    you: "You",
    subjectPrefix: "Subject:",
    attachment: "Attachment",
    reply: "Reply",
  },
  ja: {
    back: "← 交渉一覧に戻る",
    topic: "件名",
    sku: "商品コード（SKU）：",
    counterpart: "相手",
    product: "商品",
    openProduct: "商品詳細を開く",
    pipelineTitle: "成約プロセス",
    pipelineHint: "交渉中 → 条件確認 → 契約準備 → 成約 / 終了",
    status: "ステータス",
    hasDeal: "成約レコードが登録されています。",
    dealsLink: "成約一覧",
    closedNotice:
      "この交渉は終了しています。メッセージのやり取りはできません。",
    thread: "スレッド",
    partnerFallback: "パートナー",
    you: "あなた",
    subjectPrefix: "件名:",
    attachment: "📎 添付",
    reply: "返信",
  },
} as const;

export const messageFormCopy = {
  en: {
    topic: "Subject",
    topicRequired: "*",
    topicPlaceholder: "e.g. Reply regarding terms",
    topicHint: (len: number, max: number) => `Required · ${len}/${max}`,
    body: "Message",
    bodyPlaceholder: "Write your reply",
    attachment: "Attachment",
    attachmentHint: "PDF / images / Word / Excel / text / CSV (max 10MB)",
    attached: "📎 Attached",
    uploadReady: "Ready to upload",
    removeAttachment: "Remove attachment",
    sending: "Sending…",
    send: "Send reply",
    errTopicRequired: "Please enter a subject.",
    errTopicMax: (max: number) => `Subject must be ${max} characters or fewer.`,
    errBodyOrFile: "Enter a message or attach a file.",
    errSendFailed: "Failed to send.",
    errSendFailedWith: (msg: string) => `Failed to send: ${msg}`,
  },
  ja: {
    topic: "件名",
    topicRequired: "*",
    topicPlaceholder: "例: 条件について回答いたします",
    topicHint: (len: number, max: number) => `必須 · ${len}/${max}`,
    body: "本文",
    bodyPlaceholder: "返信内容を入力",
    attachment: "添付",
    attachmentHint: "PDF / 画像 / Word / Excel / テキスト / CSV（最大10MB）",
    attached: "📎 添付済み",
    uploadReady: "アップロード準備完了",
    removeAttachment: "添付をやめる",
    sending: "送信中...",
    send: "返信する",
    errTopicRequired: "件名を入力してください",
    errTopicMax: (max: number) => `件名は${max}文字以内にしてください`,
    errBodyOrFile: "メッセージまたは添付ファイルを入力してください",
    errSendFailed: "送信に失敗しました",
    errSendFailedWith: (msg: string) => `送信に失敗しました: ${msg}`,
  },
} as const;

/** Map known Japanese action/validation errors to English for EN UI only. */
export function toEnglishActionError(message: string): string {
  const map: Record<string, string> = {
    "ログインが必要です": "Please sign in.",
    "アカウントが停止されています": "Your account is suspended.",
    "交渉が見つかりません": "Negotiation not found.",
    "この交渉は終了しているためメッセージを送れません":
      "This negotiation is closed; you cannot send messages.",
    "終了した交渉のステータスは変更できません":
      "You cannot change the status of a closed negotiation.",
    "会社名と担当者名は必須です":
      "Company name and contact person are required.",
    "設立年は数値で入力してください": "Year founded must be a number.",
    "商品名を入力してください": "Please enter a product name.",
    "一覧用サマリーを入力してください": "Please enter a listing summary.",
    "商品説明を入力してください": "Please enter a product description.",
    "求めるパートナー像を入力してください":
      "Please describe your ideal partner.",
    "商品提供企業の提供条件を入力してください":
      "Please enter your offer terms.",
    "カテゴリを選択してください": "Please select a category.",
    "募集エリアを選択してください": "Please select a sales area.",
    "価格条件は「固定価格」または「見積条件あり」を選択してください":
      "Please select Fixed price or Quote required.",
    "商品コード（SKU）は英数字・ハイフン・アンダースコアのみ使用できます":
      "SKU may only use letters, numbers, hyphens, and underscores.",
    "商標・ライセンス情報の値が不正です":
      "Invalid trademark / license value.",
    "独占販売可否の値が不正です": "Invalid exclusive sales value.",
    "対応形式: PDF / 画像 / Word / Excel / テキスト / CSV（10MB以下）":
      "Allowed types: PDF / images / Word / Excel / text / CSV (max 10MB)",
    "ファイルサイズは10MB以下にしてください":
      "File size must be 10MB or less.",
    "交渉IDが不正です": "Invalid negotiation ID.",
    "ログインセッションが無効です。再ログインしてください":
      "Your session is invalid. Please sign in again.",
  };
  if (map[message]) return map[message];
  if (message.startsWith("添付のアップロードに失敗しました:")) {
    return message.replace(
      "添付のアップロードに失敗しました:",
      "Attachment upload failed:",
    );
  }
  for (const [ja, en] of Object.entries(map)) {
    if (message.includes(ja)) return message.replace(ja, en);
  }
  return message;
}
