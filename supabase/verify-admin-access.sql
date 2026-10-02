-- ============================================================
-- DIAGNOSE: "Supabase says I'm the admin but the site treats me
-- as a normal user."
--
-- Run in the SQL Editor for project ref xttlmtwoenntqbrhkkox.
-- Sections 1-3 are READ-ONLY. Section 4 contains the repair.
--
-- Background: the app resolves your role from
-- public.profiles.role, matched by the row whose
-- profiles.id = auth.users.id. If there is no such row — or the
-- role on it is not 'admin'/'staff' — the app falls back to
-- 'customer' and /admin/products redirects you to /admin/login.
-- ============================================================

-- ------------------------------------------------------------
-- 1. The authoritative view: auth user joined to its profile row
-- ------------------------------------------------------------
select
  u.id                              as auth_user_id,
  u.email,
  (u.email_confirmed_at is not null) as email_confirmed,
  p.id                              as profile_row_id,
  p.role                            as profile_role,
  (p.id is null)                    as PROFILE_ROW_IS_MISSING
from auth.users u
left join public.profiles p on p.id = u.id
where u.email = 'roysanga127@gmail.com';

-- ------------------------------------------------------------
-- 2. Classic mistake: a profiles row with the right email but a
--    DIFFERENT id. The app looks the row up by id, so it would
--    never find this one and you'd be treated as a customer.
-- ------------------------------------------------------------
select p.id, p.email, p.role
from public.profiles p
where p.email = 'roysanga127@gmail.com';

-- ------------------------------------------------------------
-- 3. Which policies currently protect public.profiles?
--    (If a blanket "allow all" policy shows up here, that is a
--     separate security problem worth fixing.)
-- ------------------------------------------------------------
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'profiles'
order by policyname;

-- ------------------------------------------------------------
-- 4. REPAIR — only if section 1 showed PROFILE_ROW_IS_MISSING = true,
--    or section 2 showed a row with a mismatched id.
--    Uncomment exactly ONE of these.
-- ------------------------------------------------------------

-- 4a. The profile row is missing entirely -> create it with admin role.
-- insert into public.profiles (id, email, full_name, role)
-- select u.id, u.email, coalesce(u.raw_user_meta_data ->> 'full_name', 'Roy Sanga'), 'admin'
-- from auth.users u
-- where u.email = 'roysanga127@gmail.com'
-- on conflict (id) do update set role = 'admin';

-- 4b. The profile row exists but the role is wrong -> promote it.
-- update public.profiles
-- set role = 'admin', updated_at = now()
-- where id = (select id from auth.users where email = 'roysanga127@gmail.com');

-- ------------------------------------------------------------
-- 5. Verify afterwards (must return exactly one row, role = admin)
-- ------------------------------------------------------------
select p.id, p.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'roysanga127@gmail.com';