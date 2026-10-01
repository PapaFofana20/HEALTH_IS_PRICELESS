-- ==========================================================
-- 0003_programs.sql — Catalogue de programmes piloté par l'admin
-- À exécuter APRÈS 0002_admin.sql (dépend de is_admin()).
--
-- Chaque ligne = les modifications d'un programme par l'admin.
-- payload jsonb ne contient QUE les champs édités (patch) : le
-- client fusionne patch par-dessus le catalogue intégré au
-- démarrage, donc tous les membres voient la version à jour.
-- visible = false : le programme reste résolvable par id (membres
-- déjà inscrits) mais disparaît des listes.
-- ==========================================================

create table if not exists public.programs (
  id text primary key,
  payload jsonb not null,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.programs enable row level security;

-- Lecture publique (le filtrage "visible" est fait côté client ;
-- l'admin doit pouvoir lire aussi les lignes masquées).
drop policy if exists "programs_read_all" on public.programs;
create policy "programs_read_all" on public.programs
  for select using (true);

-- Écriture réservée aux administrateurs (fonction is_admin de 0002).
drop policy if exists "programs_admin_write" on public.programs;
create policy "programs_admin_write" on public.programs
  for all using (public.is_admin()) with check (public.is_admin());
