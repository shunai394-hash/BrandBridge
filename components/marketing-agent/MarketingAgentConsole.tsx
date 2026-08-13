"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  createSocialAccountAction,
  discoverOpportunitiesAction,
  generateArticleAction,
  publishPostAction,
  recordPerformanceAction,
  repurposeContentAction,
  runBrandAuthorityAction,
  runCompetitorAnalysisAction,
  runMarketResearchAction,
  runPerformanceAction,
  runPlatformDiscoveryAction,
  runScalingAction,
  runSearchConsoleAction,
  runSiteAnalysisAction,
  runWeeklyPipelineAction,
  schedulePostAction,
  setOpportunityStatusAction,
  setPostStatusAction,
  setRecommendationStatusAction,
  updateSocialAccountAction,
} from "@/lib/marketing-agent/actions";
import {
  DEFAULT_PLATFORM_LIMITS,
  PRIMARY_DISTRIBUTION_PLATFORMS,
} from "@/lib/marketing-agent/types";
import type { MarketingConsoleData } from "@/lib/marketing-agent";
import { ActionForm } from "./ActionForm";
import { PrScriptGenerator, type PrScriptCaseOption } from "./PrScriptGenerator";
import { StatusBadge } from "./StatusBadge";

function Card({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-lg border border-border bg-surface p-5 md:p-6"
    >
      <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-cream/50 px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-medium text-navy">{value}</p>
    </div>
  );
}

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  } catch {
    return iso;
  }
}

