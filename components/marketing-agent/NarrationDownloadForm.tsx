type NarrationDownloadFormProps = {
  postId?: string;
  contentId?: string;
  text?: string;
  label?: string;
};

export function NarrationDownloadForm({
  postId,
  contentId,
  text,
  label = "Voicebox でナレーション音声を生成",
}: NarrationDownloadFormProps) {
  return (
    <form
      method="post"
      action="/admin/marketing-agent/narration"
      className="space-y-2"
    >
      {postId ? <input type="hidden" name="postId" value={postId} /> : null}
      {contentId ? (
        <input type="hidden" name="contentId" value={contentId} />
      ) : null}
      {text ? <input type="hidden" name="text" value={text} /> : null}
      <button
        type="submit"
        className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-navy transition hover:border-teal hover:text-teal"
      >
        {label}
      </button>
      <p className="text-xs text-muted">
        文章AI（Groq/OpenAI）とは別の既存 Voicebox / Qwen TTS 1.7B を使います。動画・SNS投稿はしません。
      </p>
    </form>
  );
}
