# Marketing Agent（管理者向け）

BrandBridge 自身の集客・SEO・GEO・コンテンツ企画を支援する内部ツールです。

- URL: `/admin/marketing-agent`
- **第4ロールではありません。** `profiles.role` は `maker` / `partner` / `admin` のままです。
- **自動公開はしません。** 生成物は管理画面で確認し、採用／見送りします。X への投稿は管理画面の確認後に手動実行します。自動投稿（`autoPost`）はオフです。

## 1. Supabase

SQL Editor で次を実行します（既存 migration は変更しません）。

```text
supabase/migrations/052_marketing_agent.sql
supabase/migrations/053_marketing_competitors.sql
supabase/migrations/054_social_posts.sql
supabase/migrations/055_social_posts_facebook.sql
```

作成されるテーブル（RLS: `is_admin()` のみ）:

- `marketing_agent_runs`
- `marketing_content_ideas`
- `marketing_content_drafts`
- `marketing_recommendations`
- `marketing_competitors`
- `marketing_competitor_gaps`
- `social_posts`（SNS投稿履歴。Secret は保存しない。`055` で facebook を追加）
- `social_oauth_tokens`（LinkedIn 個人トークン。サーバーのみ）

未実行でも `/admin` 自体は落ちません。Marketing Agent ページに「052 を実行してください」と出ます。

## 2. AI API（記事生成・分析）

サーバー専用。クライアントには出しません。

| 変数 | 必須 | 説明 |
|------|------|------|
| `MARKETING_AI_PROVIDER` | 任意 | `groq`（推奨）または `openai`。未設定時は `GROQ_API_KEY` があれば Groq |
| `GROQ_API_KEY` | Groq 実行時 | Groq Chat Completions |
| `GROQ_BASE_URL` | 任意 | 省略時 `https://api.groq.com/openai/v1` |
| `GROQ_MODEL` | 任意 | 省略時 `llama-3.3-70b-versatile` |
| `OPENAI_API_KEY` | OpenAI 実行時 | OpenAI 互換 Chat Completions |
| `OPENAI_MODEL` | 任意 | 省略時 `gpt-4o-mini` |
| `OPENAI_BASE_URL` | 任意 | 省略時 `https://api.openai.com/v1` |

Vercel: Project → Settings → Environment Variables に Production / Preview へ追加。

未設定時は画面に「AI API未設定」と出ます。サイトの公開ページは影響しません。

## 3. Google Search Console（任意）

未接続でもサイト分析・記事案は使えます。画面に「Search Console未接続」と出ます。

1. Google Cloud でプロジェクトを用意し、**Search Console API** を有効化する
2. サービスアカウントを作成し、JSON キーを発行する
3. [Search Console](https://search.google.com/search-console) の対象プロパティ → 設定 → ユーザーと権限 に、サービスアカウントの `client_email` を **閲覧者** で追加する
4. 環境変数を設定する

| 変数 | 説明 |
|------|------|
| `GOOGLE_SEARCH_CONSOLE_SITE_URL` | プロパティ URL。ドメインプロパティは `sc-domain:example.com`。URL プレフィックスは `https://example.com/`（末尾スラッシュ） |
| `GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL` | サービスアカウント email |
| `GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY` | PEM。改行は `\n` で可 |
| `GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON` | 上記2つの代わりに JSON 全体 |

取得データ: query / page / clicks / impressions / ctr / position（期間指定可、既定 28 日）。

## 4. 画面の使い方

1. **分析開始** … 公開ページを取得し、SEO 分析（GSC があれば併用）
2. **検索パフォーマンスを取得** … GSC のみ
3. **コンテンツ機会を分析** … 今書くべき英語記事案
4. **記事を生成** … 選択した案からドラフト（非公開。公開URLにはならない）
5. **GEO向け提案** / **内部リンクを提案**
6. **SNS投稿を生成** … 英語は毎回 AI が新しいテーマを決める。日本語PRは日本語の公開ページを選んで LinkedIn / X / Facebook / Instagram / TikTok / Substack / Reddit を媒体別に作成。URL は公式公開ページのみ。日本語ページが無いときは「日本語公開ページがありません」。自動投稿なし。X は確認後に `[Xに投稿]`
7. **市場リサーチ** / **競合分析** … 公開情報のみ。自動営業・自動DMなし
8. **事業PR動画を作成** … 会社・事業情報と複数画像から、認知・アクセスUPの日本語縦動画。商品選択は不要
9. 旧・商品PRコンポーネント（`PrScriptGenerator`）はファイルとして残るが、`/admin/marketing-agent` からは呼ばない。詳細は [MARKETING_PR_VIDEO.md](./MARKETING_PR_VIDEO.md)

記事URL・SNSリンクのオリジンは `NEXT_PUBLIC_SITE_URL`（`lib/site.ts` の `getSiteUrl()`）のみ。`brandbridge.co` などの推測ドメインは使いません。

## 6. SNS投稿（X 実投稿 / LinkedIn 個人プロフィール）

サーバー専用。ブラウザや `NEXT_PUBLIC_*` に Secret を置かないこと。Client Component から SNS API は呼びません。

| 変数 | 用途 |
|------|------|
| `X_API_KEY` / `X_API_SECRET` / `X_ACCESS_TOKEN` / `X_ACCESS_TOKEN_SECRET` | X OAuth 1.0a。管理画面の「Xに投稿」からのみ使用 |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | LinkedIn 個人 OAuth（`openid profile w_member_social`）。Callback は `/api/linkedin/callback` |
| `LINKEDIN_ACCESS_TOKEN` | 任意。OAuth の代わりにサーバーへ置く個人トークン |

- 投稿先 LinkedIn は個人プロフィール `https://www.linkedin.com/in/brandbridge/`。会社ページは作成しません。
- Instagram / TikTok は今回、文面・キャプションの生成とコピーまで。API 自動投稿は未接続です。
- Substack / Reddit は既存どおり生成のみです。


## 5. AgentReach（ローカルリサーチ基盤）

AgentReach は **Cursor / ローカル Agent 側** の公開Webリサーチ基盤です。BrandBridge 本番 DB には Cookie も認証情報も保存しません。

公式手順: https://github.com/Panniantong/agent-reach  
インストールはユーザーホームの venv のみ（ワークスペース禁止）:

```powershell
py -3 -m venv $env:USERPROFILE\.agent-reach-venv
& $env:USERPROFILE\.agent-reach-venv\Scripts\python.exe -m pip install https://github.com/Panniantong/agent-reach/archive/main.zip
& $env:USERPROFILE\.agent-reach-venv\Scripts\agent-reach.exe install --env=auto
```

`--system` と Cookie チャネル（X / Reddit / Instagram 等）は、ユーザーが明示承認するまで実行しません。

Marketing Agent は AgentReach のゼロ設定チャネルである **Jina Reader**（`https://r.jina.ai/` / `https://s.jina.ai/`）で公開ページ検索・読取を行います。CLI が無くても管理画面は落ちません。

市場シグナルの保存形式:

`source / url / date / companyPerson / signalType / summary / relevance / potentialLead / contentOpportunity`

将来の週次 cron 用に `runWeeklyMarketingPipeline()`（`lib/marketing-agent/jobs.ts`）を分離してあります。v1 ではスケジュールしません。
