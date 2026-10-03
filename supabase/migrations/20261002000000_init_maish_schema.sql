-- ============================================================
-- MAISH FASHION BOUTIQUE — CONSOLIDATED BASELINE SCHEMA
-- Project ref: xttlmtwoenntqbrhkkox
--
-- Single source of truth for the database. Consolidates and
-- corrects these legacy files:
--   supabase-users-schema.sql          supabase-full-schema.sql
--   supabase-orders-schema.sql         supabase-orders-schema-updated.sql
--   supabase-newsletter-table.sql      supabase-product-system.sql
--
-- Two REAL security bugs in the legacy files are fixed here:
--   1. ORDERS RLS let ANY authenticated user read ALL customers'
--      orders:  using (user_id = auth.uid() or auth.role()='authenticated')
--      Fixed -> strict ownership + non-recursive staff override.
--   2. PROFILES RLS queried `profiles` from inside a policy ON
--      `profiles` -> Postgres "infinite recursion detected in
--      policy". Fixed -> SECURITY DEFINER helpers (is_staff /
--      is_admin) that bypass RLS internally.
--
-- IDEMPOTENT: unlike the old master file, every policy is
-- dropped-if-exists before being recreated, and legacy policy
-- names are swept (they would otherwise survive and, because
-- Postgres RLS policies are OR-ed together, silently re-open
-- the holes above).
-- ============================================================

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ============================================================
-- 1. PROFILES (+ role helpers, signup trigger, RLS)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  full_name   text,
  phone       text,
  avatar_url  text,
  county      text,
  town        text,
  address     text,
  role        text not null default 'customer' check (role in ('admin','staff','customer')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Defensive: the oldest version of `profiles` had no `role` column.
alter table public.profiles
  add column if not exists role text not null default 'customer';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('admin','staff','customer'));
  end if;
end $$;

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);

-- ---- Role helpers (SECURITY DEFINER avoids RLS recursion) ----
create or replace function public.is_staff(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role in ('admin','staff')
  );
$$;

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

-- ---- Auto-create a profile row on signup ----
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- Shared updated_at trigger ----
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---- RLS: profiles ----
alter table public.profiles enable row level security;

-- Sweep legacy profile policy names first.
drop policy if exists "Users can view their own profile"   on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Staff admin view all profiles"      on public.profiles;
drop policy if exists "Admin update all profiles"          on public.profiles;

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Staff admin view all profiles" on public.profiles;
create policy "Staff admin view all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_staff());

