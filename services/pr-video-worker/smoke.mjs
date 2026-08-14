#!/usr/bin/env node
/**
 * Local HTTP contract for the PR video worker.
 * Starts the server, checks /health, 401 without Bearer, 400 on empty body.
 * Does not call FFmpeg, R2, or Cloud Run.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workerDir = path.dirname(fileURLToPath(import.meta.url));
const SECRET = "local-worker-smoke-secret";

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      server.close((err) => (err ? reject(err) : resolve(port)));
    });
    server.on("error", reject);
  });
}

async function waitHealthy(port, timeoutMs = 20_000) {
  const started = Date.now();
  let last = "";
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/health`);
      last = await res.text();
      if (res.ok) return JSON.parse(last);
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Worker did not become healthy: ${last}`);
}

async function jsonRequest(port, method, pathname, { headers, body } = {}) {
  const res = await fetch(`http://127.0.0.1:${port}${pathname}`, {
    method,
    headers,
    body,
  });
  const text = await res.text();
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }
  return { status: res.status, payload };
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function main() {
  const port = await freePort();
  const tsxCli = path.join(workerDir, "node_modules", "tsx", "dist", "cli.mjs");
  const child = spawn(process.execPath, [tsxCli, "server.ts"], {
    cwd: workerDir,
    env: {
      ...process.env,
      PORT: String(port),
      PR_VIDEO_WORKER_SECRET: SECRET,
    },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const stop = () => {
    try {
      if (child.pid) process.kill(-child.pid, "SIGKILL");
    } catch {
      try {
        child.kill("SIGKILL");
      } catch {
        /* already gone */
      }
    }
    child.stdout?.destroy();
    child.stderr?.destroy();
  };
  process.on("exit", stop);

  try {
    const health = await waitHealthy(port);
    assert(health?.ok === true, `GET /health expected {ok:true}, got ${JSON.stringify(health)}`);

    const root = await jsonRequest(port, "GET", "/");
    assert(root.status === 200 && root.payload?.ok === true, `GET / failed: ${root.status}`);

    const noAuth = await jsonRequest(port, "POST", "/render", {
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    assert(noAuth.status === 401, `POST /render without auth expected 401, got ${noAuth.status}`);
    assert(noAuth.payload?.code === "UNAUTHORIZED", "401 body should include code UNAUTHORIZED");

    const badAuth = await jsonRequest(port, "POST", "/render", {
      headers: {
        Authorization: "Bearer wrong-secret",
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    assert(badAuth.status === 401, `POST /render wrong Bearer expected 401, got ${badAuth.status}`);

    const empty = await jsonRequest(port, "POST", "/render", {
      headers: {
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    assert(empty.status === 400, `POST /render empty body expected 400, got ${empty.status}`);
    assert(empty.payload?.code === "INVALID_CASE", `expected INVALID_CASE, got ${JSON.stringify(empty.payload)}`);

    const missing = await jsonRequest(port, "POST", "/nope", {
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    assert(missing.status === 404, `unknown path expected 404, got ${missing.status}`);

    console.log("pr-video-worker smoke PASS");
    console.log(JSON.stringify({
      health: 200,
      unauthorized: 401,
      invalidBody: 400,
      notFound: 404,
    }));
  } catch (error) {
    if (stderr.trim()) {
      console.error(stderr.trim());
    }
    throw error;
  } finally {
    stop();
    await new Promise((resolve) => {
      const done = () => resolve();
      if (child.exitCode !== null || child.signalCode !== null) {
        done();
        return;
      }
      child.once("exit", done);
      setTimeout(done, 500);
    });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
