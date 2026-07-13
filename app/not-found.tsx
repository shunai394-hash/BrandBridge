import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
      <p className="text-sm font-medium tracking-wide text-teal">404</p>
      <h1 className="mt-3 font-[family-name:var(--font-shippori)] text-3xl text-navy">
        ページが見つかりません
      </h1>
      <p className="mt-4 leading-relaxed text-muted">
        お探しのページは削除されたか、URLが変更された可能性があります。トップや案件一覧からお探しください。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">トップへ</Button>
        <Button href="/cases" variant="outline">
          案件一覧へ
        </Button>
        <Button href="/contact" variant="ghost">
          お問い合わせ
        </Button>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/login" className="text-teal hover:underline">
          ログイン
        </Link>
        <Link href="/terms" className="text-muted hover:text-teal hover:underline">
          利用規約
        </Link>
        <Link
          href="/privacy"
          className="text-muted hover:text-teal hover:underline"
        >
          プライバシー
        </Link>
      </div>
    </div>
  );
}
