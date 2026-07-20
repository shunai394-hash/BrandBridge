import { createClient } from "@/lib/supabase/server";
import type { ContactCategory } from "@/lib/contact-types";
import { contactCategoryOptions } from "@/lib/contact-types";

export type AdminInquiry = {
  id: string;
  companyName: string | null;
  contactName: string;
  email: string;
  category: ContactCategory;
  message: string;
  userId: string | null;
  createdAt: string;
};

type ContactInquiryRow = {
  id: string;
  name: string;
  email: string;
  company_name: string | null;
  category: string;
  message: string;
  user_id: string | null;
  created_at: string;
};

export function inquiryCategoryLabel(category: string): string {
  return (
    contactCategoryOptions.find((item) => item.value === category)?.label ??
    category
  );
}

function mapRow(row: ContactInquiryRow): AdminInquiry {
  return {
    id: row.id,
    companyName: row.company_name,
    contactName: row.name,
    email: row.email,
    category: row.category as ContactCategory,
    message: row.message,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

export async function listAdminInquiries(): Promise<{
  items: AdminInquiry[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_inquiries")
    .select(
      "id, name, email, company_name, category, message, user_id, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listAdminInquiries]", error.message);
    return { items: [], error: error.message };
  }

  return {
    items: ((data ?? []) as ContactInquiryRow[]).map(mapRow),
  };
}

export async function getAdminInquiryById(
  id: string,
): Promise<AdminInquiry | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_inquiries")
    .select(
      "id, name, email, company_name, category, message, user_id, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getAdminInquiryById]", error.message);
    return null;
  }
  if (!data) return null;
  return mapRow(data as ContactInquiryRow);
}
