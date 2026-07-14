-- Re-backfill missing case_number values (BB-000001…)
-- Safe to re-run if 016 was skipped or rows were inserted without the trigger.

create sequence if not exists public.case_number_seq;

alter table public.cases
  add column if not exists case_number text;

do $$
declare
  r record;
begin
  for r in
    select id
    from public.cases
    where case_number is null
       or btrim(case_number) = ''
       or case_number = '—'
    order by created_at asc, id asc
  loop
    update public.cases
    set case_number =
      'BB-' || lpad(nextval('public.case_number_seq')::text, 6, '0')
    where id = r.id;
  end loop;
end $$;

alter table public.cases
  alter column case_number set not null;

create unique index if not exists cases_case_number_uidx
  on public.cases (case_number);

create or replace function public.assign_case_number()
returns trigger
language plpgsql
as $$
begin
  if new.case_number is null
     or btrim(new.case_number) = ''
     or new.case_number = '—' then
    new.case_number :=
      'BB-' || lpad(nextval('public.case_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists cases_assign_case_number on public.cases;

create trigger cases_assign_case_number
  before insert on public.cases
  for each row
  execute function public.assign_case_number();
