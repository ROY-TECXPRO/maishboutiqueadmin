# Supabase — Maish Boutique (project ref `xttlmtwoenntqbrhkkox`)

## Where the schema lives

`supabase/migrations/20261002000000_init_maish_schema.sql` is the **single source
of truth**. A byte-identical copy sits at the repo root as
`supabase-consolidated-setup.sql` for one-paste use in the Supabase SQL Editor.

The older `supabase-*.sql` files at the repo root are **superseded — do not run
them.** Several contain RLS policies that expose every customer's orders to any
logged-in user.

## Apply the schema — Option A: SQL Editor (no setup)

1. Open <https://supabase.com/dashboard/project/xttlmtwoenntqbrhkkox/sql/new>
2. Paste the whole of `supabase-consolidated-setup.sql`, click **Run**.

Safe to re-run: objects use `if not exists` / `or replace`, and every policy is
dropped before it is recreated.

## Apply the schema — Option B: CLI (`npm run db:push`)

One-time link (needs your database password, Project Settings → Database):

```sh
npx supabase login
npx supabase link --project-ref xttlmtwoenntqbrhkkox
npm run db:push
```

## Verify

```sh
npm run db:types   # regenerate src/types/database.ts from the live database
```

Or paste this into the SQL Editor:

```sql
select tablename, policyname, cmd
from pg_policies
where schemaname in ('public','storage')
order by tablename, policyname;
```

## Security notes

- The `anon` key in `.env` is **public by design** — it is inlined into the
  browser bundle. It is only safe because RLS restricts what it can do.
- The `service_role` key must never go in `.env` or into git. Use
  `.env.migration` (gitignored) for migrations only.
- All admin/staff checks go through `public.is_staff()` / `public.is_admin()`,
  which are `SECURITY DEFINER`, so they never recurse back into `profiles` RLS.

## Local development (optional, needs Docker)

```sh
npx supabase start   # boots the local stack on :54321
npx supabase db reset  # replays migrations + supabase/seed.sql
npx supabase stop
```
