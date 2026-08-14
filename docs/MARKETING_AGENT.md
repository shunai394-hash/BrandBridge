# Marketing Agent（管理者向け）

BrandBridge 自身の集客・SEO・GEO・コンテンツ企画を支援する内部ツールです。

- URL: `/admin/marketing-agent`
- **第4ロールではありません。** `profiles.role` は `maker` / `partner` / `admin` のままです。
- **自動公開・自動SNS投稿はしません。** 生成物は管理画面で確認し、採用／見送りします。

## 1. Supabase

SQL Editor で次を実行します（既存 migration は変更しません）。

```text
supabase/migrations/052_marketing_agent.sql
supabase/migrations/053_marketing_competitors.sql
```

作成されるテーブル（RLS: `is_admin()` のみ）:

- `marketing_agent_runs`
- `marketing_content_ideas`
- `marketing_content_drafts`
- `marketing_recommendations`
- `marketing_competitors`
- `marketing_competitor_gaps`

未実行でも `/admin` 自体は落ちません。Marketing Agent ページに「052 を実行してください」と出ます。

## 2. AI API（記事生成・分析）

サーバー専用。クライアントには出しません。

| 変数 | 必須 | 説明 |
|------|------|------|
| `AI_API_KEY` | 任意 | 設定されていれば最優先 |
| `GROQ_API_KEY` | `AI_API_KEY` が無いとき | 既存キー互換。`.env.local` の Groq キーをそのまま利用 |
| `AI_BASE_URL` | 任意 | 省略時 `https://api.groq.com/openai/v1`。OpenAI は `https://api.openai.com/v1` を明示したときのみ |
| `AI_MODEL` | 任意 | 省略時 `llama-3.3-70b-versatile` |

標準は Groq。OpenAI を使う場合は `AI_API_KEY` / `AI_BASE_URL=https://api.openai.com/v1` / `AI_MODEL` をすべて明示する。

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
4. **記事を生成** … 選択した案からドラフト（非公開）
5. **GEO向け提案** / **内部リンクを提案** / **SNS投稿を生成**
6. **市場リサーチ** / **競合分析** … 公開情報のみ。自動営業・自動DMなし
7. **PR Video Script Generator** … Case から台本 JSON。Copy / TXT。同じ枠に **Generate PR Video**（台本前からボタン表示、台本生成後に有効）
8. **Generate PR Video** … 台本 + 商品画像1枚から 9:16 MP4。DB保存・自動投稿なし。詳細は [MARKETING_PR_VIDEO.md](./MARKETING_PR_VIDEO.md)


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
