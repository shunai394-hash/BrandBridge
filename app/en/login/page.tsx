import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to BrandBridge to manage products and negotiations.",
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
        text: "No active session. Please sign in with your email and password.",
      };
    case "NO_PROFILE":
      return {
        kind: "permission",
        text: `You are signed in but no profile was found (user.id=${params.uid ?? "unknown"}).`,
      };
    case "ROLE_INSUFFICIENT":
      return {
        kind: "permission",
        text: `You are signed in but do not have admin access (role=${params.role ?? "unknown"}).`,
      };
    case "ACCOUNT_INACTIVE":
      return {
        kind: "permission",
        text: "Your account is suspended.",
      };
    case "email_unconfirmed":
      return {
        kind: "login",
        text: "Please confirm your email before signing in.",
      };
    case "auth_callback":
      return {
        kind: "login",
        text: params.detail
          ? `Authentication failed: ${params.detail}`
          : "Authentication failed. Please try again.",
      };
    case "oauth":
      return {
        kind: "login",
        text: params.detail
          ? `Google sign-in failed: ${params.detail}`
          : "Google sign-in failed. Please try again.",
      };
    default:
      return { kind: "", text: "" };
  }
}

export default async function EnglishLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initial = messageFromParams({
    error: params.error,
    role: params.role,
    uid: params.uid,
    detail: params.detail,
  });

  return (
    <div className="mx-auto max-w-md px-5 py-12 md:py-16" lang="en">
      <header className="mb-8 text-center">
        <h1 className="font-[family-name:var(--font-shippori)] text-3xl text-navy md:text-4xl">
          Login
        </h1>
        <p className="mt-3 text-sm text-muted">
          Sign in with email and password, or Google. New accounts continue to
          product setup.
        </p>
      </header>
      <LoginForm
        nextPath={params.next}
        initialError={initial.text}
        initialKind={initial.kind}
        locale="en"
      />
    </div>
  );
}
