import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Shared auth cookie options for browser / server / middleware / OAuth callback.
 * maxAge keeps the refresh-token cookie across browser & PC restarts
 * (Chrome caps persistent cookies at ~400 days).
 */
export const AUTH_COOKIE_OPTIONS: CookieOptionsWithName = {
  path: "/",
  sameSite: "lax",
  // Must stay false so createBrowserClient can read session via document.cookie
  httpOnly: false,
  // Persist across browser restarts (session cookies would vanish on close)
  maxAge: 400 * 24 * 60 * 60,
  // Secure cookies on HTTPS only (localhost HTTP must omit Secure)
  secure: process.env.NODE_ENV === "production",
};
