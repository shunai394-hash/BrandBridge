import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { synthesizeNarration } from "@/lib/marketing-agent/voicebox";
import { getContent, getSocialPost } from "@/lib/marketing-agent/store";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

async function resolveNarrationText(form: FormData): Promise<{
  text: string;
  language: string;
} | { error: string }> {
  const postId = String(form.get("postId") ?? "").trim();
  const contentId = String(form.get("contentId") ?? "").trim();
  const raw = String(form.get("text") ?? "").trim();

  if (postId) {
    const post = await getSocialPost(postId);
    if (!post) return { error: "投稿が見つかりません" };
    const text = post.narration || post.body;
    return { text, language: post.language || "en" };
  }

  if (contentId) {
    const content = await getContent(contentId);
    if (!content) return { error: "記事が見つかりません" };
    const text = content.definition || content.body.slice(0, 4000);
    return { text, language: content.language || "en" };
  }

  if (raw) return { text: raw, language: "en" };
  return { error: "ナレーションテキストがありません" };
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const form = await request.formData();
  const resolved = await resolveNarrationText(form);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }

  const audio = await synthesizeNarration({
    text: resolved.text,
    language: resolved.language,
  });

  if (!audio.ok) {
    return NextResponse.json({ error: audio.error }, { status: 502 });
  }

  return new NextResponse(Buffer.from(audio.bytes), {
    status: 200,
    headers: {
      "Content-Type": audio.contentType,
      "Content-Disposition": `attachment; filename="${audio.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
