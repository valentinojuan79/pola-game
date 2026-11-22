-- Pola: Supabase PostgreSQL Schema
-- Auth Strategy: Username + Password (internally mapped to <username>@pola.local)
-- Run this in the Supabase SQL Editor. Make sure "Confirm email" is disabled in Auth > Providers > Email.

create extension if not exists "pgcrypto";

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_daily_date date,
  total_solved integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_username_lower on public.profiles (lower(username));

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2. DAILY PUZZLES
create table if not exists public.daily_puzzles (
  id uuid primary key default gen_random_uuid(),
  puzzle_date date not null,
  game_type text not null check (game_type in ('queens', 'zip', 'tango', 'mini-sudoku', 'patches')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard', 'expert')),
  grid_size integer not null,
  seed text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (puzzle_date, game_type)
);

create index if not exists idx_daily_puzzles_date_game on public.daily_puzzles (puzzle_date, game_type);

alter table public.daily_puzzles enable row level security;

create policy "Daily puzzles are readable by everyone"
  on public.daily_puzzles for select
  using (true);

-- 3. GAME SESSIONS (Daily & Unlimited records for signed-in users)
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_type text not null check (game_type in ('queens', 'zip', 'tango', 'mini-sudoku', 'patches')),
  mode text not null check (mode in ('daily', 'unlimited')),
  puzzle_date date,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard', 'expert')),
  elapsed_seconds integer not null check (elapsed_seconds >= 0),
  penalty_seconds integer not null default 0 check (penalty_seconds >= 0),
  hints_used integer not null default 0 check (hints_used >= 0),
  completed_at timestamptz not null default now()
);

create index if not exists idx_game_sessions_user on public.game_sessions (user_id, completed_at desc);
create index if not exists idx_game_sessions_daily on public.game_sessions (puzzle_date, game_type) where mode = 'daily';

alter table public.game_sessions enable row level security;

create policy "Users can view their own sessions"
  on public.game_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on public.game_sessions for insert
  with check (auth.uid() = user_id);

-- 4. LEADERBOARDS (1 best/first daily entry per user per game per day)
create table if not exists public.leaderboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  username text not null,
  puzzle_date date not null,
  game_type text not null check (game_type in ('queens', 'zip', 'tango', 'mini-sudoku', 'patches')),
  total_seconds integer not null check (total_seconds >= 0),
  hints_used integer not null default 0 check (hints_used >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, puzzle_date, game_type)
);

create index if not exists idx_leaderboards_ranking
  on public.leaderboards (puzzle_date, game_type, total_seconds asc, hints_used asc, created_at asc);

alter table public.leaderboards enable row level security;

create policy "Leaderboards are viewable by everyone"
  on public.leaderboards for select
  using (true);

create policy "Users can insert their own daily leaderboard entry"
  on public.leaderboards for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own daily leaderboard entry"
  on public.leaderboards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
