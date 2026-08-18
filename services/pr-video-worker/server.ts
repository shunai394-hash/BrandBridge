import { randomUUID, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MarketingAgentError } from "@/lib/marketing-agent/ai";
import {
  generateBusinessPrVideoFromUploads,
  MIN_BUSINESS_PR_IMAGES,
  parseBusinessPrWorkerImages,
} from "@/lib/marketing-agent/business-pr-video";
import { generatePrVideoFromRemote } from "@/lib/marketing-agent/pr-video-core";
import { normalizePrVideoScript } from "@/lib/marketing-agent/pr-script";
import {
  redactSecrets,
  stageFromErrorCode,
  type PrVideoStage,
} from "@/lib/marketing-agent/redact";

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
      "r2",
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
    if (total > 32 * 1024 * 1024) {
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
    images?: unknown;
    productName?: string;
    companyName?: string;
    bgmEnabled?: boolean;
    subtitlesEnabled?: boolean;
  };
  const images = parseBusinessPrWorkerImages(body.images);
  const companyName =
    String(body.companyName ?? body.productName ?? "").trim() || "BrandBridge";
  const bgmEnabled = body.bgmEnabled !== false;
  const subtitlesEnabled = body.subtitlesEnabled !== false;
  const caseId = String(body.caseId ?? "").trim();
  const imageUrl = String(body.imageUrl ?? "").trim();

  if (images.length < MIN_BUSINESS_PR_IMAGES && (!caseId || !imageUrl)) {
    throw new MarketingAgentError(
      "INVALID_CASE",
      "images (2 or more) or caseId and imageUrl are required.",
    );
  }

  const script = normalizePrVideoScript(body.script);
  if (!script) {
    throw new MarketingAgentError(
      "INVALID_AI_RESPONSE",
      "Invalid PR script. Generate the script again.",
    );
  }

  let rendered: Awaited<ReturnType<typeof generatePrVideoFromRemote>>;
  let key: string;

  if (images.length >= MIN_BUSINESS_PR_IMAGES) {
    rendered = await generateBusinessPrVideoFromUploads({
      script,
      images,
      companyName,
      bgmEnabled,
      subtitlesEnabled,
    });
    key = `pr-videos/business/${randomUUID()}.mp4`;
  } else if (caseId && imageUrl) {
    rendered = await generatePrVideoFromRemote({
      caseId,
      script,
      imageUrl,
      productName: body.productName,
      bgmEnabled,
      subtitlesEnabled,
    });
    key = `pr-videos/${caseId}/${randomUUID()}.mp4`;
  } else {
    throw new MarketingAgentError(
      "INVALID_CASE",
      "images (2 or more) or caseId and imageUrl are required.",
    );
  }

  let client: S3Client;
  let bucket: string;
  try {
    ({ client, bucket } = r2Client());
  } catch (error) {
    if (error instanceof MarketingAgentError) throw error;
    throw new MarketingAgentError(
      "STORAGE_UNAVAILABLE",
      "R2 client could not start.",
      "r2",
    );
  }

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: rendered.bytes,
        ContentType: "video/mp4",
        ContentDisposition: `attachment; filename="${rendered.fileName}"`,
      }),
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : "upload failed";
    throw new MarketingAgentError(
      "STORAGE_UNAVAILABLE",
      `R2 upload failed: ${redactSecrets(detail).slice(0, 180)}`,
      "r2",
    );
  }

  let url: string;
  try {
    url = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: SIGNED_URL_EXPIRES },
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : "sign failed";
    throw new MarketingAgentError(
      "STORAGE_UNAVAILABLE",
      `R2 signed URL failed: ${redactSecrets(detail).slice(0, 180)}`,
      "r2",
    );
  }

  return {
    url,
    key,
    durationSeconds: rendered.durationSeconds,
    width: rendered.width,
    height: rendered.height,
    renderMs: Date.now() - started,
    stage: "r2" as const,
    status: "completed" as const,
  };
}

const server = createServer((req, res) => {
  void (async () => {
    try {
      const path = req.url?.split("?")[0] || "/";
      if (req.method === "GET" && (path === "/health" || path === "/")) {
        json(res, 200, {
          ok: true,
          service: "pr-video-worker",
          images: true,
          bgm: true,
          subtitles: true,
        });
        return;
      }
      if (req.method !== "POST" || path !== "/render") {
        json(res, 404, { error: "Not found." });
        return;
      }
      if (!secretOk(req.headers.authorization)) {
        json(res, 401, {
          error: "Unauthorized.",
          stage: "cloud-run",
          code: "UNAUTHORIZED",
        });
        return;
      }
      const result = await handleRender(req);
      json(res, 200, result);
    } catch (error) {
      if (error instanceof MarketingAgentError) {
        const status = error.code === "AI_TIMEOUT" ? 504 : 400;
        const stage =
          error.stage ||
          stageFromErrorCode(error.code) ||
          "cloud-run";
        json(res, status, {
          error: redactSecrets(error.message),
          code: error.code,
          stage,
        });
        return;
      }
      const message =
        error instanceof Error ? error.message : "Video generation failed.";
      json(res, 500, {
        error: redactSecrets(message),
        stage: "cloud-run" satisfies PrVideoStage,
      });
    }
  })();
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`pr-video-worker listening on ${PORT}`);
});
