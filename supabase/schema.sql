-- ============================================================================
-- Pola — Supabase PostgreSQL Schema (Idempotent, 6-Game Production Ready)
-- ============================================================================
-- Auth Strategy:
--   Username + Password ONLY (internally mapped to <username>@pola.local).
--   In Supabase Dashboard:
--     Authentication -> Providers -> Email -> Disable "Confirm email"
--     so players can sign up with just a username + password immediately.
--
-- Games supported (6):
--   'queens', 'zip', 'tango', 'mini-sudoku', 'patches', 'fold'
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  display_name text not null check (char_length(trim(display_name)) between 1 and 30),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe idempotent migration if upgrading from an earlier schema
alter table public.profiles
  add column if not exists display_name text;

update public.profiles
  set display_name = username
  where display_name is null;

alter table public.profiles
  alter column display_name set not null;

-- Case-insensitive unique username constraint
create unique index if not exists idx_profiles_username_lower
  on public.profiles (lower(username));

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles
  for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 2. AUTO-CREATE PROFILE TRIGGER ON AUTH SIGNUP
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_username text;
  clean_username text;
  clean_display_name text;
begin
  raw_username := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'player_' || substr(replace(new.id::text, '-', ''), 1, 8)
  );

  -- Normalize to lowercase alphanumeric/underscore, bounded to 3-20 chars
  clean_username := lower(regexp_replace(raw_username, '[^a-zA-Z0-9_]', '', 'g'));
  if char_length(clean_username) < 3 then
    clean_username := 'player_' || substr(replace(new.id::text, '-', ''), 1, 8);
  elsif char_length(clean_username) > 20 then
    clean_username := substr(clean_username, 1, 20);
  end if;

  clean_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    clean_username
  );

  insert into public.profiles (id, username, display_name)
  values (new.id, clean_username, left(clean_display_name, 30))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. DAILY COMPLETIONS (First valid daily solve is locked — no UPDATE/DELETE)
-- ----------------------------------------------------------------------------
create table if not exists public.daily_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id text not null check (
    game_id in ('queens', 'zip', 'tango', 'mini-sudoku', 'patches', 'fold')
  ),
  puzzle_date date not null,
  time_seconds integer not null check (time_seconds >= 0),
  hints_used integer not null default 0 check (hints_used >= 0),
  completed_at timestamptz not null default now(),
  constraint daily_completions_user_game_date_unique unique (user_id, game_id, puzzle_date)
);

-- Ensure game_id check constraint includes all 6 games if table already existed
alter table public.daily_completions
  drop constraint if exists daily_completions_game_id_check;
alter table public.daily_completions
  add constraint daily_completions_game_id_check
  check (game_id in ('queens', 'zip', 'tango', 'mini-sudoku', 'patches', 'fold'));

create index if not exists idx_daily_completions_leaderboard
  on public.daily_completions (puzzle_date, game_id, time_seconds asc, hints_used asc, completed_at asc);

create index if not exists idx_daily_completions_date_user
  on public.daily_completions (puzzle_date, user_id);

alter table public.daily_completions enable row level security;

drop policy if exists "Daily completions are viewable by everyone" on public.daily_completions;
create policy "Daily completions are viewable by everyone"
  on public.daily_completions
  for select
  using (true);

drop policy if exists "Users can insert their own daily completions" on public.daily_completions;
create policy "Users can insert their own daily completions"
  on public.daily_completions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Intentionally NO UPDATE or DELETE policies on public.daily_completions:
-- Once a player's first valid Daily solve is recorded, it is permanently locked
-- and cannot be overwritten by replays.
