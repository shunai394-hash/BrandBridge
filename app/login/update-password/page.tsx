import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/forms/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "新しいパスワード",
  description: "BrandBridgeの新しいパスワードを設定します。",
};

export default function UpdatePasswordPage() {
  return (
    <div className="mx-auto max-w-md px-5 py-12 md:py-16">
      <header className="mb-8 text-center">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          新しいパスワード
        </h1>
        <p className="mt-3 text-sm text-muted">
          メールのリンクから到達した方のみ、ここでパスワードを更新できます。
        </p>
      </header>
      <UpdatePasswordForm />
    </div>
  );
}
