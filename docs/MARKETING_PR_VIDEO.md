# PR Video Generator（ローカル MVP）

`/admin/marketing-agent` の PR Script Generator から、Case の商品画像1枚 + 台本 JSON で約30秒の 9:16 MP4 を生成します。

**自動公開・SNS投稿はしません。DB にも保存しません。**

## 再利用するもの

- Case 取得: `getCaseById()`（`lib/cases.ts`）
- 台本: `generatePrVideoScript()` / `PrVideoScript`（`lib/marketing-agent/pr-script.ts`）
- AI: 既存 `completeJson()`（台本のみ。動画用に AI は呼ばない）
- 認証: `requireAdmin()`

## 新規処理

```text
Admin
  → Case 選択
  → PR Script 生成（既存）
  → POST /admin/marketing-agent/pr-video
  → requireAdmin()
  → getCaseById()
  → 画像 URL 検証（SSRF 防止）→ 取得
  → espeak-ng で narration WAV
  → FFmpeg Ken Burns + 字幕焼き込み + 音声 mux
  → MP4 をレスポンス（Blob）。public/ には保存しない
```

## ローカル実行

サーバーに必要:

- `ffmpeg` / `ffprobe`
- `espeak-ng`（日本語 voice `ja` あり）

```bash
sudo apt-get install -y ffmpeg espeak-ng
npm run dev
```

管理画面 `/admin/marketing-agent` で Case を選び、**Generate PR Video**（台本生成前から表示。台本がない間は disabled）を確認できます。PR Script を生成してからボタンが有効になります。

プレビューはブラウザの `<video>`（object URL）。Download MP4 は同じ Blob。

本番（Vercel）ではローカル ffmpeg は使いません。

```text
Admin → POST /admin/marketing-agent/pr-video
  → requireAdmin() + getCaseById() + 画像 URL 検証
  → Cloud Run POST /render (Bearer PR_VIDEO_WORKER_SECRET)
  → espeak-ng + FFmpeg
  → Cloudflare R2（private: brandbridge-pr-videos）
  → 署名付き GET URL を JSON で返す
  → 管理画面 Preview / Download
```

Cloud Run は GCP `glassy-filament-413307`。R2 は公開しません。

ローカル（`PR_VIDEO_WORKER_URL` 未設定かつ非 Vercel）のみ、従来どおりプロセス内 ffmpeg で MP4 バイナリを返します。

## 画像 URL 許可

fetch する前に検証します。許可:

- `NEXT_PUBLIC_SUPABASE_URL` ホストの `/storage/v1/object/public/product-images/` のみ（HTTPS）
- アプリ `public/` 配下の相対パス（`.jpg` `.jpeg` `.png` `.webp`）。パストラバーサル禁止

拒否: localhost / プライベート IP / link-local / metadata エンドポイント / 任意の外部ホスト。

## 動画仕様（MVP）

- 1080x1920、24fps、H.264 + AAC
- シーン duration は台本の `durationSeconds`。合計が 25–35 秒から大きく外れる場合は比例調整
- ナレーションは切らない。音声の方が長い場合は映像を伸ばす
- 字幕はナレーションを句読点で分割し、音声尺に比例して焼き込む（MoneyPrinterTurbo 互換のフォールバック方式）。`onScreenText` は使わない。字幕焼き込みに失敗しても映像・BGM・TTS はそのまま残る
- 同一商品画像に Ken Burns（zoom / pan）

## やらないこと

- `marketing_agent_runs` / 新規 migration / Case テーブル変更
- TikTok / Instagram / YouTube API
- 動画の `public/` 恒久保存
