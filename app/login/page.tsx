import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "ログイン",
  description: "BrandBridgeへのログインページです。",
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
    role?: string;
    uid?: string;
    detail?: string;
  }>;
};

function messageFromParams(params: {
  error?: string;
  role?: string;
  uid?: string;
  detail?: string;
}): { kind: "login" | "permission" | ""; text: string } {
  switch (params.error) {
    case "NO_AUTH_USER":
      return {
        kind: "login",
        text: "セッションがありません（Authユーザーなし）。メールとパスワードで再ログインしてください。",
      };
    case "NO_PROFILE":
      return {
        kind: "permission",
        text: `ログイン状態ですが profiles がありません。user.id=${params.uid ?? "不明"}。profiles 行を作成し role='admin' を設定してください。`,
      };
    case "ROLE_INSUFFICIENT":
      return {
        kind: "permission",
        text: `ログイン状態ですが admin 権限がありません。現在の role=${params.role ?? "不明"} / user.id=${params.uid ?? "不明"}。SQLで role='admin' に更新してください。`,
      };
    case "ACCOUNT_INACTIVE":
      return {
        kind: "permission",
        text: "ログイン状態ですがアカウントが停止されています（is_active=false）。",
      };
    case "email_unconfirmed":
      return {
        kind: "login",
        text: "メール認証が完了していません。確認メールのリンクを開いてからログインしてください。",
      };
    case "auth_callback":
      return {
        kind: "login",
        text: params.detail
          ? `認証コールバックに失敗しました: ${params.detail}`
          : "認証コールバックに失敗しました。もう一度お試しください。",
      };
    case "oauth":
      return {
        kind: "login",
        text: params.detail
          ? `Googleログインに失敗しました: ${params.detail}`
          : "Googleログインに失敗しました。Supabase で Google Provider が有効か、Redirect URLs に /auth/callback があるかを確認してください。",
      };
    default:
      return { kind: "", text: "" };
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initial = messageFromParams({
    error: params.error,
    role: params.role,
    uid: params.uid,
    detail: params.detail,
  });

  return (
    <div className="mx-auto max-w-md px-5 py-12 md:py-16">
      <header className="mb-8 text-center">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          ログイン
        </h1>
        <p className="mt-3 text-sm text-muted">
          メール／パスワード、または Google でログインできます。初回はセットアップへ進みます。
        </p>
      </header>
      <LoginForm
        nextPath={params.next}
        initialError={initial.text}
        initialKind={initial.kind}
      />
    </div>
  );
}
