-- ============================================================
-- SEED DATA (local development only)
--
-- This file runs ONLY on `supabase db reset` (local Docker stack).
-- It is NOT executed by `supabase db push`, so it never touches
-- your production data on project ref xttlmtwoenntqbrhkkox.
--
-- Keep it tiny and idempotent. Real catalogue data is loaded by
-- `npm run migrate:products` (see scripts/migrate-products.ts).
-- ============================================================

insert into public.categories (slug, name, short_name, sort_order, is_active)
values
  ('men',   'Men',   'Men',   1, true),
  ('women', 'Women', 'Women', 2, true),
  ('kids',  'Kids',  'Kids',  3, true)
on conflict (slug) do nothing;