drop policy if exists "Admin update all profiles" on public.profiles;
create policy "Admin update all profiles"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 2. ADDRESSES
-- ============================================================
create table if not exists public.addresses (
  id           bigint generated by default as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  county       text not null,
  town         text not null,
  address      text not null,
  instructions text,
  is_default   boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists idx_addresses_user_id on public.addresses(user_id);

drop trigger if exists trg_addresses_updated_at on public.addresses;
create trigger trg_addresses_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

alter table public.addresses enable row level security;

drop policy if exists "Users can view their own addresses"   on public.addresses;
drop policy if exists "Users can insert their own addresses" on public.addresses;
drop policy if exists "Users can update their own addresses" on public.addresses;
drop policy if exists "Users can delete their own addresses" on public.addresses;

drop policy if exists "Users manage own addresses" on public.addresses;
create policy "Users manage own addresses"
  on public.addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 3. ORDERS + ORDER ITEMS
-- ============================================================
create table if not exists public.orders (
  id                     bigint generated by default as identity primary key,
  user_id                uuid references auth.users(id) on delete set null,
  order_number           text unique not null,
  customer_first_name    text not null,
  customer_last_name     text not null,
  customer_phone         text not null,
  customer_email         text,
  shipping_county        text not null,
  shipping_town          text not null,
  shipping_address       text not null,
  shipping_instructions  text,
  payment_method         text not null,
  payment_status         text default 'pending',
  delivery_zone          text not null,
  delivery_price         integer default 0,
  delivery_status        text default 'pending',
  subtotal               integer not null,
  discount               integer default 0,
  total                  integer not null,
  status                 text default 'pending',
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create table if not exists public.order_items (
  id             bigint generated by default as identity primary key,
  order_id       bigint references public.orders(id) on delete cascade,
  product_id     text not null,
  product_name   text not null,
  price          integer not null,
  quantity       integer not null,
  selected_size  text not null,
  selected_color text not null,
  color_hex      text,
  image          text
);

create index if not exists idx_orders_user_id  on public.orders(user_id);
create index if not exists idx_orders_phone    on public.orders(customer_phone);
create index if not exists idx_orders_status   on public.orders(status);
create index if not exists idx_orders_created  on public.orders(created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Sweep the legacy policies. These MUST go: Postgres OR-s permissive
-- policies together, so leaving e.g. "User View Own"
-- (auth.role() = 'authenticated') in place would keep exposing every
-- customer's order to every logged-in user.
drop policy if exists "Public Insert"        on public.orders;
drop policy if exists "User View Own"        on public.orders;
drop policy if exists "User Update Own"      on public.orders;
drop policy if exists "Users can view their own orders"   on public.orders;
drop policy if exists "Users can insert their own orders" on public.orders;
drop policy if exists "Users can update their own orders" on public.orders;
drop policy if exists "Public insert orders"    on public.orders;
drop policy if exists "Users view own orders"   on public.orders;
drop policy if exists "Users update own orders" on public.orders;
drop policy if exists "Public Insert Items"       on public.order_items;
drop policy if exists "User View Own Items"       on public.order_items;
drop policy if exists "Public insert order items" on public.order_items;
drop policy if exists "Users view own order items" on public.order_items;

-- Guest checkout is intentional (matches the original design).
drop policy if exists "Public insert orders" on public.orders;
create policy "Public insert orders"
  on public.orders for insert
  with check (true);

-- FIX #1: strict ownership, never "or authenticated".
drop policy if exists "Users view own orders" on public.orders;
create policy "Users view own orders"
  on public.orders for select
  using (user_id = auth.uid() or public.is_staff());

drop policy if exists "Users update own orders" on public.orders;
create policy "Users update own orders"
  on public.orders for update
  using (user_id = auth.uid() or public.is_staff())
  with check (user_id = auth.uid() or public.is_staff());

drop policy if exists "Public insert order items" on public.order_items;
create policy "Public insert order items"
  on public.order_items for insert
  with check (true);

drop policy if exists "Users view own order items" on public.order_items;
create policy "Users view own order items"
  on public.order_items for select
  using (
    public.is_staff()
    or order_id in (select id from public.orders where user_id = auth.uid())
  );

-- ============================================================
-- 4. NEWSLETTER SUBSCRIBERS
-- ============================================================
create table if not exists public.newsletter_subscribers (
  id              bigint generated by default as identity primary key,
  email           text unique not null,
  subscribed_at   timestamptz default now(),
  confirmed_at    timestamptz,
  confirmed       boolean default false,
  unsubscribed_at timestamptz,
  status          text default 'pending' check (status in ('pending','subscribed','unsubscribed'))
);

create index if not exists idx_newsletter_email  on public.newsletter_subscribers(email);
create index if not exists idx_newsletter_status on public.newsletter_subscribers(status);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Allow public insert for newsletter"  on public.newsletter_subscribers;
drop policy if exists "Allow authenticated read for newsletter" on public.newsletter_subscribers;
drop policy if exists "Public subscribe"      on public.newsletter_subscribers;
drop policy if exists "Staff read subscribers" on public.newsletter_subscribers;

drop policy if exists "Public subscribe" on public.newsletter_subscribers;
create policy "Public subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

drop policy if exists "Staff read subscribers" on public.newsletter_subscribers;
create policy "Staff read subscribers"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_staff());

-- ============================================================
-- 5. CATEGORIES / PRODUCTS / INVENTORY LOG
-- ============================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  short_name  text,
  description text,
  image       text,
  color       text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  legacy_id      text,
  sku            text not null unique,
  slug           text not null unique,
  name           text not null,
  price          integer not null default 0 check (price >= 0),
  original_price integer check (original_price >= 0),
  description    text,
  category_id    uuid references public.categories(id) on delete set null,
  gender         text,
  tags           text[] default '{}',
  use_case       text[] default '{}',
  rating         numeric(2,1) not null default 0.0 check (rating >= 0 and rating <= 5),
  review_count   integer not null default 0 check (review_count >= 0),
  is_new         boolean not null default false,
  is_sale        boolean not null default false,
  stock          integer not null default 0 check (stock >= 0),
  size_prices    jsonb,
  images         jsonb default '[]',
  colors         jsonb default '[]',
  sizes          text[] default '{}',
  features       text[] default '{}',
  is_active      boolean not null default true,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table if not exists public.inventory_log (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  product_sku text not null,
  old_stock   integer not null,
  new_stock   integer not null,
  change      integer not null,
  reason      text,
  changed_by  uuid references public.profiles(id),
  created_at  timestamptz default now()
);

drop trigger if exists trg_products_updated_at   on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create index if not exists idx_categories_slug       on public.categories(slug);
create index if not exists idx_categories_is_active  on public.categories(is_active);
create index if not exists idx_categories_sort_order on public.categories(sort_order);

create index if not exists idx_products_sku         on public.products(sku);
create index if not exists idx_products_slug        on public.products(slug);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_is_active   on public.products(is_active);
create index if not exists idx_products_is_new      on public.products(is_new);
create index if not exists idx_products_is_sale     on public.products(is_sale);
create index if not exists idx_products_gender      on public.products(gender);
create index if not exists idx_products_price       on public.products(price);

-- Trigram + array indexes (pg_trgm enables fast fuzzy name search).
create index if not exists idx_products_name_trgm on public.products using gin (name gin_trgm_ops);
create index if not exists idx_products_tags_gin  on public.products using gin (tags);
create index if not exists idx_products_sizes_gin on public.products using gin (sizes);

create index if not exists idx_inventory_log_product_id on public.inventory_log(product_id);
create index if not exists idx_inventory_log_changed_by on public.inventory_log(changed_by);
create index if not exists idx_inventory_log_created_at on public.inventory_log(created_at);

-- ---- RLS: categories ----
alter table public.categories enable row level security;

drop policy if exists "Public read active categories" on public.categories;
drop policy if exists "Staff manage categories"       on public.categories;
drop policy if exists "Staff update categories"       on public.categories;
drop policy if exists "Admin delete categories"       on public.categories;

create policy "Public read active categories"
  on public.categories for select
  using (is_active = true or public.is_staff());

create policy "Staff manage categories"
  on public.categories for insert
  to authenticated
  with check (public.is_staff());

create policy "Staff update categories"
  on public.categories for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "Admin delete categories"
  on public.categories for delete
  to authenticated
  using (public.is_admin());

-- ---- RLS: products ----
alter table public.products enable row level security;

drop policy if exists "Public read active products" on public.products;
drop policy if exists "Staff insert products"       on public.products;
drop policy if exists "Staff update products"       on public.products;
drop policy if exists "Admin delete products"       on public.products;

create policy "Public read active products"
  on public.products for select
  using (is_active = true or public.is_staff());

create policy "Staff insert products"
  on public.products for insert
  to authenticated
  with check (public.is_staff());

create policy "Staff update products"
  on public.products for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "Admin delete products"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- ---- RLS: inventory_log (append-only audit trail) ----
alter table public.inventory_log enable row level security;

drop policy if exists "Staff read inventory log"   on public.inventory_log;
drop policy if exists "Staff insert inventory log" on public.inventory_log;

create policy "Staff read inventory log"
  on public.inventory_log for select
  to authenticated
  using (public.is_staff());

create policy "Staff insert inventory log"
  on public.inventory_log for insert
  to authenticated
  with check (public.is_staff());

-- ============================================================
-- 6. STORAGE — PRODUCT IMAGES BUCKET
-- ============================================================
-- Public bucket so product images can be served by CDN URL.
insert into storage.buckets (id, name, public)
values ('maish-product-images', 'maish-product-images', true)
on conflict (id) do update set public = true;

-- Sweep both naming variants used by the legacy scripts.
drop policy if exists "Public read product images"          on storage.objects;
drop policy if exists "Staff insert product images"         on storage.objects;
drop policy if exists "Staff update product images"         on storage.objects;
drop policy if exists "Staff delete product images"         on storage.objects;
drop policy if exists "Staff admin insert product images"   on storage.objects;
drop policy if exists "Staff admin update product images"   on storage.objects;
drop policy if exists "Staff admin delete product images"   on storage.objects;

create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'maish-product-images');

create policy "Staff insert product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'maish-product-images' and public.is_staff());

create policy "Staff update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'maish-product-images' and public.is_staff())
  with check (bucket_id = 'maish-product-images' and public.is_staff());

create policy "Staff delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'maish-product-images' and public.is_staff());

-- ============================================================
-- 7. REALTIME (guarded — safe to re-run)
-- ============================================================
do $$
declare
  t text;
begin
  foreach t in array array['orders','order_items','profiles','addresses','newsletter_subscribers']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ============================================================
-- ADMIN ACTIVITY LOG (audit trail)
--
-- Records every action taken in the admin dashboard: add, edit, delete,
-- price/stock changes, activate/deactivate, sign out, terms acceptance.
-- Staff may record activity; only admins may read it back.
-- ============================================================
create table if not exists public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  admin_email text,
  action text not null,
  entity_type text,
  entity_id text,
  entity_label text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_activity_log_created_at
  on public.admin_activity_log (created_at desc);

alter table public.admin_activity_log enable row level security;

drop policy if exists "admin_activity_log_staff_insert" on public.admin_activity_log;
create policy "admin_activity_log_staff_insert" on public.admin_activity_log
  for insert to authenticated
  with check (public.is_staff());

-- The SELECT policy is created further down, once the owner allow-list
-- table exists. It used to be "any admin"; it is now owner-only.

-- ============================================================
-- MAISH FASHION BOUTIQUE — OWNER-ONLY ACTIVITY LOG
-- Project ref: xttlmtwoenntqbrhkkox
--
-- 1. Grants admin to maishboutique@gmail.com (the shop account).
-- 2. Narrows admin_activity_log SELECT from "any admin" to the
--    main admin only (roysanga127@gmail.com).
--
-- INSERT is deliberately left open to all staff so everyone can
-- still record what they did; only *reading* the trail is locked
-- down. Without this, every admin could read everyone else's
-- history.
-- ============================================================

-- 1. Promote the shop account to admin -----------------------------
-- The profiles row is keyed by id = auth.users.id, so the auth user
-- must exist first (sign up once at /admin/login). This inserts the
-- profile when missing and promotes it when present, so re-running
-- is safe.
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id
  from auth.users
  where lower(email) = 'maishboutique@gmail.com';

  if v_user_id is null then
    raise notice
      'maishboutique@gmail.com is not in auth.users yet — create the account at /admin/login, then re-run this migration.';
    return;
  end if;

  insert into public.profiles (id, email, role)
  values (v_user_id, 'maishboutique@gmail.com', 'admin')
  on conflict (id) do update
    set role = 'admin',
        email = 'maishboutique@gmail.com',
        updated_at = now();

  raise notice 'maishboutique@gmail.com promoted to admin.';
end;
$$;

-- 2. Owner-only reader ---------------------------------------------
-- The allow-list lives in its own table so the owner can be changed
-- later with a single UPDATE instead of editing this function again.
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

-- Writing: any staff member, unchanged.
drop policy if exists "admin_activity_log_staff_insert" on public.admin_activity_log;
create policy "admin_activity_log_staff_insert" on public.admin_activity_log
  for insert to authenticated
  with check (public.is_staff());

-- Reading: the main admin only.
drop policy if exists "admin_activity_log_admin_select" on public.admin_activity_log;
drop policy if exists "admin_activity_log_owner_select" on public.admin_activity_log;
create policy "admin_activity_log_owner_select" on public.admin_activity_log
  for select to authenticated
  using (public.can_view_admin_activity_log());
-- ============================================================
-- END OF CONSOLIDATED SCHEMA
-- ============================================================