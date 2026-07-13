# GitHub 公開前チェック

第三者がクローン・閲覧できる状態にする前の確認リストです。

## 1. 秘密情報

- [ ] `.env.local` が **未追跡**（`git check-ignore -v .env.local` で ignore される）
- [ ] `git ls-files` に `.env` / `.pem` / 秘密鍵が含まれていない
- [ ] コード・Issue・コミットメッセージに本番キー・パスワードを書いていない
- [ ] `service_role` キーをリポジトリ・フロントコードに含めていない
- [ ] デモ用パスワード（`DemoPass123!` 等）を **本番ユーザーのパスワードにしない**

自動チェック:

```bash
npm run check:preflight
```

## 2. リポジトリ内容

- [ ] `README.md` にセットアップ・デプロイへのリンクがある
- [ ] `.env.example` にプレースホルダのみ（実キーなし）
- [ ] `supabase/migrations/001`〜`008` が揃っている
- [ ] 不要な一時ファイル・個人メモ・スクショが混ざっていない
- [ ] `node_modules` / `.next` / `.vercel` がコミットされていない

## 3. ビルド・品質

```bash
npm install
npm run build
npm run lint
```

- [ ] `npm run build` が成功する
- [ ] 重大な lint エラーがない（警告は許容可）

## 4. ドキュメント

- [ ] [ENV.md](./ENV.md) … 環境変数
- [ ] [SUPABASE_PRODUCTION.md](./SUPABASE_PRODUCTION.md) … 本番 Supabase
- [ ] [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) … Vercel デプロイ
- [ ] [ADMIN_SETUP.md](./ADMIN_SETUP.md) … 管理者初期設定

## 5. GitHub リポジトリ設定（推奨）

- [ ] リポジトリを作成（Private → 公開前に最終確認してから Public も可）
- [ ] Description / Topics（例: `nextjs`, `supabase`, `btob`）を設定
- [ ] デフォルトブランチを `main`（または運用方針に合わせる）
- [ ] Secrets にアプリ用キーを置かない（Vercel 側で管理）
- [ ] （任意）Branch protection / PR 必須

## 6. 公開後すぐ

- [ ] Vercel 連携と初回デプロイ成功
- [ ] 本番 URL でトップ・案件・問い合わせが開ける
- [ ] 管理者アカウントで `/admin` に入れる（[ADMIN_SETUP.md](./ADMIN_SETUP.md)）

## コミット前の最終コマンド

```bash
git status
git check-ignore -v .env.local
npm run check:preflight
npm run build
```

問題なければ remote を追加して push します。

```bash
git remote add origin https://github.com/<org-or-user>/BrandBridge.git
git branch -M main
git add -A
git status   # .env.local が含まれていないことを再確認
git commit -m "Prepare BrandBridge for beta production launch"
git push -u origin main
```

> 既にローカルコミットがある場合は、メッセージと差分を確認してから push してください。
