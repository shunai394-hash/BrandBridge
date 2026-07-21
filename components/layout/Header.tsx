import { headers } from "next/headers";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { getSessionUser } from "@/lib/auth";
import { negotiationsListPath } from "@/lib/negotiation-paths";
import { countNegotiationsForUser } from "@/lib/negotiations";

function isEnglishPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === "/en" || pathname.startsWith("/en/");
}

/**
 * Sole site header (app/layout.tsx).
 * Labels for /en/* are decided in HeaderNav from the live pathname.
 */
export async function Header() {
  const pathname = (await headers()).get("x-pathname");
  const serverIsEnglish = isEnglishPath(pathname);
  const user = await getSessionUser();

  if (!user) {
    return (
      <HeaderNav
        user={null}
        negoPath={null}
        negoTotal={0}
        negoUnread={0}
        serverIsEnglish={serverIsEnglish}
      />
    );
  }

  const negoPath = negotiationsListPath(user.role);
  const { total, unread } =
    user.role === "admin"
      ? { total: 0, unread: 0 }
      : await countNegotiationsForUser(user);

  return (
    <HeaderNav
      user={{ role: user.role }}
      negoPath={negoPath}
      negoTotal={total}
      negoUnread={unread}
      serverIsEnglish={serverIsEnglish}
    />
  );
}
