#!/usr/bin/env node
/**
 * Verifies Groq-standard resolution: AI_API_KEY wins, else GROQ_API_KEY.
 * Does not print secret values.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const CLEAR = {
  MARKETING_AI_PROVIDER: "",
  GROQ_API_KEY: "",
  GROQ_BASE_URL: "",
  GROQ_MODEL: "",
  OPENAI_API_KEY: "",
  OPENAI_BASE_URL: "",
  OPENAI_MODEL: "",
  AI_API_KEY: "",
  AI_BASE_URL: "",
  AI_MODEL: "",
};

function run(env) {
  const result = spawnSync(
    "npx",
    [
      "tsx",
      "-e",
      `import {
  resolveAiProvider,
  isAiConfigured,
  getAiConnection,
  getAiBaseUrl,
  getAiModel,
  getAiKeySource,
} from "./lib/marketing-agent/ai.ts";
const c = getAiConnection();
process.stdout.write(JSON.stringify({
  provider: resolveAiProvider(),
  configured: isAiConfigured(),
  model: c.model,
  connectionProvider: c.provider,
  base: getAiBaseUrl(),
  defaultModel: getAiModel(),
  keySource: getAiKeySource(),
}));`,
    ],
    {
      cwd: root,
      env: { ...process.env, ...CLEAR, ...env },
      encoding: "utf8",
    },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "provider check failed");
  }
  const line = result.stdout.trim().split("\n").pop();
  return JSON.parse(line);
}

function runMissingChat() {
  const result = spawnSync(
    "npx",
    [
      "tsx",
      "-e",
      `import { completeChat, MarketingAgentError } from "./lib/marketing-agent/ai.ts";
void (async () => {
  try {
    await completeChat([{ role: "user", content: "{}" }]);
    process.stdout.write(JSON.stringify({ threw: false }));
  } catch (error) {
    const code = error instanceof MarketingAgentError ? error.code : "";
    process.stdout.write(JSON.stringify({ threw: true, code }));
  }
})();`,
    ],
    {
      cwd: root,
      env: { ...process.env, ...CLEAR },
      encoding: "utf8",
    },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "missing-key chat check failed");
  }
  const line = result.stdout.trim().split("\n").pop();
  return JSON.parse(line);
}

const GROQ_BASE = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ① AI_API_KEY あり（GROQ_API_KEY より優先）
const aiKeyWins = run({
  AI_API_KEY: "ai-key-placeholder",
  GROQ_API_KEY: "groq-key-placeholder",
});
if (
  aiKeyWins.keySource !== "AI_API_KEY" ||
  aiKeyWins.configured !== true ||
  aiKeyWins.provider !== "groq" ||
  aiKeyWins.base !== GROQ_BASE ||
  aiKeyWins.defaultModel !== GROQ_MODEL
) {
  throw new Error(`AI_API_KEY priority check failed: ${JSON.stringify(aiKeyWins)}`);
}

// ② AI_API_KEY なし + GROQ_API_KEY あり（既存 .env.local）
const groqCompat = run({
  GROQ_API_KEY: "groq-key-placeholder",
});
if (
  groqCompat.keySource !== "GROQ_API_KEY" ||
  groqCompat.configured !== true ||
  groqCompat.provider !== "groq" ||
  groqCompat.base !== GROQ_BASE ||
  groqCompat.defaultModel !== GROQ_MODEL
) {
  throw new Error(`GROQ_API_KEY compat check failed: ${JSON.stringify(groqCompat)}`);
}

// ③ BASE URL 未設定 → Groq
// ④ MODEL 未設定 → llama-3.3-70b-versatile
if (groqCompat.base.includes("api.openai.com")) {
  throw new Error("default AI_BASE_URL must not be OpenAI");
}

// ⑤ OpenAI は明示設定時のみ
const openai = run({
  AI_API_KEY: "sk-test-placeholder",
  AI_BASE_URL: "https://api.openai.com/v1",
  AI_MODEL: "gpt-4o-mini",
});
if (
  openai.provider !== "openai" ||
  openai.configured !== true ||
  openai.keySource !== "AI_API_KEY" ||
  openai.base !== "https://api.openai.com/v1" ||
  openai.defaultModel !== "gpt-4o-mini"
) {
  throw new Error(`openai explicit check failed: ${JSON.stringify(openai)}`);
}

// ⑥ キーなし → 未設定
const missing = run({});
if (
  missing.configured !== false ||
  missing.keySource !== null ||
  missing.provider !== "groq" ||
  missing.base !== GROQ_BASE ||
  missing.defaultModel !== GROQ_MODEL
) {
  throw new Error(`missing key should stay on Groq default: ${JSON.stringify(missing)}`);
}

const missingChat = runMissingChat();
if (missingChat.threw !== true || missingChat.code !== "AI_NOT_CONFIGURED") {
  throw new Error(`missing key should throw AI_NOT_CONFIGURED: ${JSON.stringify(missingChat)}`);
}

console.log("ai provider checks ok");
console.log(
  JSON.stringify({
    aiApiKeyPriority: aiKeyWins.keySource,
    groqCompat: groqCompat.keySource,
    defaultBase: groqCompat.base,
    defaultModel: groqCompat.defaultModel,
    openaiExplicit: openai.base,
    missingCode: missingChat.code,
  }),
);
