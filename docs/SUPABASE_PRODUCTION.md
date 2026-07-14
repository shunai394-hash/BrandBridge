# 本番 Supabase 設定確認

ベータ／本番で第三者が使う前に、Supabase プロジェクト側で確認する項目です。

## 1. プロジェクト

- [ ] **本番用**プロジェクトを用意（開発用と分離推奨）
- [ ] リージョンを決定（例: Northeast Asia (Tokyo)）
- [ ] Project URL / `anon` key を控える（[ENV.md](./ENV.md)）

## 2. マイグレーション（必須）

SQL Editor で **番号順** に実行:

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_messages.sql`
3. `supabase/migrations/003_profile_trust.sql`
4. `supabase/migrations/004_case_enrichment.sql`
5. `supabase/migrations/005_admin_ops.sql`
6. `supabase/migrations/006_deal_management.sql`
7. `supabase/migrations/007_popular_cases.sql`
8. `supabase/migrations/008_contact_inquiries.sql`
9. `supabase/migrations/009_maker_registration.sql`
10. `supabase/migrations/010_partner_profile.sql`
11. （以降番号順）`011`〜`017` まで適用。`016`/`017` で表示用案件番号 `BB-000001` を採番・既存行へ再付番

実行後の確認例:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles', 'cases', 'negotiations', 'messages',
    'favorites', 'deals', 'commission_settings', 'contact_inquiries'
  )
order by table_name;
```

- [ ] 上記テーブルが存在する
- [ ] RLS が有効（Table Editor → 各表 → RLS enabled）

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

## 3. Auth（必須）

Authentication → Providers:

- [ ] **Email** が有効
- [ ] **Google** が有効（Client ID / Secret を設定）
- [ ] **Confirm email = ON**（メール認証必須。アプリ側でも未確認ログインを拒否）

Authentication → URL Configuration:

| 設定 | 例 |
|------|-----|
| Site URL | `https://あなたの本番ドメイン` |
| Redirect URLs | `https://あなたの本番ドメイン/**` |
| （ローカル併用時） | `http://localhost:3000/**` |

- [ ] Site URL が Vercel 本番 URL（またはカスタムドメイン）と一致
- [ ] Redirect URLs に `https://あなたのドメイン/auth/callback` を追加
- [ ] 登録フロー: メール+パスワード or Google → コールバック → 初回は `/maker/setup` または `/partner/setup`
- [ ] 会社・商品などの詳細は **認証後の setup のみ** で保存（認証前保存・旧5STEP登録は廃止）
- [ ] パスワードリセット: Redirect で `/auth/callback?next=/login/update-password` が通ること
- [ ] Google の Authorized redirect URI に Supabase の callback（`https://<project>.supabase.co/auth/v1/callback`）を設定
- [ ] （任意）Storage バケット `product-images` が作成されている（009 実行後）

## 4. API / キー

Project Settings → API:

- [ ] `anon` `public` キーのみを Vercel / `.env.local` に設定
- [ ] `service_role` はローカルメモ以外に置かない（アプリ未使用）
- [ ] キー漏洩時は Rotate を検討

## 5. データ（任意）

デモ用サンプル:

```text
supabase/seed/demo_data.sql
```

- [ ] ベータで空に見せたくない場合のみ実行
- [ ] デモユーザーのパスワードを本番運用の管理者パスワードに流用しない
- [ ] 本番運用開始後はデモデータ削除を検討

デモ削除の目安（メールドメイン）:

```sql
-- 実行前に内容を必ず確認すること
select id, email, role from public.profiles
where email like '%@demo.brandbridge.app';
```

## 6. 動作スモークテスト（Supabase 視点）

アプリ接続後:

- [ ] メーカー登録 → `profiles` に行が増える
- [ ] 案件提出 → `cases.review_status = pending_review`
- [ ] 管理者承認後 → 公開一覧に出る
- [ ] お問い合わせ → `contact_inquiries` に行が増える
- [ ] 未ログインで他人の交渉・メッセージが読めない（RLS）

## 7. 運用メモ

| 項目 | 推奨 |
|------|------|
| バックアップ | Pro プラン等の PITR / 定期ダンプを検討 |
| 問い合わせ確認 | `select * from contact_inquiries order by created_at desc limit 50;` |
| 管理者 | [ADMIN_SETUP.md](./ADMIN_SETUP.md) |
| 手数料率 | `/admin/negotiations` または `commission_settings` |

設定が終わったら [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) へ進んでください。