export function MarketingAgentConsole({
  data,
  cases = [],
  casesError,
}: {
  data: MarketingConsoleData;
  cases?: PrScriptCaseOption[];
  casesError?: string;
}) {
  const scheduled = data.posts.filter((p) => p.status === "scheduled");
  const published = data.posts.filter((p) => p.status === "published");
  const manual = data.posts.filter((p) => p.status === "manual_publish_required");

  return (
    <div className="space-y-8">
      {!data.tablesReady ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {data.tablesMessage}
        </div>
      ) : null}

      <Card title="接続状態">
        <p className="text-sm text-muted">
          調査 → コンテンツ作成 → 配信 → 計測 → 改善 → 拡大。自動投稿は公式API接続時のみ。Cookieログインは使いません。
        </p>
        <div className="grid gap-3 md:grid-cols-4">
          <Stat
            label="文章AI"
            value={
              data.ai.configured
                ? `${data.ai.provider} / ${data.ai.model}`
                : `${data.ai.provider} 未接続`
            }
          />
          <Stat
            label="ナレーション"
            value={data.voicebox.connected ? "Voicebox 接続可" : "Voicebox 未接続"}
          />
          <Stat
            label="Search Console"
            value={data.gsc.connected ? "接続設定あり" : "未接続"}
          />
          <Stat label="公開リサーチ" value={data.agentReach.mode} />
        </div>
        <p className="text-xs text-muted">{data.ai.message}</p>
        <p className="text-xs text-muted">{data.voicebox.message}</p>
        <p className="text-xs text-muted">{data.gsc.message}</p>
        <p className="text-xs text-muted">{data.agentReach.message}</p>
      </Card>

      <Card title="Global Growth" id="global-growth">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Content Opportunities" value={data.growth.opportunityCount} />
          <Stat label="Social Accounts" value={data.growth.accountCount} />
          <Stat label="Scheduled Posts" value={data.growth.scheduledCount} />
          <Stat label="Published Posts" value={data.growth.publishedCount} />
          <Stat label="Brand Mentions" value={data.growth.mentionCount} />
          <Stat label="Referral Traffic" value={data.growth.totals.referralTraffic} />
          <Stat label="Leads" value={data.growth.totals.leads} />
          <Stat label="Registrations" value={data.growth.totals.registrations} />
        </div>
        <p className="text-sm text-navy">{data.growth.scalingMessage}</p>
        <div className="grid gap-4 md:grid-cols-3">
          <TopList title="Top Countries" items={data.growth.topCountries} />
          <TopList title="Top Platforms" items={data.growth.topPlatforms} />
          <TopList title="Top Topics" items={data.growth.topTopics} />
        </div>
        <div className="flex flex-wrap gap-3">
          <ActionForm action={runPerformanceAction} label="Performance 分析" />
          <ActionForm action={runScalingAction} label="Scaling 提案" />
          <ActionForm
            action={runWeeklyPipelineAction}
            label="週次パイプライン"
            pendingLabel="実行中（最大2分）..."
          />
        </div>
      </Card>

      <Card title="Case → PR台本" id="pr-script">
        <PrScriptGenerator cases={cases} casesError={casesError} />
      </Card>

      <Card title="ジョブ" id="jobs">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ActionForm action={runSiteAnalysisAction} label="サイト / SEO 分析" />
          <ActionForm action={runSearchConsoleAction} label="Search Console" />
          <ActionForm action={runMarketResearchAction} label="市場リサーチ" />
          <ActionForm
            action={runCompetitorAnalysisAction}
            label="Competitor Analysis"
          />
          <ActionForm
            action={discoverOpportunitiesAction}
            label="今書くべき記事を提案"
          />
          <ActionForm
            action={runPlatformDiscoveryAction}
            label="コミュニティ発見"
          />
          <ActionForm action={runBrandAuthorityAction} label="Brand Authority" />
        </div>
        <p className="text-xs text-muted">
          パイプラインは管理画面からの手動実行です。cron は未設定。大量自動投稿はしません。
        </p>
      </Card>

      <Card title="AI Recommendations" id="recommendations">
        {data.recommendations.length === 0 ? (
          <p className="text-sm text-muted">まだ提案はありません。</p>
        ) : (
          <ul className="space-y-3">
            {data.recommendations.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-border px-3 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={item.priority} />
                  <span className="text-xs text-muted">{item.category}</span>
                  <p className="font-medium text-navy">{item.title}</p>
                </div>
                <p className="mt-1 text-sm text-muted">{item.body}</p>
                <div className="mt-2 flex gap-2">
                  <ActionForm
                    action={setRecommendationStatusAction}
                    label="採用"
                    hidden={{
                      recommendationId: item.id,
                      status: "accepted",
                    }}
                  />
                  <ActionForm
                    action={setRecommendationStatusAction}
                    label="却下"
                    hidden={{
                      recommendationId: item.id,
                      status: "dismissed",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Competitor Analysis" id="competitors">
        {data.competitors.length === 0 ? (
          <p className="text-sm text-muted">
            まだ競合がありません。「Competitor Analysis」を実行してください。
          </p>
        ) : (
          <ul className="space-y-2">
            {data.competitors.map((c) => (
              <li key={c.id} className="text-sm">
                <Link
                  href={`/admin/marketing-agent/competitors/${c.id}`}
                  prefetch={false}
                  className="font-medium text-teal hover:underline"
                >
                  {c.name}
                </Link>
                <span className="ml-2 text-muted">
                  {c.positioning || c.summary?.slice(0, 80)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {data.gaps.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-navy">最近のギャップ</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-muted">
              {data.gaps.slice(0, 6).map((g) => (
                <li key={g.id}>
                  {g.title}（{g.gapType}）
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      <Card title="Content Opportunities" id="opportunities">
        {data.opportunities.length === 0 ? (
          <p className="text-sm text-muted">提案はまだありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-muted">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Keyword</th>
                  <th className="py-2 pr-3">Country</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.opportunities.map((o) => (
                  <tr key={o.id} className="border-t border-border align-top">
                    <td className="py-2 pr-3">
                      <Link
                        href={`/admin/marketing-agent/opportunities/${o.id}`}
                        prefetch={false}
                        className="text-navy hover:text-teal"
                      >
                        {o.title}
                      </Link>
                      <p className="text-xs text-muted">{o.reason?.slice(0, 80)}</p>
                    </td>
                    <td className="py-2 pr-3">{o.keyword || "—"}</td>
                    <td className="py-2 pr-3">{o.targetCountry || "—"}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge value={o.status} />
                    </td>
                    <td className="py-2">
                      <ActionForm
                        action={generateArticleAction}
                        label="下書き作成"
                        hidden={{ opportunityId: o.id }}
                      />
                      <ActionForm
                        action={setOpportunityStatusAction}
                        label="Planned"
                        hidden={{ opportunityId: o.id, status: "planned" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Blog / Content Engine" id="contents">
        <p className="text-sm text-muted">
          CMS下書きです。既存の <code>/en/...</code> 公開ページは上書きしません。
        </p>
        {data.contents.length === 0 ? (
          <p className="text-sm text-muted">記事下書きはまだありません。</p>
        ) : (
          <ul className="space-y-2">
            {data.contents.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 text-sm">
                <StatusBadge value={c.status} />
                <Link
                  href={`/admin/marketing-agent/contents/${c.id}`}
                  prefetch={false}
                  className="font-medium text-teal hover:underline"
                >
                  {c.title}
                </Link>
                <span className="text-muted">{c.targetKeyword}</span>
                <ActionForm
                  action={repurposeContentAction}
                  label="媒体別に再構成"
                  hidden={{ contentId: c.id }}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Social Accounts（Global Distribution）" id="accounts">
        <p className="text-sm text-muted">
          正式対象: Instagram / TikTok / LinkedIn。AIはアカウントを作りません。ログイン情報・Cookieは保存しません。autoPublish 初期値は false。公式API未接続は Manual Publish。
        </p>
        <div className="grid gap-2 md:grid-cols-3">
          {PRIMARY_DISTRIBUTION_PLATFORMS.map((platform) => {
            const connected = data.accounts.find((a) => a.platform === platform);
            return (
              <div key={platform} className="rounded-md border border-border px-3 py-2 text-sm">
                <p className="font-medium text-navy">{platform}</p>
                <p className="text-xs text-muted">
                  {connected
                    ? `${connected.accountName} / ${connected.officialApiConnected ? "API" : "Manual Publish"}`
                    : "未接続 — 下のフォームで人間が作成した公式アカウントを登録"}
                </p>
              </div>
            );
          })}
        </div>
        <ActionForm action={createSocialAccountAction} label="公式アカウントを接続">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="font-medium text-navy">platform</span>
              <select
                name="platform"
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
                defaultValue="tiktok"
              >
                {PRIMARY_DISTRIBUTION_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}（正式対象）
                  </option>
                ))}
                {Object.keys(DEFAULT_PLATFORM_LIMITS)
                  .filter(
                    (p) =>
                      !PRIMARY_DISTRIBUTION_PLATFORMS.includes(
                        p as (typeof PRIMARY_DISTRIBUTION_PLATFORMS)[number],
                      ),
                  )
                  .map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="font-medium text-navy">accountName</span>
              <input
                name="accountName"
                required
                className="mt-1 w-full rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-navy">profileUrl</span>
              <input
                name="profileUrl"
                className="mt-1 w-full rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-navy">language</span>
              <input
                name="language"
                defaultValue="en"
                className="mt-1 w-full rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-navy">targetCountry</span>
              <input
                name="targetCountry"
                defaultValue="global"
                className="mt-1 w-full rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-navy">targetAudience</span>
              <input
                name="targetAudience"
                defaultValue="Overseas brands entering Japan"
                className="mt-1 w-full rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-navy">dailyLimit</span>
              <input
                name="dailyLimit"
                type="number"
                min={0}
                defaultValue={1}
                className="mt-1 w-full rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-navy">weeklyLimit</span>
              <input
                name="weeklyLimit"
                type="number"
                min={0}
                defaultValue={3}
                className="mt-1 w-full rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" name="postingEnabled" defaultChecked />
              postingEnabled
            </label>
            <label className="text-sm">
              <span className="font-medium text-navy">
                oauthSecretRef（env名のみ。トークン不可）
              </span>
              <input
                name="oauthSecretRef"
                placeholder="MARKETING_TIKTOK_ACCESS_TOKEN"
                className="mt-1 w-full rounded-md border border-border px-3 py-2"
              />
            </label>
          </div>
        </ActionForm>
        {data.accounts.map((a) => (
          <div key={a.id} className="rounded-md border border-border p-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <StatusBadge value={a.platform} />
              <span className="font-medium text-navy">{a.accountName}</span>
              <StatusBadge value={a.status} />
              <span className="text-xs text-muted">
                {a.officialApiConnected ? "Official API" : "Manual Publish"}
              </span>
              <span className="text-xs text-muted">
                {a.language} / {a.targetCountry || a.country || "—"} / day{" "}
                {a.dailyLimit} / week {a.weeklyLimit}
              </span>
            </div>
            <ActionForm action={updateSocialAccountAction} label="アカウント設定を保存">
              <input type="hidden" name="accountId" value={a.id} />
              <input type="hidden" name="platform" value={a.platform} />
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                <input
                  name="accountName"
                  defaultValue={a.accountName}
                  className="rounded-md border border-border px-2 py-1 text-sm"
                />
                <input
                  name="profileUrl"
                  defaultValue={a.profileUrl ?? ""}
                  placeholder="profileUrl"
                  className="rounded-md border border-border px-2 py-1 text-sm"
                />
                <input
                  name="language"
                  defaultValue={a.language}
                  className="rounded-md border border-border px-2 py-1 text-sm"
                />
                <input
                  name="targetCountry"
                  defaultValue={a.targetCountry ?? a.country ?? ""}
                  placeholder="targetCountry"
                  className="rounded-md border border-border px-2 py-1 text-sm"
                />
                <input
                  name="targetAudience"
                  defaultValue={a.targetAudience ?? ""}
                  placeholder="targetAudience"
                  className="rounded-md border border-border px-2 py-1 text-sm"
                />
                <input
                  name="dailyLimit"
                  type="number"
                  defaultValue={a.dailyLimit}
                  className="rounded-md border border-border px-2 py-1 text-sm"
                />
                <input
                  name="weeklyLimit"
                  type="number"
                  defaultValue={a.weeklyLimit}
                  className="rounded-md border border-border px-2 py-1 text-sm"
                />
                <input
                  name="oauthSecretRef"
                  defaultValue={a.oauthSecretRef ?? ""}
                  placeholder="env var name only"
                  className="rounded-md border border-border px-2 py-1 text-sm"
                />
                <label className="flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    name="postingEnabled"
                    defaultChecked={a.postingEnabled}
                  />
                  postingEnabled
                </label>
                <label className="flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    name="autoPublishEnabled"
                    defaultChecked={a.autoPublishEnabled}
                  />
                  autoPublish（公式API必須・初期OFF）
                </label>
              </div>
            </ActionForm>
          </div>
        ))}
      </Card>

      <Card title="Content Calendar" id="calendar">
        {data.calendar.length === 0 ? (
          <p className="text-sm text-muted">予定はまだありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-muted">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Platform</th>
                  <th className="py-2 pr-3">Content</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Country</th>
                  <th className="py-2 pr-3">Audience</th>
                  <th className="py-2 pr-3">CTA</th>
                  <th className="py-2">Scheduled time</th>
                </tr>
              </thead>
              <tbody>
                {data.calendar.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="py-2 pr-3">{row.calendarDate}</td>
                    <td className="py-2 pr-3">{row.platform}</td>
                    <td className="py-2 pr-3">{row.title}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge value={row.status} />
                    </td>
                    <td className="py-2 pr-3">{row.targetCountry || "—"}</td>
                    <td className="py-2 pr-3">{row.targetAudience || "—"}</td>
                    <td className="py-2 pr-3">{row.cta?.slice(0, 40) || "—"}</td>
                    <td className="py-2">{formatWhen(row.scheduledTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Scheduled / Published Posts" id="posts">
        <p className="text-xs text-muted">
          フロー: Generate → Review → Approve → Schedule → Publish。Manual Publish
          Required は公式API未接続時の保存状態です。
        </p>
        {data.posts.length === 0 ? (
          <p className="text-sm text-muted">投稿原稿はまだありません。</p>
        ) : (
          <ul className="space-y-3">
            {data.posts.map((p) => (
              <li key={p.id} className="rounded-md border border-border p-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <StatusBadge value={p.platform} />
                  <StatusBadge value={p.status} />
                  <Link
                    href={`/admin/marketing-agent/posts/${p.id}`}
                    prefetch={false}
                    className="font-medium text-navy hover:text-teal"
                  >
                    {p.title || p.platform}
                  </Link>
                </div>
                <p className="mt-1 line-clamp-3 text-xs text-muted whitespace-pre-wrap">
                  {p.body.slice(0, 280)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <ActionForm
                    action={setPostStatusAction}
                    label="Review"
                    hidden={{ postId: p.id, status: "pending_review" }}
                  />
                  <ActionForm
                    action={setPostStatusAction}
                    label="Approve"
                    hidden={{ postId: p.id, status: "approved" }}
                  />
                  <ActionForm action={schedulePostAction} label="Schedule">
                    <input type="hidden" name="postId" value={p.id} />
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
                    hidden={{ postId: p.id }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted">
          scheduled {scheduled.length} / published {published.length} / manual{" "}
          {manual.length}
        </p>
      </Card>

      <Card title="Performance 手入力" id="performance">
        <p className="text-sm text-muted">
          公式インサイトが無い媒体は管理者が数値を記録します。UTM は投稿生成時に付与されます。
        </p>
        <ActionForm action={recordPerformanceAction} label="指標を保存">
          <div className="grid gap-2 md:grid-cols-4">
            <input
              name="postId"
              placeholder="postId（任意）"
              className="rounded-md border border-border px-2 py-1 text-sm"
            />
            <input
              name="contentId"
              placeholder="contentId（任意）"
              className="rounded-md border border-border px-2 py-1 text-sm"
            />
            <input
              name="platform"
              placeholder="platform"
              className="rounded-md border border-border px-2 py-1 text-sm"
            />
            <input
              name="country"
              placeholder="country"
              className="rounded-md border border-border px-2 py-1 text-sm"
            />
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
              <input
                key={name}
                name={name}
                type="number"
                min={0}
                defaultValue={0}
                placeholder={name}
                className="rounded-md border border-border px-2 py-1 text-sm"
              />
            ))}
          </div>
        </ActionForm>
      </Card>

      <Card title="Global signals / Platform targets / Mentions">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-navy">Signals</p>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {data.signals.slice(0, 8).map((s) => (
                <li key={s.id}>
                  {s.country} / {s.topic}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-navy">Communities</p>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {data.targets.slice(0, 8).map((t) => (
                <li key={t.id}>
                  {t.doNotPromote ? "⛔ " : ""}
                  {t.platform}: {t.reason?.slice(0, 60)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-navy">Mentions</p>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {data.mentions.slice(0, 8).map((m) => (
                <li key={m.id}>{m.snippet?.slice(0, 80)}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card title="最近の実行">
        {data.runs.length === 0 ? (
          <p className="text-sm text-muted">実行履歴はありません。</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {data.runs.slice(0, 12).map((r) => (
              <li key={r.id} className="flex flex-wrap gap-2">
                <StatusBadge value={r.status} />
                <span className="text-navy">{r.runType}</span>
                <span className="text-muted">{r.summary}</span>
                <span className="text-xs text-muted">{formatWhen(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function TopList({
  title,
  items,
}: {
  title: string;
  items: { name: string; score: number }[];
}) {
  return (
    <div>
      <p className="text-sm font-medium text-navy">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted">データなし</p>
      ) : (
        <ul className="mt-1 space-y-1 text-sm text-muted">
          {items.map((item) => (
            <li key={item.name}>
              {item.name}{" "}
              <span className="text-xs">({item.score.toFixed(0)})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
