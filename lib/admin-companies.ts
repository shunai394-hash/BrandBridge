import { createClient } from "@/lib/supabase/server";
import { sendCompanyOutreachEmail } from "@/lib/sendContactEmail";
import type { UserRole } from "@/lib/types";

export type AdminCompany = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastEmailStatus: "sent" | "failed" | null;
  lastEmailAt: string | null;
};

export type CompanyEmailMessage = {
  id: string;
  companyId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  status: "sent" | "failed";
  createdAt: string;
};

type ProfileRow = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  role: string;
  is_active: boolean | null;
  created_at: string;
};

type EmailRow = {
  id: string;
  company_id: string;
  recipient_email: string;
  subject: string;
  body: string;
  status: "sent" | "failed";
  created_at: string;
};

const roleLabels: Record<string, string> = {
  maker: "商品提供企業",
  partner: "販売パートナー",
  admin: "管理者",
};

export function companyRoleLabel(role: string): string {
  return roleLabels[role] ?? role;
}

export async function listAdminCompanies(): Promise<{
  items: AdminCompany[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, company_name, contact_name, email, role, is_active, created_at",
    )
    .in("role", ["maker", "partner"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listAdminCompanies]", error.message);
    return { items: [], error: error.message };
  }

  const rows = (data ?? []) as ProfileRow[];
  const ids = rows.map((r) => r.id);
  const lastByCompany = new Map<
    string,
    { status: "sent" | "failed"; createdAt: string }
  >();

  if (ids.length > 0) {
    const { data: emails, error: emailError } = await supabase
      .from("company_email_messages")
      .select("company_id, status, created_at")
      .in("company_id", ids)
      .order("created_at", { ascending: false });

    if (emailError) {
      console.error("[listAdminCompanies] emails", emailError.message);
    } else {
      for (const row of emails ?? []) {
        const companyId = row.company_id as string;
        if (lastByCompany.has(companyId)) continue;
        lastByCompany.set(companyId, {
          status: row.status as "sent" | "failed",
          createdAt: row.created_at as string,
        });
      }
    }
  }

  return {
    items: rows.map((p) => {
      const last = lastByCompany.get(p.id) ?? null;
      return {
        id: p.id,
        companyName: p.company_name,
        contactName: p.contact_name,
        email: p.email,
        role: p.role as UserRole,
        isActive: p.is_active !== false,
        createdAt: p.created_at,
        lastEmailStatus: last?.status ?? null,
        lastEmailAt: last?.createdAt ?? null,
      };
    }),
  };
}

export async function getAdminCompanyById(
  id: string,
): Promise<AdminCompany | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, company_name, contact_name, email, role, is_active, created_at",
    )
    .eq("id", id)
    .in("role", ["maker", "partner"])
    .maybeSingle();

  if (error) {
    console.error("[getAdminCompanyById]", error.message);
    return null;
  }
  if (!data) return null;

  const p = data as ProfileRow;
  const { data: lastEmail } = await supabase
    .from("company_email_messages")
    .select("status, created_at")
    .eq("company_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    id: p.id,
    companyName: p.company_name,
    contactName: p.contact_name,
    email: p.email,
    role: p.role as UserRole,
    isActive: p.is_active !== false,
    createdAt: p.created_at,
    lastEmailStatus: (lastEmail?.status as "sent" | "failed" | undefined) ?? null,
    lastEmailAt: (lastEmail?.created_at as string | undefined) ?? null,
  };
}

export async function listCompanyEmailMessages(
  companyId: string,
): Promise<CompanyEmailMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_email_messages")
    .select(
      "id, company_id, recipient_email, subject, body, status, created_at",
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listCompanyEmailMessages]", error.message);
    return [];
  }

  return ((data ?? []) as EmailRow[]).map((row) => ({
    id: row.id,
    companyId: row.company_id,
    recipientEmail: row.recipient_email,
    subject: row.subject,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function sendCompanyEmail(input: {
  companyId: string;
  subject: string;
  body: string;
}): Promise<{ error?: string }> {
  const subject = input.subject.trim();
  const body = input.body.trim();

  if (!subject || subject.length > 200) {
    return { error: "件名を正しく入力してください（200文字以内）" };
  }
  if (!body) {
    return { error: "本文を入力してください" };
  }
  if (body.length > 10000) {
    return { error: "本文が長すぎます" };
  }

  const company = await getAdminCompanyById(input.companyId);
  if (!company) {
    return { error: "企業が見つかりません" };
  }
  if (!company.email?.trim()) {
    return { error: "企業のメールアドレスが登録されていません" };
  }

  const mail = await sendCompanyOutreachEmail({
    to: company.email,
    subject,
    body,
  });

  const supabase = await createClient();
  const status = mail.ok ? "sent" : "failed";
  const { error: saveError } = await supabase
    .from("company_email_messages")
    .insert({
      company_id: input.companyId,
      recipient_email: company.email,
      subject,
      body,
      status,
    });

  if (saveError) {
    console.error("[sendCompanyEmail] history save", saveError.message);
    if (mail.ok) {
      return {
        error:
          "メールは送信されましたが、履歴の保存に失敗しました。画面を更新して確認してください。",
      };
    }
  }

  if (!mail.ok) {
    return {
      error: `メール送信に失敗しました: ${mail.error ?? "unknown"}`,
    };
  }

  return {};
}
