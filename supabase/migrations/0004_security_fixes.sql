-- HEALTH IS PRICELESS — correctifs de sécurité (RLS + commandes).
-- À exécuter UNE fois dans : Supabase Dashboard → SQL Editor.

-- 1) Un utilisateur ne peut plus s'insérer une commande 'paid' lui-même :
--    les orders ne s'écrivent que via la clé service-role (webhook backend).
drop policy if exists "orders_insert_own" on public.orders;

-- 2) Un client ne peut plus modifier son propre tier : seul un admin
--    ou le service-role (backend, après vérification du paiement) le peut.
create or replace function public.lock_profile_tier()
returns trigger
language plpgsql
as $$
begin
  if new.tier is distinct from old.tier
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role'
     and not public.is_admin()
  then
    raise exception 'tier_locked: upgrade via payment only';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_lock_tier on public.profiles;
create trigger profiles_lock_tier
  before update on public.profiles
  for each row execute function public.lock_profile_tier();
