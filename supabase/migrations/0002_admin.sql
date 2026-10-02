-- HEALTH IS PRICELESS back-office (admin) + commandes.
-- À exécuter une fois dans : Supabase Dashboard → SQL Editor → New query → Coller → Run.
-- (À faire APRÈS 0001_profiles.sql)

-- ==========================================================
-- 1) Liste blanche des emails administrateurs.
--    Gérable directement depuis le SQL Editor (insert/delete).
-- ==========================================================
create table if not exists public.admin_emails (
  email text primary key
);

-- RLS active, aucune policy : personne n'y accède depuis le client.
alter table public.admin_emails enable row level security;

insert into public.admin_emails (email) values
  ('admin@hip.app'),
  ('papafofana200@gmail.com')
on conflict (email) do nothing;

-- ==========================================================
-- 2) is_admin() : appelée par les policies RLS.
--    SECURITY DEFINER → lit admin_emails sans passer par les policies.
-- ==========================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ==========================================================
-- 3) Un admin peut lire tous les profils (membres du back-office).
-- ==========================================================
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- ==========================================================
-- 4) Commandes (paiements : Softpay / PayDunya plus tard).
--    Le backend / le webhook de paiement insérera les lignes ;
--    le client lit uniquement les siennes + l'admin lit tout.
-- ==========================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reference text not null unique,
  plan text not null check (plan in ('standard', 'premium')),
  amount integer not null check (amount > 0),
  method text not null default 'card' check (method in ('wave', 'orange', 'mtn', 'card')),
  status text not null default 'pending' check (status in ('paid', 'pending', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "orders_select_admin" on public.orders;
create policy "orders_select_admin"
  on public.orders for select
  to authenticated
  using (public.is_admin());
