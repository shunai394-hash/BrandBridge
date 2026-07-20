import Link from "next/link";
import {
  companyRoleLabel,
  type AdminCompany,
} from "@/lib/admin-companies";
import { Button } from "@/components/ui/Button";

type AdminCompanyListProps = {
  items: AdminCompany[];
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

export function AdminCompanyList({ items }: AdminCompanyListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
        登録企業がありません。
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-cream/50 text-xs text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">会社名</th>
            <th className="px-4 py-3 font-medium">担当者</th>
            <th className="px-4 py-3 font-medium">メール</th>
            <th className="px-4 py-3 font-medium">種別</th>
            <th className="px-4 py-3 font-medium">ステータス</th>
            <th className="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium text-navy">
                {item.companyName}
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
                {companyRoleLabel(item.role)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  {item.isActive ? (
                    <span className="text-teal">有効</span>
                  ) : (
                    <span className="text-red-600">停止</span>
                  )}
                  {item.lastEmailStatus === "sent" ? (
                    <span className="text-xs text-muted">
                      営業メール送信済
                      {item.lastEmailAt
                        ? `（${formatDate(item.lastEmailAt)}）`
                        : ""}
                    </span>
                  ) : item.lastEmailStatus === "failed" ? (
                    <span className="text-xs text-red-600">
                      前回送信失敗
                    </span>
                  ) : (
                    <span className="text-xs text-muted">未送信</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <Button
                  href={`/admin/companies/${item.id}/email`}
                  prefetch={false}
                  variant="outline"
                  className="px-3 py-1.5 text-xs"
                >
                  メール送信
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
