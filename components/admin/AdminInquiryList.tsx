import Link from "next/link";
import {
  inquiryCategoryLabel,
  inquiryReplyStatusLabel,
  type AdminInquiry,
} from "@/lib/admin-inquiries";

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
  const oneLine = message.replace(/\s+/g, " ").trim();
  return oneLine.length > 80 ? `${oneLine.slice(0, 80)}…` : oneLine;
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
          {items.map((item) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
