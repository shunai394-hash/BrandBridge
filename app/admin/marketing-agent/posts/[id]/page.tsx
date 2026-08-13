import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/marketing-agent/ActionForm";
import { StatusBadge } from "@/components/marketing-agent/StatusBadge";
import {
  publishPostAction,
  recordPerformanceAction,
  savePostScriptAction,
  schedulePostAction,
  setPostStatusAction,
} from "@/lib/marketing-agent/actions";
import { getSocialPost } from "@/lib/marketing-agent/store";

export const metadata: Metadata = { title: "Marketing Post" };
export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getSocialPost(id);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/admin/marketing-agent"
        prefetch={false}
        className="text-sm text-teal hover:underline"
      >
        ← Marketing Agent
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-shippori)] text-3xl text-navy">
        {item.title || item.platform}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge value={item.platform} />
        <StatusBadge value={item.status} />
        <StatusBadge value={item.publishMode} />
      </div>
      {item.platform === "tiktok" ? (
        <p className="mt-4 text-sm text-muted">
          TikTok は短尺動画パッケージです（Hook / 15–30秒台本 / ナレーション / Caption / Hashtags / CTA）。同一記事のコピー投稿はしません。公式API未接続時は Manual Publish。
        </p>
      ) : null}

      <ActionForm action={savePostScriptAction} label="台本を保存">
        <input type="hidden" name="postId" value={item.id} />
        <label className="block text-sm">
          <span className="font-medium text-navy">Title</span>
          <input
            name="title"
            defaultValue={item.title ?? ""}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-navy">Hook</span>
          <input
            name="hook"
            defaultValue={item.hook ?? ""}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-navy">
            {item.platform === "tiktok"
              ? "15–30秒台本（body）"
              : "Body / 原稿"}
          </span>
          <textarea
            name="body"
            rows={12}
            defaultValue={item.body}
            className="mt-1 w-full resize-y rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-navy">Narration</span>
          <textarea
            name="narration"
            rows={5}
            defaultValue={item.narration ?? ""}
            className="mt-1 w-full resize-y rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-navy">Caption</span>
          <textarea
            name="caption"
            rows={4}
            defaultValue={item.caption ?? ""}
            className="mt-1 w-full resize-y rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-navy">Hashtags（空白またはカンマ区切り）</span>
          <input
            name="hashtags"
            defaultValue={item.hashtags.join(" ")}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-navy">CTA</span>
          <input
            name="cta"
            defaultValue={item.cta ?? ""}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>
      </ActionForm>

      <dl className="mt-6 grid gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted">CTA</dt>
          <dd>{item.cta || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">UTM</dt>
          <dd className="break-all text-muted">
            {item.utmSource} / {item.utmMedium} / {item.utmCampaign} /{" "}
            {item.utmContent}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Destination</dt>
          <dd className="break-all">{item.destinationUrl || "—"}</dd>
        </div>
        {item.errorMessage ? (
          <div>
            <dt className="text-xs text-muted">Publish note</dt>
            <dd className="text-amber-800">{item.errorMessage}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-8 flex flex-wrap gap-3">
        <ActionForm
          action={setPostStatusAction}
          label="Approve"
          hidden={{ postId: item.id, status: "approved" }}
        />
        <ActionForm action={schedulePostAction} label="Schedule">
          <input type="hidden" name="postId" value={item.id} />
          <input
            type="datetime-local"
            name="scheduledAt"
            required
            className="rounded-md border border-border px-2 py-1 text-sm"
          />
        </ActionForm>
        <ActionForm
          action={publishPostAction}
          label="Publish"
          hidden={{ postId: item.id }}
        />
      </div>
      <div className="mt-8">
        <h2 className="text-lg text-navy">Performance</h2>
        <ActionForm action={recordPerformanceAction} label="指標を保存">
          <input type="hidden" name="postId" value={item.id} />
          <input type="hidden" name="contentId" value={item.contentId ?? ""} />
          <input type="hidden" name="platform" value={item.platform} />
          <div className="grid gap-2 md:grid-cols-3">
            {[
              "impressions",
              "clicks",
              "likes",
              "comments",
              "shares",
              "followers",
              "referralTraffic",
              "leads",
              "registrations",
            ].map((name) => (
              <label key={name} className="text-xs text-muted">
                {name}
                <input
                  name={name}
                  type="number"
                  min={0}
                  defaultValue={0}
                  className="mt-1 w-full rounded-md border border-border px-2 py-1 text-sm"
                />
              </label>
            ))}
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
