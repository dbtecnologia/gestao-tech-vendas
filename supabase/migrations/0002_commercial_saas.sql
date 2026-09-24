-- Commercial SaaS foundation. Apply after 0001_initial_schema.sql.
create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(), name text not null, document text,
  segment text, phone text, city text, state text, onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.company_users (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'VENDEDOR' check (role in ('ADMINISTRADOR','GESTOR','VENDEDOR','FINANCEIRO')),
  primary key (company_id, user_id)
);
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  legal_name text not null, trade_name text, document text, phone text, whatsapp text, email text, address text,
  city text, state text, postal_code text, category text, segment text, status text not null default 'ATIVO',
  owner_id uuid references auth.users(id), notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  company_name text not null, contact_name text, phone text, email text, city text, origin text,
  status text not null default 'NOVO' check (status in ('NOVO','CONTATO','QUALIFICACAO','PROPOSTA','NEGOCIACAO','GANHO','PERDIDO')),
  potential numeric(14,2) default 0, owner_id uuid references auth.users(id), notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null, seller_id uuid references auth.users(id),
  starts_at timestamptz not null, objective text, status text not null default 'PLANEJADA',
  notes text, result text, next_action text, follow_up_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null, opportunity_id uuid, owner_id uuid references auth.users(id),
  due_at timestamptz not null, type text not null default 'OUTRO', priority text not null default 'NORMAL',
  description text not null, status text not null default 'PENDENTE', result text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null, owner_id uuid references auth.users(id), title text not null,
  amount numeric(14,2) not null default 0, probability integer not null default 0 check (probability between 0 and 100),
  stage text not null default 'ABERTA', expected_close date, origin text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists customers_company_idx on public.customers(company_id);
create index if not exists visits_company_date_idx on public.visits(company_id, starts_at);
create index if not exists followups_company_due_idx on public.follow_ups(company_id, due_at);
create index if not exists opportunities_company_stage_idx on public.opportunities(company_id, stage);

alter table public.companies enable row level security;
alter table public.company_users enable row level security;
alter table public.customers enable row level security;
alter table public.prospects enable row level security;
alter table public.visits enable row level security;
alter table public.follow_ups enable row level security;
alter table public.opportunities enable row level security;

create or replace function public.is_company_member(target_company uuid)
returns boolean language sql stable security invoker set search_path = public as $$
  select exists (select 1 from public.company_users cu where cu.company_id = target_company and cu.user_id = (select auth.uid()));
$$;

create policy "company members read company" on public.companies for select to authenticated using (public.is_company_member(id));
create policy "users see company membership" on public.company_users for select to authenticated using (user_id = (select auth.uid()) or public.is_company_member(company_id));
create policy "company members manage customers" on public.customers for all to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "company members manage prospects" on public.prospects for all to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "company members manage visits" on public.visits for all to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "company members manage followups" on public.follow_ups for all to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "company members manage opportunities" on public.opportunities for all to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
