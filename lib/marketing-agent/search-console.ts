import { createSign, createPrivateKey } from "crypto";
import type {
  GscConnectionStatus,
  SearchConsoleResult,
  SearchConsoleRow,
} from "@/lib/marketing-agent/types";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";

type ServiceAccount = {
  client_email?: string;
  private_key?: string;
};

function normalizePem(raw: string): string {
  return raw.replace(/\\n/g, "\n").replace(/^["']|["']$/g, "").trim();
}

function parseServiceAccount(): ServiceAccount | null {
  const jsonRaw = process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonRaw) {
    try {
      return JSON.parse(jsonRaw) as ServiceAccount;
    } catch {
      return null;
    }
  }
  const email = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?.trim();
  const key = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.trim();
  if (email && key) {
    return { client_email: email, private_key: normalizePem(key) };
  }
  return null;
}

export function getGscSiteUrl(): string | null {
  const explicit = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim();
  if (explicit) return explicit;
  return null;
}

export function isSearchConsoleConfigured(): boolean {
  const account = parseServiceAccount();
  return Boolean(
    account?.client_email && account.private_key && getGscSiteUrl(),
  );
}

export function getSearchConsoleConnection(): GscConnectionStatus {
  return {
    configured: isSearchConsoleConfigured(),
    siteUrl: getGscSiteUrl(),
  };
}

function signJwt(payload: Record<string, unknown>, privateKeyPem: string): string {
  const header = { alg: "RS256", typ: "JWT" };
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const data = `${encode(header)}.${encode(payload)}`;
  const key = createPrivateKey(normalizePem(privateKeyPem));
  const signer = createSign("RSA-SHA256");
  signer.update(data);
  signer.end();
  const signature = signer.sign(key).toString("base64url");
  return `${data}.${signature}`;
}

async function getAccessToken(account: ServiceAccount): Promise<string> {
  if (!account.client_email || !account.private_key) {
    throw new MarketingAgentError(
      "GSC_NOT_CONFIGURED",
      "Search Console未接続です。サービスアカウントを設定してください。",
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const jwt = signJwt(
    {
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    },
    account.private_key,
  );

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new MarketingAgentError(
        "GSC_AUTH_ERROR",
        `Search Console 認証に失敗しました (${response.status}): ${text.slice(0, 240)}`,
      );
    }
    const payload = JSON.parse(text) as { access_token?: string };
    if (!payload.access_token) {
      throw new MarketingAgentError(
        "GSC_AUTH_ERROR",
        "Search Console のアクセストークンを取得できませんでした。",
      );
    }
    return payload.access_token;
  } catch (error) {
    if (error instanceof MarketingAgentError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new MarketingAgentError(
        "GSC_TIMEOUT",
        "Search Console 認証がタイムアウトしました。",
      );
    }
    throw new MarketingAgentError(
      "GSC_AUTH_ERROR",
      error instanceof Error ? error.message : "Search Console 認証エラー",
    );
  } finally {
    clearTimeout(timer);
  }
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function defaultGscRange(days = 28): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(end.getUTCDate() - days);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

export async function fetchSearchConsolePerformance(input?: {
  startDate?: string;
  endDate?: string;
  rowLimit?: number;
}): Promise<SearchConsoleResult> {
  const siteUrl = getGscSiteUrl();
  const account = parseServiceAccount();
  const range = defaultGscRange();
  const startDate = input?.startDate || range.startDate;
  const endDate = input?.endDate || range.endDate;

  if (!account || !siteUrl) {
    return {
      configured: false,
      siteUrl,
      startDate,
      endDate,
      rows: [],
      error: "Search Console未接続",
    };
  }

  try {
    const token = await getAccessToken(account);
    const encodedSite = encodeURIComponent(siteUrl);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);

    let response: Response;
    try {
      response = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate,
            endDate,
            dimensions: ["query", "page"],
            rowLimit: input?.rowLimit ?? 250,
          }),
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timer);
    }

    const text = await response.text();
    if (!response.ok) {
      return {
        configured: true,
        siteUrl,
        startDate,
        endDate,
        rows: [],
        error: `Search Console API error ${response.status}: ${text.slice(0, 300)}`,
      };
    }

    const payload = JSON.parse(text) as {
      rows?: Array<{
        keys?: string[];
        clicks?: number;
        impressions?: number;
        ctr?: number;
        position?: number;
      }>;
    };

    const rows: SearchConsoleRow[] = (payload.rows ?? []).map((row) => ({
      query: row.keys?.[0] ?? "",
      page: row.keys?.[1] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));

    return {
      configured: true,
      siteUrl,
      startDate,
      endDate,
      rows,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search Console 取得に失敗しました";
    return {
      configured: true,
      siteUrl,
      startDate,
      endDate,
      rows: [],
      error: message,
    };
  }
}
