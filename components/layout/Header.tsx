import { headers } from "next/headers";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { getSessionUser } from "@/lib/auth";
import { negotiationsListPath } from "@/lib/negotiation-paths";
import { countNegotiationsForUser } from "@/lib/negotiations";

function isEnglishPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === "/en" || pathname.startsWith("/en/");
}

type HeaderMode = "default" | "en-only";

/**
 * default: used by root layout — hides itself on /en/* (en layout owns nav)
 * en-only: used by app/en/layout — always English labels
 */
export async function Header({ mode = "default" }: { mode?: HeaderMode }) {
  const pathname = (await headers()).get("x-pathname");
  const serverIsEnglish = isEnglishPath(pathname);
  const user = await getSessionUser();

  const negoPath = user ? negotiationsListPath(user.role) : null;
  const counts =
    user && user.role !== "admin"
      ? await countNegotiationsForUser(user)
      : { total: 0, unread: 0 };

  return (
    <HeaderNav
      user={user ? { role: user.role } : null}
      negoPath={negoPath}
      negoTotal={counts.total}
      negoUnread={counts.unread}
      serverIsEnglish={serverIsEnglish}
      forceEnglish={mode === "en-only"}
      hideOnEnglishRoutes={mode === "default"}
    />
  );
}
