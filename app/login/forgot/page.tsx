import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "パスワード再設定",
  description: "BrandBridgeのパスワード再設定メールを送信します。",
};

type ForgotPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPageProps) {
  const params = await searchParams;
  const sessionHint =
    params.error === "session"
      ? "再設定用のセッションが見つかりませんでした。もう一度メールを送信してください。"
      : "";

  return (
    <div className="mx-auto max-w-md px-5 py-12 md:py-16">
      <header className="mb-8 text-center">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          パスワード再設定
        </h1>
        <p className="mt-3 text-sm text-muted">
          登録メール宛にリセット用リンクを送ります。
        </p>
      </header>
      {sessionHint ? (
        <p
          className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
          role="status"
        >
          {sessionHint}
        </p>
      ) : null}
      <ForgotPasswordForm />
    </div>
  );
}
