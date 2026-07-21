import Link from "next/link";
import {
  inquiryCategoryLabel,
  inquiryReplyStatusLabel,
  type AdminInquiry,
} from "@/lib/admin-inquiries";
import {
  extractInquiryProductId,
  extractInquiryProductName,
  inquiryLanguageLabel,
} from "@/lib/inquiry-language";

type AdminInquiryListProps = {
  items: AdminInquiry[];
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function previewMessage(message: string): string {
  const oneLine = message
    .replace(/\[lang:en\]/g, "")
    .replace(/\[English inquiry \/ Overseas brand\]/g, "")
    .replace(/^Source:\s*\/en\/contact(?:\?product=[^\s]*)?\s*/im, "")
    .replace(/^Product ID:\s*[^\n]+\s*/im, "")
    .replace(/^Product Name:\s*[^\n]+\s*/im, "")
    .replace(/\s+/g, " ")
    .trim();
  return oneLine.length > 80 ? `${oneLine.slice(0, 80)}…` : oneLine;
}

function LanguageBadge({ message }: { message: string }) {
  const label = inquiryLanguageLabel(message);
  const isEn = label === "English";
  return (
    <span
      className={
        isEn
          ? "inline-flex rounded-md bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy"
          : "inline-flex rounded-md bg-cream px-2 py-0.5 text-xs font-medium text-muted"
      }
    >
      {label}
    </span>
  );
}

function productCell(message: string) {
  const productId = extractInquiryProductId(message);
  const productName = extractInquiryProductName(message);
  if (!productId && !productName) return "—";
  return (
    <div className="max-w-[14rem]">
      {productName ? (
        <p className="font-medium text-navy">{productName}</p>
      ) : null}
      {productId ? (
        <Link
          href={`/en/cases/${productId}`}
          prefetch={false}
          className="font-mono text-xs text-teal hover:underline"
          title="英語商品詳細"
        >
          {productId}
        </Link>
      ) : null}
    </div>
  );
}

export function AdminInquiryList({ items }: AdminInquiryListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
        お問い合わせはまだありません。
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-cream/50 text-xs text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">ステータス</th>
            <th className="px-4 py-3 font-medium">Language</th>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">会社名</th>
            <th className="px-4 py-3 font-medium">担当者名</th>
            <th className="px-4 py-3 font-medium">メール</th>
            <th className="px-4 py-3 font-medium">カテゴリ</th>
            <th className="px-4 py-3 font-medium">内容</th>
            <th className="px-4 py-3 font-medium">作成日時</th>
            <th className="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            return (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  {item.replyStatus === "replied" ? (
                    <span className="inline-flex rounded-md bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal-dark">
                      {inquiryReplyStatusLabel(item.replyStatus)}
                    </span>
                  ) : (
                    <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                      {inquiryReplyStatusLabel(item.replyStatus)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <LanguageBadge message={item.message} />
                </td>
                <td className="px-4 py-3 text-muted">
                  {productCell(item.message)}
                </td>
                <td className="px-4 py-3 font-medium text-navy">
                  {item.companyName?.trim() || "—"}
                </td>
                <td className="px-4 py-3 text-navy">{item.contactName}</td>
                <td className="px-4 py-3 text-muted">
                  <a
                    href={`mailto:${item.email}`}
                    className="hover:text-teal hover:underline"
                  >
                    {item.email}
                  </a>
                </td>
                <td className="px-4 py-3 text-muted">
                  {inquiryCategoryLabel(item.category)}
                </td>
                <td className="max-w-xs px-4 py-3 text-muted">
                  {previewMessage(item.message)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/inquiries/${item.id}`}
                    prefetch={false}
                    className="font-medium text-teal hover:underline"
                  >
                    詳細
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
