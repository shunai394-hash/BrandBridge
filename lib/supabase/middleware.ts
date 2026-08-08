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

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  if (
    process.env.NODE_ENV === "development" &&
    request.nextUrl.searchParams.get("bb_ui_probe") === "1"
  ) {
    requestHeaders.set("x-bb-admin-ui-probe", "1");
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
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

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("[MIDDLEWARE AUTH]", {
    path: request.nextUrl.pathname,
    userId: user?.id ?? null,
    email: user?.email ?? null,
    authError: authError?.message ?? null,
    cookies: request.cookies.getAll().map((cookie) => cookie.name),
  });

  const path = request.nextUrl.pathname;

  if (
    path.startsWith("/admin") ||
    path === "/cases" ||
    path.startsWith("/cases/") ||
    path.startsWith("/maker/cases")
  ) {
    supabaseResponse.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, must-revalidate",
    );
  }

  return supabaseResponse;
}


