import type { Metadata } from "next";
import { PartnerRegisterForm } from "@/components/forms/PartnerRegisterForm";

export const metadata: Metadata = {
  title: "販売パートナー登録",
  description: "BrandBridgeへの販売パートナー登録ページです。",
};

export default function PartnerRegisterPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          販売パートナー登録
        </h1>
        <p className="mt-3 text-muted">
          取り扱い商材を探している販売パートナーのアカウントを作成します。
        </p>
      </header>
      <PartnerRegisterForm />
    </div>
  );
}
