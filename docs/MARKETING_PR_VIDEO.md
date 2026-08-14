# PR / 事業PR動画（ローカル MVP）

BrandBridge の動画生成は、**会社・事業・ブランドの認知とアクセス向上**が目的です。特定商品の販売動画ではありません。

管理画面 `/admin/marketing-agent` の **「事業PR動画を作成」** から開始します。商品（Case）の選択は不要です。

**自動公開・SNS投稿はしません。DB にも保存しません。**

## 事業PR動画（現行）

```text
Admin
  → 「事業PR動画を作成」
  → 会社・ブランド名 / 事業内容 / ターゲット / 動画の目的
  → 画像を複数追加（2枚以上。商品画像である必要はない）
  → AI が日本語の認知・アクセスUP台本を生成
  → 内容を確認
  → POST /admin/marketing-agent/business-pr-video
  → requireAdmin()（Case は見ない）
  → アップロード画像をシーンごとに割当
  → espeak-ng -v ja でナレーション
  → FFmpeg Ken Burns + シーン切替 + 字幕 + mux
  → MP4 をレスポンス（Blob）
```

ローカル確認:

```bash
npx tsx scripts/business-pr-video-smoke.ts
```

この版の複数画像レンダリングはローカル ffmpeg です。Cloud Run / R2 連携は次の段階です。

## 旧・商品PR（任意）

以前の Case 1件 + 商品画像1枚フローは残していますが、通常は使いません。

- 台本: `generatePrVideoScript()`（商品 Case）
- 動画: `POST /admin/marketing-agent/pr-video`（caseId 必須）

## 再利用するもの

- 台本 JSON: `PrVideoScript`（`lib/marketing-agent/pr-script.ts`）。事業PRでは `imageIndex` / `cameraMotion` を追加
- 事業PR台本: `generateBusinessPrVideoScript()`（`lib/marketing-agent/business-pr-script.ts`）
- AI: 既存 `completeJson()`（台本のみ）
- 認証: `requireAdmin()`
- レンダラ: `renderPrVideoMp4()` が `images: string[]` をシーンごとに使用

## ローカル実行

サーバーに必要:

- `ffmpeg` / `ffprobe`
- `espeak-ng`（日本語 voice `ja` あり）

```bash
sudo apt-get install -y ffmpeg espeak-ng
npm run dev
```

管理画面で **事業PR動画を作成** → フォーム入力 → 画像を2枚以上追加 → 日本語の動画構成 → **動画を生成**。

プレビューはブラウザの `<video>`（object URL）。Download MP4 は同じ Blob。

## 画像

事業PR:

- ブラウザから JPEG / PNG / WebP を複数アップロード（2〜16枚。枚数は固定しない）
- 任意で `public/` 配下の相対パス、または許可済み product-images URL（テスト素材として。商品である必要はない）

拒否: localhost / プライベート IP / 任意の外部ホスト。

旧商品PRのリモート取得は従来どおり BrandBridge の `product-images` バケットのみ。

## 動画仕様（MVP）

- 1080x1920、24fps、H.264 + AAC、約 25–35 秒
- シーン duration は台本の `durationSeconds`。音声の方が長い場合は映像を伸ばす
- ナレーションは日本語。画面テキストも日本語
- CTA は BrandBridge へのアクセス・問い合わせ（購入ではない）
- シーンごとに別画像 + Ken Burns（zoom / pan）。画像は再利用可

## やらないこと

- 商品の売り・価格・購入 CTA を動画の前提にしない
- 商品選択を必須にしない
- 1枚の画像を全シーンで使い回さない
- `marketing_agent_runs` / 新規 migration / Case テーブル変更
- TikTok / Instagram / YouTube API
- 動画の `public/` 恒久保存
