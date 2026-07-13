import type { Metadata } from "next";
import Link from "next/link";
import { MakerRegisterForm } from "@/components/forms/MakerRegisterForm";

export const metadata: Metadata = {
  title: "メーカー登録",
  description:
    "BrandBridgeへのメーカー登録。アカウント作成と商品案件情報の入力で、販売パートナーとのマッチングを始められます。",
};

export default function MakerRegisterPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-wider text-teal">
          FOR MAKERS
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          メーカー登録
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          アカウント作成に加え、マッチング用の商品案件情報を入力します。登録無料・初期費用なし。
        </p>
        <p className="mt-2 text-sm text-muted">
          まだ検討中の方は{" "}
          <Link href="/for-makers" className="text-teal hover:underline">
            メーカー向けページ
          </Link>
          をご覧ください。
        </p>
      </header>
      <MakerRegisterForm />
    </div>
  );
}
