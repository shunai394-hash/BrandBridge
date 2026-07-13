# 管理者初期設定手順

ベータ公開直後に、運営用の管理者（`admin`）を用意する手順です。

## 概要

- 管理者は通常のユーザー登録後、DB で `profiles.role = 'admin'` に昇格します
- UI からの自己昇格はできません（SQL で実施）
- 管理者のみ `/admin` 配下と成約登録・手数料率変更・問い合わせ閲覧（DB）が可能です

## 手順

### 1. アカウントを作成

本番サイトで次のいずれかを実施します。

- `/register/maker` または `/register/partner` で新規登録
- もしくは既存アカウントを利用

推奨: **運営専用メール**（個人用と分離）

### 2. role を admin に更新

Supabase → SQL Editor:

```sql
update public.profiles
set role = 'admin',
    is_active = true
where email = 'your-admin@example.com';
```

確認:

```sql
select id, email, role, company_name, is_active
from public.profiles
where email = 'your-admin@example.com';
```

`role` が `admin`、`is_active` が `true` であることを確認します。

### 3. ログインして管理画面を開く

1. 本番 URL の `/login` でログイン
2. `/admin` を開く
3. ダッシュボード（審査待ち・交渉・成約集計）が表示されることを確認

ヘッダーに「管理画面」リンクが出ます。

### 4. 初回の運営設定（推奨）

| 作業 | 場所 |
|------|------|
| 審査待ち案件の承認 | `/admin/cases` |
| 手数料率（初期 5%）の確認・変更 | `/admin/negotiations` |
| ユーザーの有効/停止 | `/admin/users` |
| 成約化 | `/admin/negotiations` → 成約化 → `/deals` |

問い合わせは管理 UI 未実装のため、SQL で確認します:

```sql
select id, name, email, category, message, created_at
from public.contact_inquiries
order by created_at desc
limit 50;
```

### 5. 複数管理者（任意）

追加の運営メンバーも同様に登録 → `role = 'admin'` で昇格できます。

```sql
update public.profiles
set role = 'admin'
where email in (
  'ops1@example.com',
  'ops2@example.com'
);
```

### 6. 管理者の降格・停止

降格（メーカーに戻す例）:

```sql
update public.profiles
set role = 'maker'
where email = 'your-admin@example.com';
```

停止（ログイン後の利用を制限）:

```sql
update public.profiles
set is_active = false
where email = 'user@example.com';
```

## セキュリティ注意

- [ ] admin 用メールとパスワードを共有アカウントにしない（可能なら個別）
- [ ] デモシードユーザーを admin にしたまま放置しない
- [ ] 退職・担当変更時は速やかに降格または停止
- [ ] `service_role` キーは管理者個人の端末外に広げない
- [ ] 本番で Confirm email を有効にする場合、管理者メールも受信できること

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| `/admin` が開けない・リダイレクト | `role` が `admin` か、`is_active` が true か再確認。再ログイン |
| メニューに管理画面が出ない | セッション再取得のため一度ログアウト→ログイン |
| 成約化できない | admin であること、交渉が `application_status = accepted` であること |
| 案件が公開されない | `/admin/cases` で `approved` にする |

---

次のステップ: ベータ向けにデモ案件が必要なら `supabase/seed/demo_data.sql`（[SUPABASE_PRODUCTION.md](./SUPABASE_PRODUCTION.md)）。
