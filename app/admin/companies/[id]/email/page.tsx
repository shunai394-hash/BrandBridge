import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { AdminCompanyEmailForm } from "@/components/admin/AdminCompanyEmailForm";
import {
  companyRoleLabel,
  getAdminCompanyById,
  listCompanyEmailMessages,
} from "@/lib/admin-companies";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await getAdminCompanyById(id);
  return {
    title: company
      ? `営業メール: ${company.companyName}`
      : "企業へメール送信",
  };
}

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

/**
 * Auth: app/admin/layout.tsx (diagnoseAdminAccess) only.
 */
export default async function AdminCompanyEmailPage({ params }: PageProps) {
  noStore();
  const { id } = await params;
  const [company, history] = await Promise.all([
    getAdminCompanyById(id),
    listCompanyEmailMessages(id),
  ]);
  if (!company) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/admin/companies"
        className="text-sm text-teal hover:underline"
      >
        ← 企業一覧
      </Link>

      <h1 className="mt-4 font-[family-name:var(--font-shippori)] text-3xl text-navy">
        企業へメール送信
      </h1>
      <p className="mt-2 text-sm text-muted">
        {company.companyName} ／ {company.contactName} ／{" "}
        {companyRoleLabel(company.role)}
      </p>

      <AdminCompanyEmailForm
        companyId={company.id}
        recipientEmail={company.email}
        companyName={company.companyName}
      />

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          送信履歴
        </h2>
        {history.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-border bg-surface px-5 py-6 text-sm text-muted">
            まだ送信履歴はありません。
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {history.map((msg) => (
              <li
                key={msg.id}
                className="rounded-lg border border-border bg-surface p-5 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={
                      msg.status === "sent"
                        ? "font-medium text-teal"
                        : "font-medium text-red-600"
                    }
                  >
                    {msg.status === "sent" ? "送信成功" : "送信失敗"}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-navy">件名: {msg.subject}</p>
                <p className="mt-1 text-xs text-muted">
                  宛先: {msg.recipientEmail}
                </p>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed text-muted">
                  {msg.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
