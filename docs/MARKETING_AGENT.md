# Marketing Agent（内部エンジン）

BrandBridge 管理画面専用の Marketing Engine です。  
**第4のユーザーロールではありません。** `maker` / `partner` / `admin` は変更しません。

画面: `/admin/marketing-agent`（`diagnoseAdminAccess()` で保護）

目的: 調査 → コンテンツ作成 → 配信 → 計測 → 改善 → 拡大

## 何をするか

- Competitor Analysis（公開情報の要約。本文コピー禁止）
- 市場リサーチ / キーワード・コンテンツギャップ
- Search Console（任意）
- 既存 BrandBridge 記事のカタログ（上書きしない）
- 「今書くべき記事」の提案
- GEO を意識したブログ下書き（定義・質問見出し・FAQ・著者情報・引用）
- 1記事から Medium / Substack / LinkedIn / X / Instagram / YouTube / Reddit 向けに**再構成**（同一文面のコピーではない）
- 人間が作った SNS アカウントの接続と投稿上限
- Content Calendar と承認フロー（Generate → Review → Approve → Schedule → Publish）
- パフォーマンス記録と Global Growth ダッシュボード
- 約30日データ後の Scaling 提案（アカウント自動作成はしない）

## 何をしないか

- Cookie ログイン、スクレイピング投稿、規約回避
- SNS パスワード / Cookie の DB 保存
- OAuth トークンの平文カラム保存（env 名 `oauth_secret_ref` のみ）
- AI による SNS アカウント作成
- 既存公開ページ `app/en/**` の自動上書き
- 案件・交渉・契約・Stripe・Resend への接続

## 自動投稿

公式 API + 公式 OAuth が**実際に接続されている媒体のみ**自動投稿を試みます。  
未接続時は投稿原稿を保存し **Manual Publish Required** にします。

| 媒体 | v1 の既定 |
|------|-----------|
| X / LinkedIn / Reddit | 公式トークンがあれば Official API。なければ手動 |
| Instagram / YouTube | メディア資産が必要なため現状は手動 |
| Medium / Substack / BrandBridge Blog | 常に手動（Blog は CMS 下書き） |

初期値: `auto_publish_enabled = false`  
管理者が明示的に ON にできるのは公式 API 接続時のみ。

少量上限の初期値:

- X: 1日1 / 週7
- LinkedIn: 1日1 / 週3
- Instagram: 1日1 / 週2
- その他: 管理画面で変更

## マイグレーション

`supabase/migrations/052_marketing_engine.sql` を SQL Editor で実行。既存 001–051 は編集しません。

RLS はすべて `public.is_admin()` のみ。

## 環境変数（サーバー専用）

[ENV.md](./ENV.md) の Marketing Agent 節を参照。

## 週次パイプライン

`runWeeklyMarketingPipeline()` は管理画面から手動実行。cron は未設定（自動投稿もしない）。
