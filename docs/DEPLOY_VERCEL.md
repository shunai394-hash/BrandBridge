# Vercel デプロイ手順

BrandBridge（Next.js App Router）を Vercel にデプロイし、第三者がアクセスできるベータ版にする手順です。

## 前提

- [ ] GitHub にリポジトリがある（[GITHUB_CHECKLIST.md](./GITHUB_CHECKLIST.md)）
- [ ] 本番 Supabase のマイグレーションと Auth URL 設定が完了（[SUPABASE_PRODUCTION.md](./SUPABASE_PRODUCTION.md)）
- [ ] 環境変数の意味を把握している（[ENV.md](./ENV.md)）

## 手順 A: ダッシュボードから（推奨）

1. [Vercel](https://vercel.com) にログイン
2. **Add New… → Project**
3. GitHub の `BrandBridge` リポジトリを Import
4. Framework Preset: **Next.js**（自動検出）
5. Root Directory: `.`（リポジトリ直下）
6. **Environment Variables** を追加:

| Name | Value | Environment |
|------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Production（必要なら Preview も） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | 同上 |
| `NEXT_PUBLIC_SITE_URL` | `https://あなたのドメイン` | **Production 必須** |

7. **Deploy** をクリック
8. デプロイ完了後、発行された URL を開いて動作確認

## 手順 B: CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SITE_URL
vercel --prod
```

## デプロイ後に必ずやること

### 1. Supabase Auth の URL を本番に合わせる

Authentication → URL Configuration:

- Site URL = 本番 URL（例: `https://brandbridge.vercel.app` またはカスタムドメイン）
- Redirect URLs に本番 URL（`https://.../**`）を追加

これを忘れると、ログイン・登録後のリダイレクトが失敗します。

### 2. `NEXT_PUBLIC_SITE_URL` の更新

カスタムドメインを後から付けた場合:

1. Vercel でドメインを付与
2. `NEXT_PUBLIC_SITE_URL` をその HTTPS URL に更新
3. **Redeploy**（環境変数は再デプロイで反映）

### 3. スモークテスト

| 確認 | URL / 操作 |
|------|------------|
| トップ | `/` |
| 案件一覧 | `/cases` |
| 利用規約 / プライバシー | `/terms` `/privacy` |
| 問い合わせ送信 | `/contact` |
| 商品提供企業として登録 | `/register/maker` |
| ログイン | `/login` |
| OG | SNS カードデバッガ、または `/opengraph-image` |

### 4. 管理者

[ADMIN_SETUP.md](./ADMIN_SETUP.md) に従い、最初の `admin` を作成し `/admin` に入れることを確認。

## カスタムドメイン（任意）

1. Vercel → Project → Settings → Domains
2. ドメインを追加し、DNS（A / CNAME）を指示どおり設定
3. HTTPS 発行を待つ
4. `NEXT_PUBLIC_SITE_URL` と Supabase Site URL / Redirect URLs を更新
5. Redeploy

## よくある問題

| 症状 | 確認ポイント |
|------|----------------|
| 画面は出るがログインできない | Supabase URL/Anon Key、Auth Redirect URLs |
| 登録後プロフィールが空 | `001_init` の `handle_new_user` トリガー |
| 案件が一覧に出ない | `review_status = approved` かつ `status = open` |
| OG / sitemap が変 | `NEXT_PUBLIC_SITE_URL` |
| 問い合わせが失敗 | `008_contact_inquiries.sql` 未実行 / RLS |
| Build 失敗 | ローカルで `npm run build`、環境変数不足 |

## ロールバック

Vercel → Deployments → 直前の成功デプロイ → **Promote to Production**

---

公開後の管理者作業は [ADMIN_SETUP.md](./ADMIN_SETUP.md) を参照してください。
