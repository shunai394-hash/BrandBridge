import type { Metadata } from "next";
import { MakerRegisterForm } from "@/components/forms/MakerRegisterForm";

export const metadata: Metadata = {
  title: "メーカー登録",
  description: "BrandBridgeへのメーカー企業登録ページです。",
};

export default function MakerRegisterPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          メーカー登録
        </h1>
        <p className="mt-3 text-muted">
          製品の販路を広げたいメーカー企業のアカウントを作成します。
        </p>
      </header>
      <MakerRegisterForm />
    </div>
  );
}
