import type { SearchConsoleStatus } from "./types";

/**
 * Google Search Console — optional. Missing credentials = 未接続.
 * Uses a service-account JWT against the Search Analytics API.
 */

function getGscConfig(): {
  siteUrl: string;
  clientEmail: string;
  privateKey: string;
} | null {
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim();
  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  ).trim();
  if (!siteUrl || !clientEmail || !privateKey) return null;
  return { siteUrl, clientEmail, privateKey };
}

function b64url(input: ArrayBuffer | Uint8Array | string): string {
  const buf =
    typeof input === "string"
      ? Buffer.from(input)
      : Buffer.from(input instanceof Uint8Array ? input : new Uint8Array(input));
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function signJwt(email: string, keyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const data = `${header}.${payload}`;
  const crypto = await import("node:crypto");
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(data);
  const sig = signer.sign(keyPem);
  return `${data}.${b64url(sig)}`;
}

export function getSearchConsoleConnection(): SearchConsoleStatus {
  const cfg = getGscConfig();
  if (!cfg) {
    return {
      connected: false,
      message:
        "Search Console 未接続。GOOGLE_SEARCH_CONSOLE_* を設定するとキーワードデータが機会発見に使われます。",
    };
  }
  return {
    connected: true,
    message: `Search Console 接続設定あり（${cfg.siteUrl}）`,
  };
}

export async function fetchSearchConsoleRows(): Promise<SearchConsoleStatus> {
  const cfg = getGscConfig();
  if (!cfg) return getSearchConsoleConnection();

  try {
    const jwt = await signJwt(cfg.clientEmail, cfg.privateKey);
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });
    if (!tokenRes.ok) {
      return {
        connected: false,
        message: `Search Console トークン取得失敗（HTTP ${tokenRes.status}）`,
      };
    }
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    const access = tokenJson.access_token;
    if (!access) {
      return { connected: false, message: "Search Console アクセストークンなし" };
    }

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 28);
    const iso = (d: Date) => d.toISOString().slice(0, 10);

    const analyticsRes = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(cfg.siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: iso(start),
          endDate: iso(end),
          dimensions: ["query", "country"],
          rowLimit: 25,
        }),
      },
    );

    if (!analyticsRes.ok) {
      return {
        connected: false,
        message: `Search Console 取得失敗（HTTP ${analyticsRes.status}）`,
      };
    }

    const analytics = (await analyticsRes.json()) as {
      rows?: {
        keys?: string[];
        clicks?: number;
        impressions?: number;
        ctr?: number;
        position?: number;
      }[];
    };

    return {
      connected: true,
      message: `Search Console 直近28日 ${analytics.rows?.length ?? 0} 行`,
      rows: (analytics.rows ?? []).map((row) => ({
        keys: row.keys ?? [],
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: row.position ?? 0,
      })),
    };
  } catch (error) {
    return {
      connected: false,
      message:
        error instanceof Error
          ? `Search Console エラー: ${error.message}`
          : "Search Console エラー",
    };
  }
}
