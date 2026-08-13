/**
 * Server-only Marketing Agent text AI.
 * Groq and OpenAI are interchangeable Chat Completions providers.
 * Never import from Client Components. Never log or return the API key.
 */

import { parseJsonFromAi } from "./json";

export type AiProvider = "groq" | "openai";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiStatus = {
  configured: boolean;
  provider: AiProvider;
  model: string;
  message: string;
};

const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

function resolveProvider(): AiProvider {
  const explicit = process.env.MARKETING_AI_PROVIDER?.trim().toLowerCase();
  if (explicit === "groq" || explicit === "openai") return explicit;
  if (process.env.GROQ_API_KEY?.trim()) return "groq";
  return "openai";
}

function providerConfig(provider: AiProvider): {
  provider: AiProvider;
  apiKey: string;
  base: string;
  model: string;
} {
  if (provider === "groq") {
    return {
      provider,
      apiKey: process.env.GROQ_API_KEY?.trim() || "",
      base:
        process.env.GROQ_BASE_URL?.trim().replace(/\/$/, "") ||
        "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL,
    };
  }
  return {
    provider,
    apiKey: process.env.OPENAI_API_KEY?.trim() || "",
    base:
      process.env.OPENAI_BASE_URL?.trim().replace(/\/$/, "") ||
      "https://api.openai.com/v1",
    model: process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
  };
}

function redactSecrets(text: string): string {
  return text
    .replace(/gsk_[A-Za-z0-9]+/g, "[redacted]")
    .replace(/sk-[A-Za-z0-9-]+/g, "[redacted]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]");
}

export function getAiStatus(): AiStatus {
  const provider = resolveProvider();
  const cfg = providerConfig(provider);
  if (!cfg.apiKey) {
    return {
      configured: false,
      provider,
      model: cfg.model,
      message:
        provider === "groq"
          ? "GROQ_API_KEY 未設定。MARKETING_AI_PROVIDER=openai に切り替えるか、キーを設定してください。"
          : "OPENAI_API_KEY 未設定。テンプレート生成で継続します。",
    };
  }
  return {
    configured: true,
    provider,
    model: cfg.model,
    message: `文章AI: ${provider}（${cfg.model}）。音声は Voicebox / Qwen TTS と分離。`,
  };
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const provider = resolveProvider();
  const cfg = providerConfig(provider);
  if (!cfg.apiKey) {
    return {
      ok: false,
      error:
        provider === "groq"
          ? "GROQ_API_KEY is not set"
          : "OPENAI_API_KEY is not set",
    };
  }

  try {
    const res = await fetch(`${cfg.base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: options?.temperature ?? 0.4,
        max_tokens: options?.maxTokens ?? 3500,
        messages,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        error: `${provider} HTTP ${res.status}: ${redactSecrets(body).slice(0, 180)}`,
      };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return { ok: false, error: "AI returned empty content" };
    return { ok: true, text };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "AI request failed",
    };
  }
}

/**
 * JSON completion via the existing chatCompletion() client.
 * Does not add a second fetch/AI provider. Parses with parseJsonFromAi().
 */
export async function completeJson<T>(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const result = await chatCompletion(messages, options);
  if (!result.ok) return result;
  const data = parseJsonFromAi<T>(result.text);
  if (data == null) {
    return { ok: false, error: "AI returned invalid JSON" };
  }
  return { ok: true, data };
}
