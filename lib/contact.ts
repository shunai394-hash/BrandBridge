import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import type { ContactInput } from "@/lib/contact-types";
import { sendContactEmail } from "@/lib/sendContactEmail";

export async function createContactInquiry(
  input: ContactInput,
): Promise<{ error?: string }> {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  const companyName = input.companyName?.trim() || null;

  if (!name || name.length > 100) {
    return { error: "お名前を正しく入力してください" };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return { error: "メールアドレスを正しく入力してください" };
  }
  if (!message || message.length < 10) {
    return { error: "お問い合わせ内容は10文字以上で入力してください" };
  }
  if (message.length > 5000) {
    return { error: "お問い合わせ内容が長すぎます" };
  }

  const user = await getSessionUser();
  const supabase = await createClient();
  const { error } = await supabase.from("contact_inquiries").insert({
    name,
    email,
    company_name: companyName,
    category: input.category,
    message,
    user_id: user?.id ?? null,
  });

  if (error) {
    console.error("[createContactInquiry]", error.message);
    return { error: "送信に失敗しました。時間をおいて再度お試しください。" };
  }

  // DB 保存成功後に管理者通知。メール失敗でも問い合わせ自体は成功扱い。
  const mail = await sendContactEmail({
    name,
    email,
    companyName,
    category: input.category,
    message,
  });
  if (!mail.ok) {
    console.error(
      "[createContactInquiry] notify email failed (inquiry saved):",
      mail.error,
    );
  }

  return {};
}
