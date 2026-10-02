-- HEALTH IS PRICELESS profiles (1 row per auth.users row).
-- Run once in: Supabase Dashboard → SQL Editor → New query → Paste → Run.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  avatar text not null default '',
  tier text not null default 'free' check (tier in ('free', 'standard', 'premium')),
  goal text not null default 'weight-loss' check (goal in ('weight-loss', 'muscle-gain')),
  current_program_id text,
  current_week integer not null default 1 check (current_week between 1 and 52),
  weight_goal numeric,
  member_since date not null default current_date,
  favorites text[] not null default '{}'
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create an empty profile on every signup (uses metadata sent at signUp).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, goal)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'firstName', ''),
    case when new.raw_user_meta_data ->> 'goal' = 'muscle-gain' then 'muscle-gain' else 'weight-loss' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
