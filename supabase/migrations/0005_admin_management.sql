-- HEALTH IS PRICELESS — gestion des admins depuis le back-office.
-- À exécuter UNE fois dans : Supabase Dashboard → SQL Editor.

-- Un admin authentifié peut lister / ajouter / retirer des emails admin.
drop policy if exists "admin_emails_select_admin" on public.admin_emails;
create policy "admin_emails_select_admin"
  on public.admin_emails for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin_emails_insert_admin" on public.admin_emails;
create policy "admin_emails_insert_admin"
  on public.admin_emails for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admin_emails_delete_admin" on public.admin_emails;
create policy "admin_emails_delete_admin"
  on public.admin_emails for delete
  to authenticated
  using (public.is_admin());
