import { randomUUID, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import { generatePrVideoFromRemote } from "@/lib/marketing-agent/pr-video-core";
import { normalizePrVideoScript } from "@/lib/marketing-agent/pr-script";

const PORT = Number(process.env.PORT || 8080);
const SIGNED_URL_EXPIRES = 6 * 60 * 60;

function json(res: import("node:http").ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function secretOk(header: string | undefined): boolean {
  const expected = process.env.PR_VIDEO_WORKER_SECRET?.trim();
  if (!expected) return false;
  const raw = header?.trim() || "";
  const token = raw.toLowerCase().startsWith("bearer ")
    ? raw.slice(7).trim()
    : "";
  if (!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function r2Client(): { client: S3Client; bucket: string } {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket =
    process.env.R2_BUCKET_NAME?.trim() ||
    process.env.R2_BUCKET?.trim() ||
    "brandbridge-pr-videos";
  const endpoint =
    process.env.R2_S3_ENDPOINT?.trim().replace(/\/$/, "") ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");
  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new MarketingAgentError(
      "STORAGE_UNAVAILABLE",
      "R2 is not configured on the video worker.",
    );
  }
  return {
    bucket,
    client: new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

async function readJson(req: import("node:http").IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const total = chunks.reduce((sum, part) => sum + part.byteLength, 0);
    if (total > 2 * 1024 * 1024) {
      throw new Error("Request body too large.");
    }
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  return JSON.parse(raw) as unknown;
}

async function handleRender(req: import("node:http").IncomingMessage) {
  const started = Date.now();
  const body = (await readJson(req)) as {
    caseId?: string;
    script?: unknown;
    imageUrl?: string;
    productName?: string;
  };
  const caseId = String(body.caseId ?? "").trim();
  const imageUrl = String(body.imageUrl ?? "").trim();
  if (!caseId || !imageUrl) {
    throw new MarketingAgentError(
      "INVALID_CASE",
      "caseId and imageUrl are required.",
    );
  }
  const script = normalizePrVideoScript(body.script);
  if (!script) {
    throw new MarketingAgentError(
      "INVALID_AI_RESPONSE",
      "Invalid PR script. Generate the script again.",
    );
  }

  const rendered = await generatePrVideoFromRemote({
    caseId,
    script,
    imageUrl,
    productName: body.productName,
  });

  const { client, bucket } = r2Client();
  const key = `pr-videos/${caseId}/${randomUUID()}.mp4`;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: rendered.bytes,
      ContentType: "video/mp4",
      ContentDisposition: `attachment; filename="${rendered.fileName}"`,
    }),
  );
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: SIGNED_URL_EXPIRES },
  );

  return {
    url,
    key,
    durationSeconds: rendered.durationSeconds,
    width: rendered.width,
    height: rendered.height,
    renderMs: Date.now() - started,
  };
}

const server = createServer((req, res) => {
  void (async () => {
    try {
      const path = req.url?.split("?")[0] || "/";
      if (req.method === "GET" && (path === "/health" || path === "/")) {
        json(res, 200, { ok: true });
        return;
      }
      if (req.method !== "POST" || path !== "/render") {
        json(res, 404, { error: "Not found." });
        return;
      }
      if (!secretOk(req.headers.authorization)) {
        json(res, 401, { error: "Unauthorized." });
        return;
      }
      const result = await handleRender(req);
      json(res, 200, result);
    } catch (error) {
      if (error instanceof MarketingAgentError) {
        const status = error.code === "AI_TIMEOUT" ? 504 : 400;
        json(res, status, { error: error.message, code: error.code });
        return;
      }
      const message =
        error instanceof Error ? error.message : "Video generation failed.";
      json(res, 500, { error: message });
    }
  })();
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`pr-video-worker listening on ${PORT}`);
});
