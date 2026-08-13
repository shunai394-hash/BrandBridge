import { parseJsonRecord } from "@/lib/marketing-agent/json";

export class MarketingAgentError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "MarketingAgentError";
    this.code = code;
  }
}

export function getAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export function getAiBaseUrl(): string {
  const raw = process.env.OPENAI_BASE_URL?.trim().replace(/\/$/, "");
  return raw && raw.length > 0 ? raw : "https://api.openai.com/v1";
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getAiConnection() {
  return {
    configured: isAiConfigured(),
    model: isAiConfigured() ? getAiModel() : null,
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
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new MarketingAgentError(
      "AI_NOT_CONFIGURED",
      "AI API未設定です。OPENAI_API_KEY をサーバー環境変数に設定してください。",
    );
  }

  const timeoutMs = options.timeoutMs ?? 50_000;
  const body = {
    model: getAiModel(),
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
      const response = await fetch(`${getAiBaseUrl()}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
          `AI API error ${response.status}: ${text.slice(0, 300)}`,
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
