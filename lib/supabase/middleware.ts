import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_OPTIONS } from "@/lib/supabase/cookie-options";

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("placeholder") &&
      !key.includes("placeholder"),
  );
}

/**
 * Refresh the auth session on every matched request and write updated
 * cookies (access + refresh tokens) back to the browser.
 */
export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  // Dev-only UI check on the same path (no redirect to another page).
  if (
    process.env.NODE_ENV === "development" &&
    request.nextUrl.searchParams.get("bb_ui_probe") === "1"
  ) {
    requestHeaders.set("x-bb-admin-ui-probe", "1");
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: AUTH_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        },
      },
    },
  );

  // Validates JWT and refreshes when expired — keeps session across restarts
  await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/admin")) {
    supabaseResponse.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, must-revalidate",
    );
  }

  return supabaseResponse;
}
