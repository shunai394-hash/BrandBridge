#!/usr/bin/env node
/**
 * Verifies Groq-default AI_* resolution without printing secrets.
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
      `import { resolveAiProvider, isAiConfigured, getAiConnection, getAiBaseUrl, getAiModel } from "./lib/marketing-agent/ai.ts";
const c = getAiConnection();
process.stdout.write(JSON.stringify({
  provider: resolveAiProvider(),
  configured: isAiConfigured(),
  model: c.model,
  connectionProvider: c.provider,
  base: getAiBaseUrl(),
  defaultModel: getAiModel(),
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

const groq = run({
  AI_API_KEY: "gsk_test_placeholder",
});
if (
  groq.provider !== "groq" ||
  groq.configured !== true ||
  groq.base !== "https://api.groq.com/openai/v1" ||
  groq.defaultModel !== "llama-3.3-70b-versatile"
) {
  throw new Error(`groq default check failed: ${JSON.stringify(groq)}`);
}
if (groq.base.includes("api.openai.com")) {
  throw new Error("default AI_BASE_URL must not be OpenAI");
}

const openai = run({
  AI_API_KEY: "sk-test-placeholder",
  AI_BASE_URL: "https://api.openai.com/v1",
  AI_MODEL: "gpt-4o-mini",
});
if (
  openai.provider !== "openai" ||
  openai.configured !== true ||
  openai.base !== "https://api.openai.com/v1" ||
  openai.defaultModel !== "gpt-4o-mini"
) {
  throw new Error(`openai switch check failed: ${JSON.stringify(openai)}`);
}

const missing = run({});
if (
  missing.configured !== false ||
  missing.provider !== "groq" ||
  missing.base !== "https://api.groq.com/openai/v1"
) {
  throw new Error(`missing key should stay on Groq default: ${JSON.stringify(missing)}`);
}

console.log("ai provider checks ok");
