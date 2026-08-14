#!/usr/bin/env node
/**
 * Verifies Groq/OpenAI provider resolution without printing secrets.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(env) {
  const result = spawnSync(
    "npx",
    [
      "tsx",
      "-e",
      `import { resolveAiProvider, isAiConfigured, getAiConnection } from "./lib/marketing-agent/ai.ts";
const c = getAiConnection();
process.stdout.write(JSON.stringify({
  provider: resolveAiProvider(),
  configured: isAiConfigured(),
  model: c.model,
  connectionProvider: c.provider,
}));`,
    ],
    {
      cwd: root,
      env: { ...process.env, ...env },
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
  MARKETING_AI_PROVIDER: "groq",
  GROQ_API_KEY: "gsk_test_placeholder",
  OPENAI_API_KEY: "",
});
if (groq.provider !== "groq" || groq.configured !== true) {
  throw new Error("groq provider check failed");
}

const openai = run({
  MARKETING_AI_PROVIDER: "openai",
  GROQ_API_KEY: "gsk_test_placeholder",
  OPENAI_API_KEY: "sk-test-placeholder",
});
if (openai.provider !== "openai" || openai.configured !== true) {
  throw new Error("openai provider check failed");
}

const missing = run({
  MARKETING_AI_PROVIDER: "groq",
  GROQ_API_KEY: "",
  OPENAI_API_KEY: "sk-test-placeholder",
});
if (missing.provider !== "groq" || missing.configured !== false) {
  throw new Error("missing groq key should not fall back when provider=groq");
}

console.log("ai provider checks ok");
