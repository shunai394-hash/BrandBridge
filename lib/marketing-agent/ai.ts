import { parseJsonRecord } from "@/lib/marketing-agent/json";
import { redactSecrets } from "@/lib/marketing-agent/redact";

export class MarketingAgentError extends Error {
  readonly code: string;
  readonly stage?: string;

  constructor(code: string, message: string, stage?: string) {
    super(message);
    this.name = "MarketingAgentError";
    this.code = code;
    this.stage = stage;
  }
}

export type AiProvider = "groq" | "openai";

const DEFAULT_AI_BASE = "https://api.groq.com/openai/v1";
const DEFAULT_AI_MODEL = "llama-3.3-70b-versatile";
const MISSING_KEY_MESSAGE =
  "AI APIが設定されていません。AI_API_KEYをサーバー環境変数に設定してください。";

type ProviderConfig = {
  provider: AiProvider;
  apiKey: string;
  base: string;
  model: string;
};

function trimSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function inferProvider(base: string): AiProvider {
  try {
    const host = new URL(base).hostname.toLowerCase();
    if (host === "api.groq.com" || host.endsWith(".groq.com")) return "groq";
  } catch {
    /* invalid URL → treat as OpenAI-compatible */
  }
  return "openai";
}

function providerConfig(): ProviderConfig {
  const apiKey =
    process.env.AI_API_KEY?.trim() ||
    process.env.GROQ_API_KEY?.trim() ||
    "";
  const base =
    trimSlash(process.env.AI_BASE_URL?.trim() || "") ||
    trimSlash(process.env.GROQ_BASE_URL?.trim() || "") ||
    DEFAULT_AI_BASE;
  const model =
    process.env.AI_MODEL?.trim() ||
    process.env.GROQ_MODEL?.trim() ||
    DEFAULT_AI_MODEL;
  return {
    provider: inferProvider(base),
    apiKey,
    base,
    model,
  };
}

export function resolveAiProvider(): AiProvider {
  return providerConfig().provider;
}

export function getAiModel(): string {
  return providerConfig().model;
}

export function getAiBaseUrl(): string {
  return providerConfig().base;
}

export function isAiConfigured(): boolean {
  return Boolean(providerConfig().apiKey);
}

export function getAiConnection() {
  const cfg = providerConfig();
  return {
    configured: Boolean(cfg.apiKey),
    provider: cfg.provider,
    model: cfg.apiKey ? cfg.model : null,
  };
}

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

type ChatOptions = {
  temperature?: number;
  timeoutMs?: number;
  maxTokens?: number;
};

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function completeJson(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<Record<string, unknown>> {
  const raw = await completeChat(messages, options);
  try {
    return parseJsonRecord(raw);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "JSONの解析に失敗しました";
    throw new MarketingAgentError(
      "INVALID_AI_RESPONSE",
      `AIのJSON応答を解析できませんでした（${message}）。先頭240文字: ${raw.slice(0, 240)}`,
    );
  }
}

export async function completeChat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  const cfg = providerConfig();
  if (!cfg.apiKey) {
    throw new MarketingAgentError("AI_NOT_CONFIGURED", MISSING_KEY_MESSAGE);
  }

  const timeoutMs = options.timeoutMs ?? 50_000;
  const body = {
    model: cfg.model,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 4000,
    response_format: { type: "json_object" as const },
    messages,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${cfg.base}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const text = await response.text();

      if (response.status === 429) {
        lastError = new MarketingAgentError(
          "AI_RATE_LIMIT",
          "AI API のレート制限に達しました。しばらく待って再実行してください。",
        );
        await sleep(1500 * (attempt + 1));
        continue;
      }

      if (!response.ok) {
        throw new MarketingAgentError(
          "AI_HTTP_ERROR",
          `AI APIエラー（HTTP ${response.status}）: ${redactSecrets(text).slice(0, 300)}`,
        );
      }

      const payload = JSON.parse(text) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new MarketingAgentError(
          "INVALID_AI_RESPONSE",
          "AI から本文が返りませんでした。",
        );
      }
      return content;
    } catch (error) {
      if (error instanceof MarketingAgentError) {
        if (error.code === "AI_RATE_LIMIT") {
          lastError = error;
          continue;
        }
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new MarketingAgentError(
          "AI_TIMEOUT",
          `AI API が ${timeoutMs}ms 以内に応答しませんでした。`,
        );
      }
      lastError = error instanceof Error ? error : new Error(String(error));
    } finally {
      clearTimeout(timer);
    }
  }

  throw (
    lastError ??
    new MarketingAgentError("AI_HTTP_ERROR", "AI API 呼び出しに失敗しました。")
  );
}
