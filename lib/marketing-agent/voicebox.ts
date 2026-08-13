/**
 * Thin client for the existing local Voicebox / Qwen TTS API.
 * Does not implement a new TTS engine. Does not change Voicebox.
 * Default: POST {TTS_API_URL}/generate  engine=qwen  model_size=1.7B
 * Never import from Client Components.
 */

export type VoiceboxStatus = {
  configured: boolean;
  connected: boolean;
  url: string;
  engine: string;
  modelSize: string;
  message: string;
};

export type VoiceProfile = {
  id: string;
  name: string;
};

type GenerateOk = {
  ok: true;
  bytes: Uint8Array;
  contentType: string;
  filename: string;
};

type GenerateErr = { ok: false; error: string };

const DEFAULT_TTS_URL = "http://127.0.0.1:17493";
const DEFAULT_ENGINE = "qwen";
const DEFAULT_MODEL_SIZE = "1.7B";

function ttsBaseUrl(): string {
  return (
    process.env.TTS_API_URL?.trim().replace(/\/$/, "") || DEFAULT_TTS_URL
  );
}

function ttsHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, audio/wav, audio/mpeg, application/octet-stream",
    "X-Voicebox-Client-Id": "brandbridge-marketing-agent",
  };
  const token = process.env.TTS_API_KEY?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function getVoiceboxStatus(): VoiceboxStatus {
  const url = ttsBaseUrl();
  const engine = process.env.TTS_ENGINE?.trim() || DEFAULT_ENGINE;
  const modelSize = process.env.TTS_MODEL_SIZE?.trim() || DEFAULT_MODEL_SIZE;
  return {
    configured: true,
    connected: false,
    url,
    engine,
    modelSize,
    message: `ナレーション: Voicebox ${url} / ${engine} ${modelSize}（文章AIとは分離）`,
  };
}

export async function pingVoicebox(): Promise<VoiceboxStatus> {
  const base = getVoiceboxStatus();
  try {
    const res = await fetch(`${base.url}/profiles`, {
      headers: ttsHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok || res.status === 404) {
      return {
        ...base,
        connected: true,
        message: `Voicebox 接続可（${base.engine} ${base.modelSize}）。文章生成は Groq/OpenAI、音声はこの API。`,
      };
    }
    return {
      ...base,
      connected: false,
      message: `Voicebox 応答 HTTP ${res.status}。既存 Voicebox を起動してください。`,
    };
  } catch {
    return {
      ...base,
      connected: false,
      message: `Voicebox 未接続（${base.url}）。ローカル Voicebox を起動すると Qwen TTS でナレーションできます。`,
    };
  }
}

function asProfiles(payload: unknown): VoiceProfile[] {
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && "profiles" in payload
      ? (payload as { profiles: unknown }).profiles
      : [];
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      const rec = item as Record<string, unknown>;
      const id = String(rec.id ?? rec.profile_id ?? "");
      const name = String(rec.name ?? rec.profile ?? id);
      return { id, name };
    })
    .filter((item) => item.id.length > 0);
}

export async function listVoiceboxProfiles(): Promise<VoiceProfile[]> {
  try {
    const res = await fetch(`${ttsBaseUrl()}/profiles`, {
      headers: ttsHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    return asProfiles(await res.json());
  } catch {
    return [];
  }
}

async function resolveProfileId(): Promise<string | null> {
  const fromEnv = process.env.TTS_PROFILE_ID?.trim();
  if (fromEnv) return fromEnv;
  const named = process.env.TTS_PROFILE?.trim();
  const profiles = await listVoiceboxProfiles();
  if (named) {
    const match = profiles.find(
      (p) => p.name.toLowerCase() === named.toLowerCase() || p.id === named,
    );
    if (match) return match.id;
  }
  return profiles[0]?.id ?? null;
}

async function fetchAudioBytes(
  generationId: string,
): Promise<GenerateOk | GenerateErr> {
  const url = `${ttsBaseUrl()}/audio/${encodeURIComponent(generationId)}`;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const res = await fetch(url, {
      headers: ttsHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const buf = new Uint8Array(await res.arrayBuffer());
      if (buf.byteLength > 0) {
        const contentType = res.headers.get("content-type") || "audio/wav";
        return {
          ok: true,
          bytes: buf,
          contentType,
          filename: `narration-${generationId}.wav`,
        };
      }
    }
    if (res.status === 404 || res.status === 202 || res.status === 409) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }
    if (!res.ok && res.status >= 500) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }
    break;
  }
  return { ok: false, error: "Voicebox audio was not ready" };
}

async function generateViaProfile(
  text: string,
  profileId: string,
  language: string,
): Promise<GenerateOk | GenerateErr> {
  const res = await fetch(`${ttsBaseUrl()}/generate`, {
    method: "POST",
    headers: ttsHeaders(),
    body: JSON.stringify({
      text,
      profile_id: profileId,
      language,
      engine: process.env.TTS_ENGINE?.trim() || DEFAULT_ENGINE,
      model_size: process.env.TTS_MODEL_SIZE?.trim() || DEFAULT_MODEL_SIZE,
    }),
    signal: AbortSignal.timeout(120000),
  });

  const contentType = res.headers.get("content-type") || "";
  if (res.ok && contentType.includes("audio")) {
    const bytes = new Uint8Array(await res.arrayBuffer());
    return {
      ok: true,
      bytes,
      contentType,
      filename: "narration.wav",
    };
  }

  if (!res.ok) {
    return { ok: false, error: `Voicebox /generate HTTP ${res.status}` };
  }

  const data = (await res.json()) as { id?: string; status?: string };
  if (!data.id) return { ok: false, error: "Voicebox /generate returned no id" };
  return fetchAudioBytes(data.id);
}

async function generateViaSpeak(
  text: string,
  language: string,
): Promise<GenerateOk | GenerateErr> {
  const res = await fetch(`${ttsBaseUrl()}/speak`, {
    method: "POST",
    headers: ttsHeaders(),
    body: JSON.stringify({
      text,
      language,
      profile: process.env.TTS_PROFILE?.trim() || undefined,
      engine: process.env.TTS_ENGINE?.trim() || DEFAULT_ENGINE,
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    return { ok: false, error: `Voicebox /speak HTTP ${res.status}` };
  }
  const contentType = res.headers.get("content-type") || "audio/wav";
  if (!contentType.includes("audio") && !contentType.includes("octet-stream")) {
    return { ok: false, error: "Voicebox /speak did not return audio" };
  }
  return {
    ok: true,
    bytes: new Uint8Array(await res.arrayBuffer()),
    contentType,
    filename: "narration.wav",
  };
}

export async function synthesizeNarration(params: {
  text: string;
  language?: string;
}): Promise<GenerateOk | GenerateErr> {
  const text = params.text.trim();
  if (!text) return { ok: false, error: "ナレーションテキストが空です" };
  if (text.length > 8000) {
    return { ok: false, error: "ナレーションが長すぎます（8000文字まで）" };
  }

  const language = (
    params.language ||
    process.env.TTS_LANGUAGE?.trim() ||
    "en"
  ).slice(0, 8);

  try {
    const profileId = await resolveProfileId();
    if (profileId) {
      const generated = await generateViaProfile(text, profileId, language);
      if (generated.ok) return generated;
    }
    return generateViaSpeak(text, language);
  } catch {
    return {
      ok: false,
      error:
        "Voicebox に接続できません。既存の Voicebox を起動し TTS_API_URL を確認してください。",
    };
  }
}
