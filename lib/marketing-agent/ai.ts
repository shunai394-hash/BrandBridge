/**
 * Server-only OpenAI-compatible Chat Completions client.
 * Never import from Client Components. Never expose the API key.
 */

const DEFAULT_MODEL = "gpt-4o-mini";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiStatus = {
  configured: boolean;
  model: string;
  message: string;
};

export function getAiStatus(): AiStatus {
  const key = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  if (!key) {
    return {
      configured: false,
      model,
      message:
        "OPENAI_API_KEY 未設定。テンプレート生成で継続します（AI提案は後から接続可能）。",
    };
  }
  return {
    configured: true,
    model,
    message: `AI 接続済み（${model}）`,
  };
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "OPENAI_API_KEY is not set" };
  }

  const base =
    process.env.OPENAI_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: options?.temperature ?? 0.4,
        max_tokens: options?.maxTokens ?? 3500,
        messages,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        error: `AI HTTP ${res.status}: ${body.slice(0, 240)}`,
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
