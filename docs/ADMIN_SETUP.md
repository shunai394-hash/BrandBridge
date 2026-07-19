# 管理者初期設定手順

運営が商品提供企業の商品を審査できる管理者（`admin`）を用意します。

## いちばん早い方法（推奨）

### 1. `.env.local` に追加

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Settings → API → service_role（秘密）
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123
```

`SUPABASE_SERVICE_ROLE_KEY` は **NEXT_PUBLIC にしない**・Git にコミットしない。

### 2. 管理者作成

```bash
npm run admin:create
```

スクリプトが行うこと:

1. Supabase Auth に管理者ユーザーを作成（既存ならパスワード更新）
2. `public.profiles` を `id = auth.users.id` で upsert
3. `role='admin'`, `is_active=true`, `onboarding_completed=true` を設定
4. 検証ログを出力

### 3. ログイン確認

1. `/login?next=/admin`
2. `ADMIN_EMAIL` / `ADMIN_PASSWORD`
3. 成功 → `/admin`
4. `/admin/cases` で審査待ち（`pending_review`）を確認

| 操作 | 結果 |
|------|------|
| 承認 | `review_status=approved`, `status=open` |
| 却下 | `review_status=rejected`, `status=closed` |

### 4. ログインできない場合（画面の赤文字）

| 表示 | 意味 |
|------|------|
| `Auth error: ...` | メール/パスワード/session 失敗 |
| `profiles error: ...` | Auth はあるが profiles 行がない/取得失敗 |
| `role error: ...` | ログイン成功だが `role != admin` |

---

## SQL だけで既存ユーザーを昇格する場合

Auth にユーザーが既にあるとき（例: `sebunn8@gmail.com`）:

```sql
insert into public.profiles (
  id, role, company_name, contact_name, email, is_active, onboarding_completed
)
select
  u.id, 'admin', 'BrandBridge Admin', 'Admin', u.email, true, true
from auth.users u
where u.email = 'sebunn8@gmail.com'
on conflict (id) do update
set role = 'admin',
    is_active = true,
    onboarding_completed = true;
```

詳細 SQL: `supabase/diagnostics/promote_admin.sql`  
Migration: `014_admin_role_in_handle_new_user.sql`（トリガーで admin metadata を許可）

---

## セキュリティ

- [ ] admin 用メールとパスワードを個人アカウントと分離
- [ ] `service_role` をフロント/`NEXT_PUBLIC_*` に入れない
- [ ] 担当変更時は速やかに降格またはパスワード変更

```sql
update public.profiles set role = 'maker' where email = 'ex-admin@example.com';
```
