export type ProductVideoEmbed =
  | { kind: "youtube"; videoId: string; embedUrl: string; watchUrl: string }
  | { kind: "vimeo"; videoId: string; embedUrl: string; watchUrl: string }
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

/** Parse a stored product video URL into embed or plain link. */
export function parseProductVideoUrl(
  value: string | null | undefined,
): ProductVideoEmbed | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
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

  return { kind: "link", href: url.toString() };
}
