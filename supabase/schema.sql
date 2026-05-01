create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_key text not null,
  active boolean not null default false,
  source text not null default 'stripe',
  stripe_customer_id text,
  stripe_checkout_session_id text,
  created_at timestamptz not null default now(),
  primary key (user_id, product_key)
);

create table if not exists public.level_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  level_id text not null,
  completed boolean not null default false,
  best_stars int not null default 0 check (best_stars >= 0 and best_stars <= 3),
  best_program_size int,
  updated_at timestamptz not null default now(),
  primary key (user_id, level_id)
);

create table if not exists public.saved_programs (
  user_id uuid not null references auth.users(id) on delete cascade,
  level_id text not null,
  main jsonb not null default '[]'::jsonb,
  p1 jsonb not null default '[]'::jsonb,
  p2 jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, level_id)
);

create table if not exists public.stripe_events (
  event_id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.entitlements enable row level security;
alter table public.level_progress enable row level security;
alter table public.saved_programs enable row level security;
alter table public.stripe_events enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id);

create policy "entitlements_select_own" on public.entitlements
  for select using (auth.uid() = user_id);

create policy "level_progress_select_own" on public.level_progress
  for select using (auth.uid() = user_id);

create policy "level_progress_write_own" on public.level_progress
  for insert with check (auth.uid() = user_id);

create policy "level_progress_update_own" on public.level_progress
  for update using (auth.uid() = user_id);

create policy "saved_programs_select_own" on public.saved_programs
  for select using (auth.uid() = user_id);

create policy "saved_programs_write_own" on public.saved_programs
  for insert with check (auth.uid() = user_id);

create policy "saved_programs_update_own" on public.saved_programs
  for update using (auth.uid() = user_id);
