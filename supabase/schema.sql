create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  bookmarked_topics jsonb not null default '[]'::jsonb,
  correct_answers integer not null default 0,
  attempted_questions integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists custom_study (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  notes jsonb not null default '[]'::jsonb,
  question_prompt text not null default '',
  options jsonb not null default '[]'::jsonb,
  correct_index integer not null default 0,
  hint text not null default '',
  explanation text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, title)
);

create index if not exists user_progress_user_id_idx on user_progress (user_id);
create index if not exists custom_study_user_id_idx on custom_study (user_id);

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.custom_study enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    now()
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "user_progress_select_own" on public.user_progress;
drop policy if exists "user_progress_insert_own" on public.user_progress;
drop policy if exists "user_progress_update_own" on public.user_progress;
drop policy if exists "custom_study_select_public" on public.custom_study;
drop policy if exists "custom_study_insert_own" on public.custom_study;
drop policy if exists "custom_study_update_own" on public.custom_study;
drop policy if exists "custom_study_delete_own" on public.custom_study;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "user_progress_select_own" on public.user_progress
for select using (auth.uid() = user_id);

create policy "user_progress_insert_own" on public.user_progress
for insert with check (auth.uid() = user_id);

create policy "user_progress_update_own" on public.user_progress
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "custom_study_select_public" on public.custom_study
for select using (true);

create policy "custom_study_insert_own" on public.custom_study
for insert with check (auth.uid() = user_id);

create policy "custom_study_update_own" on public.custom_study
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "custom_study_delete_own" on public.custom_study
for delete using (auth.uid() = user_id);
