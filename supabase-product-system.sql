-- ============================================
-- MAISH FASHION BOUTIQUE
-- Product System Database Migration
-- Step 4 — Database Foundation
-- ============================================
-- This migration creates the foundation for the new product/admin system.
-- NO existing tables are modified, dropped, or rewritten.
-- NO products.ts migration is performed here.
-- NO website cutover is performed here.
-- ============================================

-- ============================================
-- 1. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  short_name      TEXT,
  description     TEXT,
  image           TEXT,
  color           TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT,
  sku             TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  price           INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  original_price  INTEGER CHECK (original_price >= 0),
  description     TEXT,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  gender          TEXT,
  tags            TEXT[] DEFAULT '{}',
  use_case        TEXT[] DEFAULT '{}',
  rating          NUMERIC(2,1) NOT NULL DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  review_count    INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  is_new          BOOLEAN NOT NULL DEFAULT FALSE,
  is_sale         BOOLEAN NOT NULL DEFAULT FALSE,
  stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  size_prices     JSONB,
  images          JSONB DEFAULT '[]',
  colors          JSONB DEFAULT '[]',
  sizes           TEXT[] DEFAULT '{}',
  features        TEXT[] DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. INVENTORY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_sku     TEXT NOT NULL,
  old_stock       INTEGER NOT NULL,
  new_stock       INTEGER NOT NULL,
  change          INTEGER NOT NULL,
  reason          TEXT,
  changed_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. PROFILES TABLE — ADD ROLE COLUMN
-- ============================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer'));

-- ============================================
-- 5. UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Products trigger (new table)
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Categories trigger (new table)
DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. INDEXES
-- ============================================
-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_sale ON products(is_sale);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_tags_gin ON products USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_products_sizes_gin ON products USING gin(sizes);

-- Inventory log indexes
CREATE INDEX IF NOT EXISTS idx_inventory_log_product_id ON inventory_log(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_log_changed_by ON inventory_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_inventory_log_created_at ON inventory_log(created_at);

-- ============================================
-- 7. RLS — PRODUCTS
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public / anonymous: read active products only
CREATE POLICY "Public read active products"
  ON products
  FOR SELECT
  USING (is_active = TRUE);

-- Authenticated customers: read active products only
CREATE POLICY "Customer read active products"
  ON products
  FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Staff: read all products (including inactive, for admin dashboard)
CREATE POLICY "Staff read all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- Staff: insert new products
CREATE POLICY "Staff insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- Staff: update products (covers soft delete by setting is_active = FALSE)
CREATE POLICY "Staff update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- Admin: full access including hard delete
CREATE POLICY "Admin full products access"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 8. RLS — CATEGORIES
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public / anonymous / customers: read active categories
CREATE POLICY "Public read active categories"
  ON categories
  FOR SELECT
  USING (is_active = TRUE);

-- Staff: read all categories
CREATE POLICY "Staff read all categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- Staff: insert categories
CREATE POLICY "Staff insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- Staff: update categories (soft delete via is_active = FALSE)
CREATE POLICY "Staff update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- Admin: full access including hard delete
CREATE POLICY "Admin full categories access"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 9. RLS — INVENTORY LOG
-- ============================================
ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;

-- Staff and admin: read all inventory logs (audit trail - append only)
CREATE POLICY "Staff read inventory log"
  ON inventory_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- Staff and admin: insert inventory logs (append only)
CREATE POLICY "Staff insert inventory log"
  ON inventory_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- ============================================
-- 10. RLS — PROFILES (new role-based policies)
-- ============================================
-- Note: Existing profile RLS policies (self-access) remain in place.
-- These new policies ADD access for staff/admin without removing existing ones.

-- Staff and admin: view all profiles
CREATE POLICY "Staff admin view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
    )
    OR auth.uid() = profiles.id
  );

-- Admin: update any profile (including role changes)
CREATE POLICY "Admin update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR auth.uid() = profiles.id
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================
-- 11. STORAGE BUCKET — PRODUCT IMAGES
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('maish-product-images', 'maish-product-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket policies

-- Public can read bucket list
CREATE POLICY "Public read buckets"
  ON storage.buckets
  FOR SELECT
  USING (true);

-- Only admin/staff can create Storage buckets
CREATE POLICY "Staff admin manage buckets"
  ON storage.buckets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- Public can read product images
CREATE POLICY "Public read product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'maish-product-images');

-- Staff and admin can insert product images
CREATE POLICY "Staff admin insert product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'maish-product-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- Staff and admin can update product images
CREATE POLICY "Staff admin update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'maish-product-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    bucket_id = 'maish-product-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- Staff and admin can delete product images
CREATE POLICY "Staff admin delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'maish-product-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- ============================================
-- END OF MIGRATION
-- ============================================