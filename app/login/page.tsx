import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "ログイン",
  description: "BrandBridgeへのログインページです。",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-5 py-12 md:py-16">
      <header className="mb-8 text-center">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          ログイン
        </h1>
        <p className="mt-3 text-sm text-muted">
          登録済みのメールアドレスとパスワードでログインしてください。
        </p>
      </header>
      <LoginForm nextPath={next} />
    </div>
  );
}
