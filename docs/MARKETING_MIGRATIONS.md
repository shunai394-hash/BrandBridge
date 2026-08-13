# Marketing Engine — Migration 適用ガイド

既存 001–051 と、以前のローカル実装（`052_marketing_agent.sql` / `053_marketing_competitors.sql`）を壊さないための確認手順です。  
**テーブル DROP・データ削除は行いません。**

## 1. このリポジトリの `supabase/migrations`

| ファイル | GitHub `main` | このブランチ | 内容 |
|----------|---------------|--------------|------|
| `001`〜`051` | あり | あり | 既存（編集しない） |
| `052_marketing_agent.sql` | **なし** | **なし** | 以前のローカル Phase 1 想定。リポジトリ未収録 |
| `053_marketing_competitors.sql` | **なし** | **なし** | 以前のローカル競合分析想定。リポジトリ未収録 |
| `052_marketing_engine.sql` | なし | あり | 今回追加した Phase 1+2 一括（**編集しない**） |
| `054_marketing_tiktok_distribution.sql` | なし | あり | 加算のみ。TikTok + 不足テーブル IF NOT EXISTS |

`main` の最大番号は **051** です。  
`052_marketing_engine.sql` は旧 052/053 と**機能が重なる**ため、本番ですでに旧 052/053 を実行済みなら **実行しない**でください。

## 2. 重複の整理

| 状況 | 実行する SQL | 実行しない SQL |
|------|--------------|----------------|
| 本番が 051 まで（marketing テーブルなし） | `052_marketing_engine.sql` → `054_marketing_tiktok_distribution.sql` | — |
| 旧 `052_marketing_agent.sql` + `053_marketing_competitors.sql` 済み | **`054_marketing_tiktok_distribution.sql` のみ** | `052_marketing_engine.sql`（CHECK 制約が衝突する可能性） |
| すでに `052_marketing_engine.sql` 済み | `054_marketing_tiktok_distribution.sql` | 052 の再実行は不要 |

054 は `CREATE TABLE IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` / 制約の付け替えのみです。既存行は削除しません。

## 3. 本番で適用済みかを確認する SQL

Supabase → SQL Editor で実行:

```sql
-- marketing テーブルの有無
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name like 'marketing_%'
order by table_name;

-- 旧 Phase 1 だけあるか（ideas/drafts があり opportunities が無い）
select
  to_regclass('public.marketing_agent_runs') as runs,
  to_regclass('public.marketing_content_ideas') as old_ideas,
  to_regclass('public.marketing_content_drafts') as old_drafts,
  to_regclass('public.marketing_competitors') as competitors,
  to_regclass('public.marketing_content_opportunities') as opportunities,
  to_regclass('public.marketing_social_accounts') as accounts,
  to_regclass('public.marketing_social_posts') as posts;

-- TikTok カラムが付いたか
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'marketing_social_posts'
  and column_name in ('hook', 'narration', 'caption', 'hashtags');
```

CLI で migration 履歴を使っている場合（任意）:

```sql
select * from supabase_migrations.schema_migrations
order by version;
```

Dashboard の Table Editor で `marketing_*` の有無を見ても同じです。

## 4. 実行順（壊さない）

1. 上記確認 SQL を実行する  
2. 該当する行の「実行する SQL」だけを番号順に実行する  
3. 既存 001–051 / 旧 052 / 旧 053 / `052_marketing_engine.sql` は**編集・削除しない**

## 5. Supabase で実行する SQL（このブランチ）

- 新規（051 まで）:  
  `supabase/migrations/052_marketing_engine.sql`  
  続けて `supabase/migrations/054_marketing_tiktok_distribution.sql`
- 旧 052/053 済み:  
  `supabase/migrations/054_marketing_tiktok_distribution.sql` のみ
