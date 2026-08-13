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
- 登録 Case から短尺 PR 動画台本 JSON（title / hook / scenes / cta）。画面表示・コピー・TXT のみ。DB 保存・音声・動画生成はしない
- 1記事から Instagram（Carousel/Reel）/ TikTok（短尺台本）/ LinkedIn（B2B）ほかへ**再構成**（同一文面のコピーではない）
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
| LinkedIn | 公式トークン + author URN があれば Official API。なければ Manual Publish |
| Instagram / TikTok / YouTube | 動画/メディア必須のため現状は Manual Publish（台本・予定は保存） |
| X / Reddit | 公式トークンがあれば Official API。なければ手動 |
| Medium / Substack / BrandBridge Blog | 常に手動（Blog は CMS 下書き） |

初期値: `auto_publish_enabled = false`  
管理者が明示的に ON にできるのは公式 API 接続時のみ。

少量上限の初期値:

- X: 1日1 / 週7
- LinkedIn: 1日1 / 週3
- Instagram: 1日1 / 週2
- TikTok: 1日1 / 週3
- その他: 管理画面で変更

## マイグレーション

既存 001–051 は編集しません。`052_marketing_engine.sql` は書き換えません。  
適用順と「旧 052/053 がある場合は 052 をスキップ」は [MARKETING_MIGRATIONS.md](./MARKETING_MIGRATIONS.md) を必ず読んでください。

TikTok 列（hook / narration / caption / hashtags）は `054_marketing_tiktok_distribution.sql` です。

RLS はすべて `public.is_admin()` のみ。

## 文章AIと音声AI

- 文章（記事・機会・再構成・Case PR台本）: Groq（既定）または OpenAI。`MARKETING_AI_PROVIDER` で切替。`completeJson()` が既存 `chatCompletion()` を利用。
- ナレーション音声: 既存 Voicebox API（`TTS_API_URL`、Qwen TTS 1.7B）。新しい TTS は作らない。
- キーはサーバー専用。ログ・画面・Git に出さない。

[ENV.md](./ENV.md) の Marketing Agent 節を参照。

## 週次パイプライン

`runWeeklyMarketingPipeline()` は管理画面から手動実行。cron は未設定（自動投稿もしない）。
