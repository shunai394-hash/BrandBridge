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

/** Groq production replacement for retired llama-3.3-70b-versatile (shutdown 2026-08-16). */
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
const DEFAULT_GROQ_BASE = "https://api.groq.com/openai/v1";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_OPENAI_BASE = "https://api.openai.com/v1";

/** Env may still hold retired Groq IDs. Map them so EN SNS and JA PR keep working. */
const GROQ_MODEL_ALIASES: Record<string, string> = {
  "llama-3.3-70b-versatile": DEFAULT_GROQ_MODEL,
  "llama-3.1-70b-versatile": DEFAULT_GROQ_MODEL,
  "llama3-70b-8192": DEFAULT_GROQ_MODEL,
  "llama-3.1-8b-instant": "openai/gpt-oss-20b",
  "llama3-8b-8192": "openai/gpt-oss-20b",
};

function resolveGroqModel(requested: string): string {
  const key = requested.trim();
  return GROQ_MODEL_ALIASES[key] ?? key;
}

type ProviderConfig = {
  provider: AiProvider;
  apiKey: string;
  base: string;
  model: string;
};

export function resolveAiProvider(): AiProvider {
  if (process.env.AI_API_KEY?.trim()) {
    return process.env.AI_BASE_URL?.includes("api.openai.com")
      ? "openai"
      : "groq";
  }

  if (process.env.GROQ_API_KEY?.trim()) {
    return "groq";
  }

  const explicit = process.env.MARKETING_AI_PROVIDER?.trim().toLowerCase();

  if (explicit === "groq" || explicit === "openai") {
    return explicit;
  }

  return "groq";
}

function providerConfig(): ProviderConfig {
  const provider = resolveAiProvider();

  if (provider === "openai") {
    return {
      provider,
      apiKey: process.env.AI_API_KEY?.trim() || "",
      base:
        process.env.AI_BASE_URL?.trim().replace(/\/$/, "") ||
        DEFAULT_OPENAI_BASE,
      model:
        process.env.AI_MODEL?.trim() ||
        process.env.OPENAI_MODEL?.trim() ||
        DEFAULT_OPENAI_MODEL,
    };
  }

  return {
    provider,
    apiKey:
      process.env.AI_API_KEY?.trim() ||
      process.env.GROQ_API_KEY?.trim() ||
      "",
    base:
      process.env.AI_BASE_URL?.trim().replace(/\/$/, "") ||
      process.env.GROQ_BASE_URL?.trim().replace(/\/$/, "") ||
      DEFAULT_GROQ_BASE,
    model: resolveGroqModel(
      process.env.AI_MODEL?.trim() ||
        process.env.GROQ_MODEL?.trim() ||
        DEFAULT_GROQ_MODEL,
    ),
  };
}

export function getAiModel(): string {
  return providerConfig().model;
}

export function getAiBaseUrl(): string {
  return providerConfig().base;
}

export function getAiApiKey(): string | null {
  return providerConfig().apiKey || null;
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
    baseUrl: cfg.base,
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

function missingKeyMessage(): string {
  return "AI APIが設定されていません。AI_API_KEY または GROQ_API_KEY をサーバー環境変数に設定してください。";
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
      error instanceof Error ? error.message : "Invalid JSON from AI";

    throw new MarketingAgentError(
      "INVALID_AI_RESPONSE",
      `${message}. First 240 chars: ${raw.slice(0, 240)}`,
    );
  }
}

export async function completeChat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  const cfg = providerConfig();

  if (!cfg.apiKey) {
    throw new MarketingAgentError(
      "AI_NOT_CONFIGURED",
      missingKeyMessage(),
    );
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
          "AI API rate limit reached. Please wait and try again.",
        );

        await sleep(1500 * (attempt + 1));
        continue;
      }

      if (!response.ok) {
        throw new MarketingAgentError(
          "AI_HTTP_ERROR",
          `AI API error ${response.status}: ${redactSecrets(text).slice(0, 300)}`,
        );
      }

      let payload: {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };

      try {
        payload = JSON.parse(text) as typeof payload;
      } catch {
        throw new MarketingAgentError(
          "INVALID_AI_RESPONSE",
          `AI API returned invalid JSON: ${text.slice(0, 300)}`,
        );
      }

      const content = payload.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new MarketingAgentError(
          "INVALID_AI_RESPONSE",
          "AI returned no message content.",
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
          `AI API did not respond within ${timeoutMs}ms.`,
        );
      }

      lastError =
        error instanceof Error ? error : new Error(String(error));
    } finally {
      clearTimeout(timer);
    }
  }

  throw (
    lastError ??
    new MarketingAgentError("AI_HTTP_ERROR", "AI API request failed.")
  );
}
