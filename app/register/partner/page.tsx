import type { Metadata } from "next";
import Link from "next/link";
import { PartnerRegisterForm } from "@/components/forms/PartnerRegisterForm";

export const metadata: Metadata = {
  title: "販売パートナー登録",
  description:
    "BrandBridgeへの販売パートナー登録。販路・希望条件を入力し、新しい商材とのマッチングを始められます。",
};

export default function PartnerRegisterPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR PARTNERS
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          販売パートナー登録
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          アカウント作成に加え、マッチング用のプロフィール（販路・希望条件）を入力します。途中保存も可能です。
        </p>
        <p className="mt-2 text-sm text-muted">
          まだ検討中の方は{" "}
          <Link href="/for-partners" className="text-teal hover:underline">
            バイヤー向けページ
          </Link>
          をご覧ください。
        </p>
      </header>
      <PartnerRegisterForm />
    </div>
  );
}
