-- ============================================================
-- MAISH FASHION BOUTIQUE — OWNER-ONLY ACTIVITY LOG
-- Project ref: xttlmtwoenntqbrhkkox
--
-- WHAT THIS DOES
--   1. Makes maishboutique@gmail.com an admin.
--   2. Restricts the Activity Log so ONLY roysanga127@gmail.com can read it.
--
-- HOW TO USE
--   1. First sign up maishboutique@gmail.com once at
--      https://<your-site>/admin/login  (step 1 below needs the account
--      to exist; it is skipped with a notice if it does not).
--   2. Paste this whole file into Supabase Dashboard > SQL Editor and Run.
--
-- Running it twice is safe: every statement is idempotent.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Grant admin to the shop account
-- ------------------------------------------------------------
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id
  from auth.users
  where lower(email) = 'maishboutique@gmail.com';

  if v_user_id is null then
    raise notice
      'SKIPPED: maishboutique@gmail.com is not in auth.users yet. Sign the account up at /admin/login, then run this script again.';
    return;
  end if;

  insert into public.profiles (id, email, role)
  values (v_user_id, 'maishboutique@gmail.com', 'admin')
  on conflict (id) do update
    set role = 'admin',
        email = 'maishboutique@gmail.com',
        updated_at = now();

  raise notice 'DONE: maishboutique@gmail.com is now an admin.';
end;
$$;


-- ------------------------------------------------------------
-- 2. Owner-only reader for the activity log
--
-- The allow-list is a table rather than a value baked into the
-- function, so the owner can be changed later with a single
-- UPDATE and no code change.
-- ------------------------------------------------------------
create table if not exists public.admin_activity_log_viewers (
  email text primary key
);

insert into public.admin_activity_log_viewers (email)
values ('roysanga127@gmail.com')
on conflict (email) do nothing;

create or replace function public.can_view_admin_activity_log(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and lower(p.email) = any (
        select lower(v.email) from public.admin_activity_log_viewers v
      )
  );
$$;

revoke all on function public.can_view_admin_activity_log(uuid) from public;
grant execute on function public.can_view_admin_activity_log(uuid) to authenticated;

-- Writing: unchanged — any staff member can still record activity.
drop policy if exists "admin_activity_log_staff_insert" on public.admin_activity_log;
create policy "admin_activity_log_staff_insert" on public.admin_activity_log
  for insert to authenticated
  with check (public.is_staff());

-- Reading: the main admin only (was: any admin).
drop policy if exists "admin_activity_log_admin_select" on public.admin_activity_log;
drop policy if exists "admin_activity_log_owner_select" on public.admin_activity_log;
create policy "admin_activity_log_owner_select" on public.admin_activity_log
  for select to authenticated
  using (public.can_view_admin_activity_log());


-- ------------------------------------------------------------
-- 3. Confirm it worked — expect two admins, one log viewer
-- ------------------------------------------------------------
select u.email, p.role, (u.email_confirmed_at is not null) as email_confirmed
from auth.users u
left join public.profiles p on p.id = u.id
where lower(u.email) in ('roysanga127@gmail.com', 'maishboutique@gmail.com');

select email as activity_log_viewers from public.admin_activity_log_viewers order by email;