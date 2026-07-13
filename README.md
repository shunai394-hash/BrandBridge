# BrandBridge

メーカーと販売パートナーをつなぐ BtoB マッチングサービスです。運営が仲介できる管理機能付きです。

## 機能

- メーカー / 販売パートナー / 管理者（`admin`）
- 公開プロフィール / プロフィール編集
- 案件登録（商品・販売条件・希望パートナー）→ **運営審査後に公開**
- 案件一覧・詳細（国 / 販売形式 / 独占フィルタ）
- トップの人気案件・新着案件
- お気に入り
- 交渉申込・承認・メッセージ
- 成約プロセス（パイプライン）と成約（`deals`）管理
- 仲介手数料（設定変更可能・初期値 5%）
- 管理画面（案件審査・ユーザー管理・交渉一覧・成約集計）
- 利用規約 / プライバシーポリシー / お問い合わせ
- SEO（メタ・OG・favicon・sitemap / robots）

## 技術スタック

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase（Auth / PostgreSQL / RLS）
- Vercel（本番ホスティング想定）

## 本番・ベータ公開（スタートここから）

第三者がアクセスできる状態にする手順は `docs/` にまとめています。

| 順序 | ドキュメント | 内容 |
|------|----------------|------|
| 1 | [docs/GITHUB_CHECKLIST.md](./docs/GITHUB_CHECKLIST.md) | GitHub 公開前チェック |
| 2 | [docs/ENV.md](./docs/ENV.md) | 環境変数一覧 |
| 3 | [docs/SUPABASE_PRODUCTION.md](./docs/SUPABASE_PRODUCTION.md) | 本番 Supabase 設定確認 |
| 4 | [docs/DEPLOY_VERCEL.md](./docs/DEPLOY_VERCEL.md) | Vercel デプロイ手順 |
| 5 | [docs/ADMIN_SETUP.md](./docs/ADMIN_SETUP.md) | 管理者初期設定 |

```bash
npm run check:preflight
npm run build
```

## ローカルセットアップ

### 1. 依存関係

```bash
npm install
```

### 2. 環境変数

```bash
cp .env.example .env.local
```

詳細は [docs/ENV.md](./docs/ENV.md)。最低限:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Supabase マイグレーション

SQL Editor で順に実行（本番手順の詳細は [docs/SUPABASE_PRODUCTION.md](./docs/SUPABASE_PRODUCTION.md)）:

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_messages.sql`
3. `supabase/migrations/003_profile_trust.sql`
4. `supabase/migrations/004_case_enrichment.sql`
5. `supabase/migrations/005_admin_ops.sql`
6. `supabase/migrations/006_deal_management.sql`
7. `supabase/migrations/007_popular_cases.sql`
8. `supabase/migrations/008_contact_inquiries.sql`

### 4. デモ用サンプルデータ（任意）

```text
supabase/seed/demo_data.sql
```

| ロール | メール | パスワード |
|--------|--------|------------|
| メーカー | `maker1@demo.brandbridge.app` 〜 `maker5@...` | `DemoPass123!` |
| パートナー | `partner1@demo.brandbridge.app` / `partner2@...` | `DemoPass123!` |

### 5. 管理者

[docs/ADMIN_SETUP.md](./docs/ADMIN_SETUP.md) を参照。要約:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin@example.com';
```

### 6. 起動

```bash
npm run dev
```

## 主なルート

| パス | 内容 |
|------|------|
| `/` | トップ（人気・新着・カテゴリ導線） |
| `/cases` | 公開案件一覧（承認済みのみ） |
| `/cases/[id]` | 案件詳細・お気に入り・交渉申込 |
| `/contact` | お問い合わせ |
| `/terms` | 利用規約 |
| `/privacy` | プライバシーポリシー |
| `/favorites` | お気に入り一覧 |
| `/negotiations` | 交渉管理 |
| `/deals` | 成約一覧 |
| `/maker/cases/new` | 案件提出（審査待ち） |
| `/admin` | 運営ダッシュボード |
| `/admin/cases` | 案件審査 |
| `/admin/users` | ユーザー管理 |
| `/admin/negotiations` | 交渉パイプライン・成約化 |

## 案件カテゴリ

美容・コスメ / 食品・飲料 / 健康・サプリ / ファッション / 家電・ガジェット / 雑貨・ライフスタイル / 製造・産業 / その他

## DB 概要

- `profiles` … `maker` / `partner` / `admin`、`is_active`
- `cases` … `review_status`（`pending_review` / `approved` / `rejected`）
- `favorites` … ユーザー × 案件
- `negotiations` … `application_status` / `pipeline_status`
- `deals` … 成約（金額・手数料）
- `commission_settings` … デフォルト手数料率（初期 5%）
- `contact_inquiries` … お問い合わせ
- `messages` … 承認後メッセージ

## スクリプト

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run check:preflight
```
