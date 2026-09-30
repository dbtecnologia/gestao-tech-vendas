create table if not exists public.tempo_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null,
  name text not null,
  detail text not null default '',
  status text not null default 'ATIVO',
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tempo_records_user_module_idx on public.tempo_records(user_id, module, updated_at desc);
alter table public.tempo_records enable row level security;
drop policy if exists "users manage own tempo records" on public.tempo_records;
create policy "users manage own tempo records" on public.tempo_records
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
