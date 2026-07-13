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

未設定時は `VERCEL_URL`（Vercel 自動）→ なければ `http://localhost:3000` にフォールバックします。  
本番では必ず独自ドメイン（または Vercel の本番 URL）を明示してください。

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
```

## Vercel 設定例（Production）

Project → Settings → Environment Variables に以下を追加（Environment: Production）:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | 本番 Supabase の Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 本番の `anon` key |
| `NEXT_PUBLIC_SITE_URL` | `https://あなたの本番ドメイン` |

Preview 環境を使う場合は、Preview 用に同じキーを入れ、`NEXT_PUBLIC_SITE_URL` は Preview URL に合わせるか省略（`VERCEL_URL` 利用）します。

## やってはいけないこと

- `.env.local` / 本番キーを Git にコミットする
- `service_role` を `NEXT_PUBLIC_*` に入れる
- 開発用プロジェクトのキーを本番 Vercel に誤設定したまま公開する
- Auth の Redirect URL と `NEXT_PUBLIC_SITE_URL` が食い違ったまま運用する

詳細手順は [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) / [SUPABASE_PRODUCTION.md](./SUPABASE_PRODUCTION.md) を参照してください。
