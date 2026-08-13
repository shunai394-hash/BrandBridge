# 環境変数一覧

BrandBridge が参照する環境変数です。**秘密情報はリポジトリにコミットしないでください。**

## 必須（アプリ動作）

| 変数名 | 公開範囲 | 取得場所 | 説明 |
|--------|----------|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ブラウザに露出 | Supabase → Project Settings → API → Project URL | プロジェクトの API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ブラウザに露出 | Supabase → Project Settings → API → `anon` `public` | RLS 前提の公開キー |

`NEXT_PUBLIC_*` はクライアントにも埋め込まれるため、**必ず RLS を有効にしたまま**運用してください。  
**`service_role` キーはアプリに入れないでください**（本リポジトリでは未使用）。

## 推奨（本番・ベータ公開）

| 変数名 | 公開範囲 | 例 | 説明 |
|--------|----------|------|------|
| `NEXT_PUBLIC_SITE_URL` | ブラウザに露出 | `https://brandbridge.example.com` | OG・sitemap・canonical の基準 URL。末尾スラッシュなし |
| `NEXT_PUBLIC_SHOW_ERROR_DETAILS` | ブラウザに露出 | `true` | （任意・調査用）エラー画面に message / stack を表示。調査後は削除 |
| `BETA_AUTO_APPROVE_CASES` | サーバーのみ | `true` | ベータ: **新規**案件を `review_status=approved` で作成。一覧の公開条件は常に `approved`（商品提供企業本人は `pending_review` も表示） |
| `RESEND_API_KEY` | サーバーのみ | `re_...` | お問い合わせ通知・営業メール（Resend） |
| `CONTACT_RECEIVE_EMAIL` | サーバーのみ | `ops@example.com` | お問い合わせ通知の受信先 |
| `MAIL_FROM_NAME` | サーバーのみ | `BrandBridge` | `/admin/mail` 差出人名（必須） |
| `MAIL_FROM_ADDRESS` | サーバーのみ | `sales@brandbridge.jp` | `/admin/mail` 差出人アドレス（必須）。Reply-To と同一推奨 |
| `REPLY_TO_EMAIL` | サーバーのみ | `sales@brandbridge.jp` | `/admin/mail` Reply-To（必須）。未設定時は MAIL_FROM_ADDRESS |
| Resend Webhook | Dashboard | `email.received` → `/api/resend/inbound` | 受信を受信箱・スレッドへ自動反映 |

未設定時は `VERCEL_URL`（Vercel 自動）→ なければ `http://localhost:3000` にフォールバックします。  
本番では必ず独自ドメイン（または Vercel の本番 URL）を明示してください。

### 案件公開ルール（ベータ）

| 対象 | 表示条件 |
|------|----------|
| 一般・パートナー | `status=open` かつ `review_status=approved` |
| 商品提供企業本人 | 上記に加え、自分の `pending_review` / `rejected` |
| 新規 insert | `BETA_AUTO_APPROVE_CASES=true` なら `approved`、未設定なら `pending_review`（管理者審査向け） |

Supabase で migration `012_restore_case_review_select.sql` を実行し、RLS を「公開=approved / 本人=own」に戻してください。

## 自動（設定不要）

| 変数名 | 提供元 | 用途 |
|--------|--------|------|
| `VERCEL_URL` | Vercel | `NEXT_PUBLIC_SITE_URL` 未設定時のフォールバック |
| `NODE_ENV` | Next.js / 実行環境 | `development` / `production` |

## ローカル設定例

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BETA_AUTO_APPROVE_CASES=true
```

## Vercel 設定例（Production / Preview）

Project → Settings → Environment Variables に以下を追加:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | 本番 Supabase の Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 本番の `anon` key |
| `NEXT_PUBLIC_SITE_URL` | `https://あなたの本番ドメイン` |
| `BETA_AUTO_APPROVE_CASES` | `true`（ベータ中） |

## Auth 運用メモ（ダッシュボード側）

アプリコード以外に、Supabase Dashboard で次を揃えてください。

| 項目 | 推奨 |
|------|------|
| Authentication → Providers → Email | 有効 + **Confirm email ON** |
| Authentication → Providers → Google | 有効（OAuth Client 設定） |
| Redirect URLs | `{SITE_URL}/auth/callback` と `{SITE_URL}/**` |
| Google Cloud OAuth | Authorized redirect URI に `https://<project>.supabase.co/auth/v1/callback` |
| パスワードリセット | メールテンプレートのリンクが `/auth/callback` 経由になること |
| Storage | `product-images`（公開） / `negotiation-attachments`（非公開・018） |

Google ログイン失敗時は `/login?error=oauth` に日本語メッセージを出します（Provider 未有効・Redirect 不一致など）。

role 分岐（maker / partner / admin）と初回 setup 遷移はアプリの `/auth/callback` とログイン後リダイレクトで行います。

## Marketing Agent（任意・サーバー専用）

管理画面 `/admin/marketing-agent` 用。`NEXT_PUBLIC_*` にしない。未設定でも画面は開き、テンプレート生成 + Manual Publish で動きます。

| 変数名 | 説明 |
|--------|------|
| `OPENAI_API_KEY` | Chat Completions。未設定時はテンプレート下書き |
| `OPENAI_MODEL` | 既定 `gpt-4o-mini` |
| `OPENAI_BASE_URL` | 互換エンドポイント（任意） |
| `GOOGLE_SEARCH_CONSOLE_SITE_URL` | 例: `sc-domain:brandbridge.jp` |
| `GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL` | サービスアカウント |
| `GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY` | PEM（`\n` 可） |
| `AGENT_REACH_DISABLED` | `true` で公開 Web リサーチ（Jina）を停止 |
| `MARKETING_X_ACCESS_TOKEN` | X 公式 API（User context）。未設定は手動投稿 |
| `MARKETING_LINKEDIN_ACCESS_TOKEN` | LinkedIn 公式 API |
| `MARKETING_LINKEDIN_AUTHOR_URN` | 例: `urn:li:person:...` |
| `MARKETING_INSTAGRAM_ACCESS_TOKEN` | Instagram Graph（現状は手動扱い） |
| `MARKETING_INSTAGRAM_BUSINESS_ID` | IG ビジネス ID |
| `MARKETING_YOUTUBE_ACCESS_TOKEN` | YouTube Data API（現状は手動扱い） |
| `MARKETING_REDDIT_ACCESS_TOKEN` | Reddit OAuth |
| `MARKETING_REDDIT_USERNAME` | Reddit ユーザー名 |
| `MARKETING_REDDIT_SUBREDDIT` | 投稿先（人間が指定したコミュニティのみ） |

トークンは環境変数 / 秘密管理に置く。DB には env 名（`oauth_secret_ref`）だけを保存する。Cookie・SNSパスワードは保存しない。

詳細: [MARKETING_AGENT.md](./MARKETING_AGENT.md)

## やってはいけないこと

- `.env.local` / 本番キーを Git にコミットする
- `service_role` を `NEXT_PUBLIC_*` に入れる
- 開発用プロジェクトのキーを本番 Vercel に誤設定したまま公開する
- Auth の Redirect URL と `NEXT_PUBLIC_SITE_URL` が食い違ったまま運用する
- Confirm email をオフのまま本番運用する（要件: メール認証必須）

詳細手順は [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) / [SUPABASE_PRODUCTION.md](./SUPABASE_PRODUCTION.md) を参照してください。

