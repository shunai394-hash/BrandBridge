"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  discoverOpportunitiesAction,
  fetchSearchConsoleAction,
  generateArticleAction,
  generateSocialAction,
  proposeGeoAction,
  proposeInternalLinksAction,
  runCompetitorAnalysisAction,
  runMarketResearchAction,
  runSiteAnalysisAction,
  setCompetitorGapStatusAction,
  setCompetitorStatusAction,
  setIdeaStatusAction,
  setRecommendationStatusAction,
} from "@/lib/marketing-agent/actions";
import type {
  MarketingAgentOverview,
  MarketingAgentRun,
  MarketingCompetitor,
  MarketingCompetitorGap,
  MarketingContentDraft,
  MarketingContentIdea,
  MarketingRecommendation,
} from "@/lib/marketing-agent/types";
import { asRecord, asString } from "@/lib/marketing-agent/json";
import { ActionForm, VoidActionForm } from "@/components/admin/marketing-agent/ActionForm";
import { BusinessPrVideoGenerator } from "@/components/admin/marketing-agent/BusinessPrVideoGenerator";
import {
  StatusBadge,
  priorityTone,
  runStatusTone,
} from "@/components/admin/marketing-agent/StatusBadge";

type MarketingAgentConsoleProps = {
  overview: MarketingAgentOverview;
  runs: MarketingAgentRun[];
  ideas: MarketingContentIdea[];
  drafts: MarketingContentDraft[];
  recommendations: MarketingRecommendation[];
  competitors: MarketingCompetitor[];
  gaps: MarketingCompetitorGap[];
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function isoInput(daysAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function Card({
  href,
  label,
  value,
  hint,
}: {
  href: string;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <a
      href={href}
      className="rounded-lg border border-border bg-surface p-5 transition hover:border-teal/40"
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-shippori)] text-2xl text-navy">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </a>
  );
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-lg border border-border bg-cream/40 p-5 md:p-6"
    >
      <div className="mb-4 border-b border-border pb-3">
        <h2 className="font-[family-name:var(--font-shippori)] text-xl text-navy">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function StatusActions({
  id,
  action,
  acceptValue,
  rejectValue,
}: {
  id: string;
  action: (formData: FormData) => Promise<{ error?: string }>;
  acceptValue: string;
  rejectValue: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <ActionForm
        action={action}
        label="採用"
        pendingLabel="更新中…"
        className="inline-block"
      >
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value={acceptValue} />
      </ActionForm>
      <ActionForm
        action={action}
        label="見送り"
        pendingLabel="更新中…"
        variant="outline"
        className="inline-block"
      >
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value={rejectValue} />
      </ActionForm>
    </div>
  );
}

export function MarketingAgentConsole({
  overview,
  runs,
  ideas,
  drafts,
  recommendations,
  competitors,
  gaps,
}: MarketingAgentConsoleProps) {
  const gsc = overview.connections.searchConsole;
  const ai = overview.connections.ai;
  const agentReach = overview.connections.agentReach;
  const seoRecs = recommendations.filter(
    (item) => item.category === "seo" || item.category === "keyword",
  );
  const pageRecs = recommendations.filter(
    (item) => item.category === "existing_page",
  );
  const geoRecs = recommendations.filter((item) => item.category === "geo");
  const linkRecs = recommendations.filter(
    (item) => item.category === "internal_link",
  );
  const socialRecs = recommendations.filter((item) => item.category === "social");
  const proposedIdeas = ideas.filter((idea) => idea.status === "proposed");
  const latestGsc = runs.find((run) => run.runType === "search_console");
  const gscResult = latestGsc ? asRecord(latestGsc.result) : {};
  const gscRows = Array.isArray(gscResult.rows) ? gscResult.rows : [];

  return (
    <div className="space-y-8">
      {overview.migrationError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {overview.migrationError}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          href="#overview"
          label="Search Console status"
          value={gsc.configured ? "接続済" : "未接続"}
          hint={
            gsc.configured
              ? gsc.siteUrl ?? ""
              : "サイト分析だけでも利用できます"
          }
        />
        <Card
          href="#overview"
          label="Last analysis"
          value={
            overview.lastAnalysisStatus
              ? overview.lastAnalysisStatus
              : "未実行"
          }
          hint={formatDate(overview.lastAnalysisAt)}
        />
        <Card
          href="#ideas"
          label="Content opportunities"
          value={String(overview.opportunityCount)}
          hint="proposed の記事案"
        />
        <Card
          href="#drafts"
          label="Draft articles"
          value={String(overview.draftCount)}
          hint="未公開ドラフト（自動公開なし）"
        />
        <Card
          href="#seo"
          label="SEO recommendations"
          value={String(overview.seoRecommendationCount)}
        />
        <Card
          href="#geo"
          label="GEO recommendations"
          value={String(overview.geoRecommendationCount)}
        />
        <Card
          href="#competitors"
          label="Competitors"
          value={String(overview.competitorCount)}
          hint="公開情報の競合候補"
        />
        <Card
          href="#competitors"
          label="Competitive gaps"
          value={String(overview.gapCount)}
        />
      </div>

      <Section
        id="overview"
        title="1. Overview"
        description="AI と Search Console の接続状態。v1 は確認してから採用する運用です。公開・SNS投稿は自動では行いません。"
      >
        <dl className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-4">
            <dt className="text-sm text-muted">AI API</dt>
            <dd className="mt-1 flex items-center gap-2">
              <StatusBadge
                label={ai.configured ? "設定済" : "AI API未設定"}
                tone={ai.configured ? "teal" : "amber"}
              />
              {ai.provider ? (
                <span className="text-xs text-muted">{ai.provider}</span>
              ) : null}
              {ai.model ? (
                <span className="text-xs text-muted">{ai.model}</span>
              ) : null}
            </dd>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <dt className="text-sm text-muted">AgentReach / 公開リサーチ</dt>
            <dd className="mt-1">
              <StatusBadge
                label={
                  agentReach.webReader
                    ? "公開Web利用可"
                    : "リサーチ無効"
                }
                tone={agentReach.webReader ? "teal" : "amber"}
              />
              {agentReach.cliAvailable ? (
                <StatusBadge label="ローカルCLI" tone="navy" />
              ) : (
                <StatusBadge label="CLIなし（本番でも可）" />
              )}
              <p className="mt-2 text-xs text-muted">{agentReach.note}</p>
            </dd>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <dt className="text-sm text-muted">Google Search Console</dt>
            <dd className="mt-1">
              <StatusBadge
                label={gsc.configured ? "接続済" : "Search Console未接続"}
                tone={gsc.configured ? "teal" : "amber"}
              />
              {typeof gscResult.error === "string" && gscResult.error ? (
                <p className="mt-2 text-xs text-red-700">{gscResult.error}</p>
              ) : null}
            </dd>
          </div>
        </dl>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-navy">分析開始</h3>
            <p className="mb-3 text-sm text-muted">
              公開ページを取得し、SEO / キーワード観点を AI が分析します。GSC
              があれば合わせて使います。
            </p>
            <VoidActionForm
              action={runSiteAnalysisAction}
              label="分析開始"
              pendingLabel="分析中…"
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-navy">
              検索パフォーマンスを取得
            </h3>
            <ActionForm
              action={fetchSearchConsoleAction}
              label="検索パフォーマンスを取得"
              pendingLabel="取得中…"
              variant="outline"
            >
              <div className="flex flex-wrap gap-3">
                <label className="text-xs text-muted">
                  開始
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={isoInput(28)}
                    className="mt-1 block rounded-md border border-border bg-surface px-2 py-1 text-sm text-navy"
                  />
                </label>
                <label className="text-xs text-muted">
                  終了
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={isoInput(0)}
                    className="mt-1 block rounded-md border border-border bg-surface px-2 py-1 text-sm text-navy"
                  />
                </label>
              </div>
            </ActionForm>
          </div>
        </div>

        {gscRows.length > 0 ? (
          <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-cream/50 text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">query</th>
                  <th className="px-3 py-2 font-medium">page</th>
                  <th className="px-3 py-2 font-medium">clicks</th>
                  <th className="px-3 py-2 font-medium">impr.</th>
                  <th className="px-3 py-2 font-medium">ctr</th>
                  <th className="px-3 py-2 font-medium">pos</th>
                </tr>
              </thead>
              <tbody>
                {gscRows.slice(0, 15).map((row, index) => {
                  const item = asRecord(row);
                  return (
                    <tr
                      key={`${item.query}-${item.page}-${index}`}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-3 py-2">{asString(item.query)}</td>
                      <td className="max-w-[14rem] truncate px-3 py-2 text-muted">
                        {asString(item.page)}
                      </td>
                      <td className="px-3 py-2">{String(item.clicks ?? 0)}</td>
                      <td className="px-3 py-2">
                        {String(item.impressions ?? 0)}
                      </td>
                      <td className="px-3 py-2">
                        {typeof item.ctr === "number"
                          ? `${(item.ctr * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {typeof item.position === "number"
                          ? item.position.toFixed(1)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {runs.length > 0 ? (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-navy">最近の実行</h3>
            <ul className="space-y-2 text-sm">
              {runs.slice(0, 8).map((run) => (
                <li
                  key={run.id}
                  className="flex flex-wrap items-center gap-2 text-muted"
                >
                  <StatusBadge
                    label={run.status}
                    tone={runStatusTone(run.status)}
                  />
                  <span className="text-navy">{run.runType}</span>
                  <span>{formatDate(run.createdAt)}</span>
                  {typeof run.result.error === "string" ? (
                    <span className="text-red-700">{run.result.error}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      <Section
        id="seo"
        title="2. SEO Opportunities"
        description="CTR 改善、11–30位の伸びしろ、既存ページ改善など。Search Console 未接続でもサイト分析結果は残ります。"
      >
        {seoRecs.length === 0 && pageRecs.length === 0 ? (
          <p className="text-sm text-muted">
            まだ提案がありません。「分析開始」を実行してください。
          </p>
        ) : (
          <ul className="space-y-3">
            {[...seoRecs, ...pageRecs].slice(0, 20).map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={item.priority}
                    tone={priorityTone(item.priority)}
                  />
                  <StatusBadge label={item.category} tone="navy" />
                  <StatusBadge label={item.status} />
                  <p className="font-medium text-navy">{item.title}</p>
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted">
                  {item.description}
                </p>
                {item.status === "open" ? (
                  <div className="mt-3">
                    <StatusActions
                      id={item.id}
                      action={setRecommendationStatusAction}
                      acceptValue="accepted"
                      rejectValue="dismissed"
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        id="ideas"
        title="3. Content Ideas"
        description="今 BrandBridge が書くべき英語記事。海外メーカーの日本進出検索意図に答える案です。"
      >
        <VoidActionForm
          action={discoverOpportunitiesAction}
          label="コンテンツ機会を分析"
          pendingLabel="分析中…"
        />
        {ideas.length === 0 ? (
          <p className="mt-4 text-sm text-muted">記事案はまだありません。</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {ideas.slice(0, 20).map((idea) => (
              <li
                key={idea.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={idea.priority}
                    tone={priorityTone(idea.priority)}
                  />
                  <StatusBadge label={idea.status} />
                  <p className="font-medium text-navy">{idea.title}</p>
                </div>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">target keyword</dt>
                    <dd>{idea.targetKeyword ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">search intent</dt>
                    <dd>{idea.searchIntent ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">audience</dt>
                    <dd>{idea.targetAudience ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">type</dt>
                    <dd>{idea.contentType ?? "—"}</dd>
                  </div>
                </dl>
                {idea.reasoning ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted">
                    {idea.reasoning}
                  </p>
                ) : null}
                {idea.status === "proposed" ? (
                  <div className="mt-3">
                    <StatusActions
                      id={idea.id}
                      action={setIdeaStatusAction}
                      acceptValue="accepted"
                      rejectValue="rejected"
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        id="drafts"
        title="4. Article Drafts"
        description="選択した記事案から英語ドラフトを生成します。DB に draft として保存し、サイトへは公開しません。"
      >
        <ActionForm
          action={generateArticleAction}
          label="記事を生成"
          pendingLabel="生成中…"
        >
          <label className="block text-sm text-muted">
            記事案
            <select
              name="ideaId"
              className="mt-1 block w-full max-w-xl rounded-md border border-border bg-surface px-3 py-2 text-navy"
              defaultValue={proposedIdeas[0]?.id ?? ideas[0]?.id ?? ""}
            >
              {ideas.length === 0 ? (
                <option value="">先にコンテンツ機会を分析してください</option>
              ) : (
                ideas.map((idea) => (
                  <option key={idea.id} value={idea.id}>
                    [{idea.priority}] {idea.title}
                  </option>
                ))
              )}
            </select>
          </label>
        </ActionForm>

        {drafts.length === 0 ? (
          <p className="mt-4 text-sm text-muted">ドラフトはまだありません。</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {drafts.map((draft) => (
              <li
                key={draft.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <StatusBadge label={draft.status} tone="navy" />
                      <StatusBadge label={draft.language} />
                    </div>
                    <Link
                      href={`/admin/marketing-agent/drafts/${draft.id}`}
                      prefetch={false}
                      className="font-medium text-navy hover:text-teal hover:underline"
                    >
                      {draft.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      /{draft.slug ?? ""} · {formatDate(draft.createdAt)}
                    </p>
                  </div>
                </div>
                {draft.metaDescription ? (
                  <p className="mt-2 text-sm text-muted">
                    {draft.metaDescription}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        id="pages"
        title="5. Existing Page Improvements"
        description="既存記事の title / meta / FAQ / 定義 / 比較表など、AI検索向け（GEO）を含む改善提案です。"
      >
        <ActionForm
          action={proposeGeoAction}
          label="GEO向け提案を生成"
          pendingLabel="生成中…"
          variant="outline"
        >
          <label className="block text-sm text-muted">
            対象ドラフト（任意）
            <select
              name="draftId"
              className="mt-1 block w-full max-w-xl rounded-md border border-border bg-surface px-3 py-2 text-navy"
              defaultValue=""
            >
              <option value="">既存公開ページ全体</option>
              {drafts.map((draft) => (
                <option key={draft.id} value={draft.id}>
                  {draft.title}
                </option>
              ))}
            </select>
          </label>
        </ActionForm>
        {geoRecs.length === 0 ? (
          <p className="mt-4 text-sm text-muted">GEO 提案はまだありません。</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {geoRecs.slice(0, 15).map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={item.priority}
                    tone={priorityTone(item.priority)}
                  />
                  <p className="font-medium text-navy">{item.title}</p>
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted">
                  {item.description}
                </p>
                {item.status === "open" ? (
                  <div className="mt-3">
                    <StatusActions
                      id={item.id}
                      action={setRecommendationStatusAction}
                      acceptValue="accepted"
                      rejectValue="dismissed"
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        id="links"
        title="6. Internal Links"
        description="このページから、このページへ、このアンカーで、という内部リンク候補です。"
      >
        <VoidActionForm
          action={proposeInternalLinksAction}
          label="内部リンクを提案"
          pendingLabel="生成中…"
          variant="outline"
        />
        {linkRecs.length === 0 ? (
          <p className="mt-4 text-sm text-muted">内部リンク提案はまだありません。</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-cream/50 text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">source</th>
                  <th className="px-3 py-2 font-medium">target</th>
                  <th className="px-3 py-2 font-medium">anchor</th>
                  <th className="px-3 py-2 font-medium">reason</th>
                </tr>
              </thead>
              <tbody>
                {linkRecs.slice(0, 20).map((item) => {
                  const data = item.data;
                  return (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-mono text-xs">
                        {asString(data.sourcePath) || item.title}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {asString(data.targetPath)}
                      </td>
                      <td className="px-3 py-2">{asString(data.anchor)}</td>
                      <td className="px-3 py-2 text-muted">
                        {item.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section
        id="social"
        title="7. Social Content"
        description="LinkedIn / X / Substack / Reddit 向け英語投稿案。媒体ごとに文面を分けます。自動投稿はしません。"
      >
        <ActionForm
          action={generateSocialAction}
          label="SNS投稿を生成"
          pendingLabel="生成中…"
        >
          <label className="block text-sm text-muted">
            ドラフト
            <select
              name="draftId"
              className="mt-1 block w-full max-w-xl rounded-md border border-border bg-surface px-3 py-2 text-navy"
              defaultValue={drafts[0]?.id ?? ""}
            >
              {drafts.length === 0 ? (
                <option value="">先に記事ドラフトを生成してください</option>
              ) : (
                drafts.map((draft) => (
                  <option key={draft.id} value={draft.id}>
                    {draft.title}
                  </option>
                ))
              )}
            </select>
          </label>
        </ActionForm>
        {socialRecs.length === 0 ? (
          <p className="mt-4 text-sm text-muted">SNS 案はまだありません。</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {socialRecs.slice(0, 8).map((item) => {
              const posts = asRecord(asRecord(item.data).posts);
              const linkedin = asRecord(posts.linkedin);
              const substack = asRecord(posts.substack);
              const reddit = asRecord(posts.reddit);
              const tweets = Array.isArray(posts.x) ? posts.x : [];
              return (
                <li
                  key={item.id}
                  className="space-y-3 rounded-lg border border-border bg-surface p-4"
                >
                  <p className="font-medium text-navy">{item.title}</p>
                  <SocialBlock label="LinkedIn" text={asString(linkedin.text)} />
                  {tweets.map((tweet, index) => (
                    <SocialBlock
                      key={index}
                      label={`X ${index + 1}`}
                      text={asString(asRecord(tweet).text)}
                    />
                  ))}
                  <SocialBlock
                    label="Substack"
                    text={`${asString(substack.subject)}\n\n${asString(substack.text)}`}
                  />
                  <SocialBlock
                    label="Reddit"
                    text={`${asString(reddit.title)}\n\n${asString(reddit.text)}`}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section
        id="competitors"
        title="8. Competitor Analysis"
        description="公開情報のみ。自動DM・自動メール・自動接続はしません。Cookie は BrandBridge に保存しません。"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-navy">市場シグナル</h3>
            <p className="mb-3 text-sm text-muted">
              looking for Japanese distributor など、海外ブランドの公開検索需要を収集します。
            </p>
            <VoidActionForm
              action={runMarketResearchAction}
              label="市場リサーチを実行"
              pendingLabel="検索中…"
              variant="outline"
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-navy">競合調査</h3>
            <p className="mb-3 text-sm text-muted">
              競合候補の発見、公開ページの SEO/コンテンツ要約、差別化ギャップまで。
            </p>
            <VoidActionForm
              action={runCompetitorAnalysisAction}
              label="競合分析を実行"
              pendingLabel="分析中…"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <GapList
            title="Competitive Gaps"
            items={gaps.filter((item) => item.gapType === "competitive_gap")}
          />
          <GapList
            title="Keyword Gaps"
            items={gaps.filter(
              (item) =>
                item.gapType === "keyword_gap" ||
                item.gapType === "underserved_keyword",
            )}
          />
          <GapList
            title="Content Gaps"
            items={gaps.filter(
              (item) =>
                item.gapType === "content_gap" ||
                item.gapType === "underserved_topic",
            )}
          />
          <GapList
            title="Differentiation Opportunities"
            items={gaps.filter(
              (item) =>
                item.gapType === "differentiation" ||
                item.gapType === "recommended_action",
            )}
          />
        </div>

        <h3 className="mt-6 text-sm font-medium text-navy">Competitors</h3>
        {competitors.length === 0 ? (
          <p className="mt-2 text-sm text-muted">競合候補はまだありません。</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {competitors.slice(0, 15).map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge label={item.status} tone="navy" />
                  <Link
                    href={`/admin/marketing-agent/competitors/${item.id}`}
                    prefetch={false}
                    className="font-medium text-navy hover:text-teal hover:underline"
                  >
                    {item.companyName}
                  </Link>
                </div>
                {item.url ? (
                  <p className="truncate text-xs text-muted">{item.url}</p>
                ) : null}
                <p className="mt-2 text-sm text-muted">
                  {item.serviceSummary || item.strengths || "—"}
                </p>
                {item.status === "candidate" ? (
                  <div className="mt-3">
                    <StatusActions
                      id={item.id}
                      action={setCompetitorStatusAction}
                      acceptValue="watch"
                      rejectValue="dismissed"
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        <h3 className="mt-6 text-sm font-medium text-navy">Recommended Actions</h3>
        {gaps.filter((item) => item.gapType === "recommended_action").length ===
        0 ? (
          <p className="mt-2 text-sm text-muted">推奨アクションはまだありません。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {gaps
              .filter((item) => item.gapType === "recommended_action")
              .slice(0, 8)
              .map((item) => (
                <li key={item.id} className="text-sm text-navy">
                  <StatusBadge
                    label={item.priority}
                    tone={priorityTone(item.priority)}
                  />{" "}
                  {item.title}
                </li>
              ))}
          </ul>
        )}
      </Section>

      <Section
        id="business-pr-video"
        title="事業PR動画"
        description="会社・事業・ブランドを知ってもらい、BrandBridge へのアクセス・問い合わせにつなげる日本語の縦動画です。商品の選択は不要です。自動公開・SNS投稿はしません。"
      >
        <BusinessPrVideoGenerator />
      </Section>
    </div>
  );
}

function GapList({
  title,
  items,
}: {
  title: string;
  items: MarketingCompetitorGap[];
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h4 className="text-sm font-medium text-navy">{title}</h4>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-muted">なし</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.slice(0, 6).map((item) => (
            <li key={item.id} className="text-sm">
              <StatusBadge
                label={item.priority}
                tone={priorityTone(item.priority)}
              />{" "}
              <span className="text-navy">{item.title}</span>
              {item.status === "open" ? (
                <div className="mt-1">
                  <StatusActions
                    id={item.id}
                    action={setCompetitorGapStatusAction}
                    acceptValue="accepted"
                    rejectValue="dismissed"
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SocialBlock({ label, text }: { label: string; text: string }) {
  if (!text.trim()) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-teal">
        {label}
      </p>
      <pre className="mt-1 whitespace-pre-wrap rounded-md bg-cream/70 p-3 text-sm text-navy">
        {text.trim()}
      </pre>
    </div>
  );
}
