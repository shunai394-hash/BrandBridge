export const DEFAULT_PR_VIDEO_WORKER_URL =
  "https://pr-video-worker-645546009546.asia-northeast1.run.app";

export function prVideoWorkerConfig(): { url: string; secret: string } | null {
  const configured = process.env.PR_VIDEO_WORKER_URL?.trim().replace(/\/$/, "");
  const url = configured || DEFAULT_PR_VIDEO_WORKER_URL;
  const secret = process.env.PR_VIDEO_WORKER_SECRET?.trim();
  if (!secret) return null;
  return { url, secret };
}
