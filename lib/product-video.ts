export type ProductVideoEmbed =
  | { kind: "youtube"; videoId: string; embedUrl: string; watchUrl: string }
  | { kind: "vimeo"; videoId: string; embedUrl: string; watchUrl: string }
  | { kind: "file"; href: string }
  | { kind: "link"; href: string };

function safeUrl(raw: string): URL | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

function youtubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id || null;
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      return url.searchParams.get("v");
    }
    const parts = url.pathname.split("/").filter(Boolean);
    if (
      (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") &&
      parts[1]
    ) {
      return parts[1];
    }
  }
  return null;
}

function vimeoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (host === "player.vimeo.com" && parts[0] === "video" && parts[1]) {
      return parts[1].match(/^\d+$/) ? parts[1] : null;
    }
    // vimeo.com/123456789 or vimeo.com/channels/.../123
    for (let i = parts.length - 1; i >= 0; i--) {
      if (/^\d+$/.test(parts[i])) return parts[i];
    }
  }
  return null;
}

const VIDEO_FILE_EXT = /\.(mp4|webm|ogg)(?:$|[?#])/i;

/** Known placeholder / unrelated test videos — never render on product pages. */
const BLOCKED_YOUTUBE_IDS = new Set([
  "jNQXAC9IVRw", // "Me at the zoo" — accidental test URL
]);

function isVideoFilePath(value: string): boolean {
  return VIDEO_FILE_EXT.test(value);
}

/** Parse a stored product video URL into embed, file, or plain link. */
export function parseProductVideoUrl(
  value: string | null | undefined,
): ProductVideoEmbed | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  // Same-origin / public asset paths (e.g. /videos/showcase/aurora-intro.mp4)
  if (trimmed.startsWith("/") && isVideoFilePath(trimmed)) {
    return { kind: "file", href: trimmed };
  }

  const url = safeUrl(trimmed);
  if (!url) {
    // Non-URL text — still offer a link if it looks like a URL without scheme
    if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed)) {
      return { kind: "link", href: `https://${trimmed}` };
    }
    return null;
  }

  const yt = youtubeId(url);
  if (yt) {
    if (BLOCKED_YOUTUBE_IDS.has(yt)) return null;
    return {
      kind: "youtube",
      videoId: yt,
      embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}`,
      watchUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(yt)}`,
    };
  }

  const vim = vimeoId(url);
  if (vim) {
    return {
      kind: "vimeo",
      videoId: vim,
      embedUrl: `https://player.vimeo.com/video/${encodeURIComponent(vim)}`,
      watchUrl: `https://vimeo.com/${encodeURIComponent(vim)}`,
    };
  }

  if (isVideoFilePath(url.pathname) || isVideoFilePath(url.href)) {
    return { kind: "file", href: url.toString() };
  }

  return { kind: "link", href: url.toString() };
}
