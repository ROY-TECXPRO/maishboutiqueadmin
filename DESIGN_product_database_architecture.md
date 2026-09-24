# MAISH FASHION BOUTIQUE — Product Database Architecture Design

**Date:** 2026-09-17
**Status:** DESIGN ONLY — No files modified, no database changes, no migration performed

---

## 1. PRODUCTS TABLE

Design philosophy: **practical hybrid** — scalar fields as proper columns for querying/filtering, JSONB for complex nested structures. This balances index performance with admin usability and avoids over-normalization for a 200-300 product catalog.

### Table: `products`

| Column | Type | Nullable | Default | Purpose | Index | Unique |
|--------|------|----------|---------|---------|-------|--------|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | Primary key, replaces string IDs like 'women-dress-001' | YES (PK) | YES |
| `sku` | `TEXT` | NOT NULL | — | Stock Keeping Unit, human-readable product code e.g. 'MF-WD-001' | YES | YES |
| `name` | `TEXT` | NOT NULL | — | Product display name | YES (trigram for search) | NO |
| `slug` | `TEXT` | NOT NULL | — | URL-friendly slug derived from name, for SEO URLs | YES | YES |
| `price` | `INTEGER` | NOT NULL | `0` | Current selling price in KES ( Kenyan Shillings, stored as integer to avoid floating-point) | YES | NO |
| `original_price` | `INTEGER` | NULL | NULL | Original/strikethrough price for sale display. NULL when no sale | YES | NO |
| `description` | `TEXT` | NULL | NULL | Long product description (HTML or plain text) | NO | NO |
| `category_id` | `UUID` | NULL | NULL | Foreign key → `categories(id)`. NULL allowed during transition while categories table is being populated | YES (FK) | NO |
| `subcategory` | `TEXT` | NULL | NULL | Free-text subcategory e.g. 'Dresses', 'Trousers'. Kept as text (not FK) because subcategory naming varies widely and is managed by admin | NO | NO |
| `gender` | `TEXT` | NULL | NULL | One of: 'Women', 'Men', 'Kids', 'Unisex', 'Boys', 'Girls' from current `Gender` type | NO | NO |
| `tags` | `TEXT[]` | NULL | `{}` | Array of tag strings e.g. `['ankara','maxi','party']` for filtering/search | YES (GIN index) | NO |
| `use_case` | `TEXT[]` | NULL | `{}` | Array of use case strings e.g. `['casual','formal','party']` | YES (GIN index) | NO |
| `rating` | `NUMERIC(2,1)` | NOT NULL | `0.0` | Average customer rating 0.0–5.0 | NO | NO |
| `review_count` | `INTEGER` | NOT NULL | `0` | Total number of reviews | NO | NO |
| `is_new` | `BOOLEAN` | NOT NULL | `FALSE` | Flags product as new arrival | NO | NO |
| `is_sale` | `BOOLEAN` | NOT NULL | `FALSE` | Flags product as on sale (triggers original_price display) | NO | NO |
| `stock` | `INTEGER` | NOT NULL | `0` | Current stock quantity (integer count) | NO | NO |
| `size_prices` | `JSONB` | NULL | NULL | Size-based pricing override e.g. `{"Large":7500,"Medium":4999,"Small":2599}`. NULL when not applicable (only luggage/bag products currently use this) | NO | NO |
| `images` | `JSONB` | NULL | `'[]'` | Primary images array: `[{"src":"storage_url","alt":"description"}, ...]`. First image is thumbnail/listing image. Stored as JSONB for flexibility | NO | NO |
| `colors` | `JSONB` | NULL | `'[]'` | Array of color objects: `[{"name":"Multi","hex":"#e76f51","available":true}, ...]`. Available flag per color is used in UI | NO | NO |
| `sizes` | `TEXT[]` | NULL | `{}` | Array of available sizes e.g. `['S','M','L','XL']` | YES (GIN index) | NO |
| `features` | `TEXT[]` | NULL | `{}` | Array of feature strings e.g. `['100% Cotton','Machine Washable']` | NO | NO |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | `NOW()` | Record creation timestamp | NO | NO |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | `NOW()` | Last update timestamp (auto-updated via trigger) | NO | NO |
| `is_active` | `BOOLEAN` | NOT NULL | `TRUE` | Soft-delete flag. FALSE = hidden from public website but retained in DB | NO | NO |

### Design Rationale per Field

- **`price` / `original_price`** as `INTEGER` (KES cents or whole shillings): Current data uses whole numbers (e.g. 2599, 4000). Integer avoids floating-point precision issues. Stored as-is from products.ts.
- **`size_prices`** as `JSONB`: Only ~11 products use this (luggage/bags with Large/Medium/Small pricing). JSONB preserves the exact `Record<string, number>` structure from the TypeScript type. Enables admin to set per-size pricing without schema changes.
- **`images`** as `JSONB` (first stage): During initial migration, store the `src` URLs from products.ts as local paths (e.g. `/images/women/dresses/african-print-dress.webp`). Later, these will be replaced with Supabase Storage URLs. JSONB allows gradual migration — one product at a time.
- **`colors`** as `JSONB`: The `ProductColor` type (`{name, hex, available}`) maps cleanly to JSONB objects. Admin can toggle `available` per color without schema changes.
- **`tags` / `use_case` / `sizes`** as `TEXT[]`: Arrays support GIN indexing for efficient filtering (critical for CategoryPage filters and SearchPage).
- **`category_id`** as nullable FK during transition: See Section 2 for why this starts nullable.
- **`is_active`** instead of hard delete: Allows admin to hide products without losing data.
- **`slug`** derived from `name`: For SEO-friendly URLs. Generated automatically on insert/update.
- **`rating`** as `NUMERIC(2,1)`: Matches current precision (e.g. 4.8, 4.7). One decimal place.

### Indexes Summary

| Index | Columns | Type | Purpose |
|-------|---------|------|---------|
| `products_pkey` | `id` | B-tree (PK) | Primary key lookup |
| `products_sku_unique` | `sku` | B-tree (UNIQUE) | SKU validation |
| `products_slug_unique` | `slug` | B-tree (UNIQUE) | URL lookup |
| `products_name_trgm` | `name` | GIN (trigram) | Search-by-name (fuzzy) |
| `products_category_id` | `category_id` | B-tree (FK) | Filter by category |
| `products_tags_gin` | `tags` | GIN | Filter by tags |
| `products_use_case_gin` | `use_case` | GIN | Filter by use case |
| `products_sizes_gin` | `sizes` | GIN | Filter by sizes |
| `products_price` | `price` | B-tree | Price range sorting/filtering |
| `products_is_active` | `is_active` | B-tree | Hide inactive products |
| `products_gender` | `gender` | B-tree | Filter by gender |
| `products_is_new` | `is_new` | B-tree | New arrivals page |
| `products_is_sale` | `is_sale` | B-tree | Sale page |

---

## 2. CATEGORIES

**Recommended approach: C (combination) — a `categories` table + a `category_id` FK on `products` + optional `subcategory` text field on products.**

### Why not A (category fields only on products)?
Hardcoded category data in products.ts makes it impossible for admin to edit categories without a code change and redeploy. With 11 categories currently defined, this becomes a maintenance bottleneck.

### Why not B (normalize everything)?
A full category/subcategory tree with separate tables adds complexity that is unnecessary for 11 categories. Subcategory names are free-text in the current system (e.g. 'Dresses', 'Trousers', 'Shirts') and vary per product. Forcing a rigid hierarchy would require admin to pre-create every subcategory.

### Design

**Table: `categories`**

| Column | Type | Nullable | Default | Purpose |
|--------|------|----------|---------|---------|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | PK |
| `slug` | `TEXT` | NOT NULL | — | Unique key matching current IDs: 'women-wear', 'men-wear', etc. |
| `name` | `TEXT` | NOT NULL | — | Display name: 'Women Wear', 'Men Wear', etc. |
| `short_name` | `TEXT` | NULL | NULL | Short label for UI: 'Women', 'Men', etc. |
| `description` | `TEXT` | NULL | NULL | Category description |
| `image` | `TEXT` | NULL | NULL | Supabase Storage URL for category image |
| `color` | `TEXT` | NULL | NULL | HSL color string for UI accent (from current `color` field in CategoryInfo) |
| `sort_order` | `INTEGER` | NOT NULL | `0` | Manual ordering for frontend display |
| `is_active` | `BOOLEAN` | NOT NULL | `TRUE` | Soft-delete |
| `created_at` | `TIMESTAMP` | NOT NULL | `NOW()` | |
| `updated_at` | `TIMESTAMP` | NOT NULL | `NOW()` | |

**Table: `products`** references `categories(slug)` via `category_id` (UUID FK).

**`subcategory`** remains a free-text column on `products` (not a separate table). Admin can type any subcategory name when editing a product. Future enhancement: if 5+ subcategories need their own pages, promote to a separate table.

### Migration Mapping (categories data from products.ts)

The `categories` array in `products.ts` (11 items) maps directly:

| CategoryInfo field | categories table column |
|-------------------|------------------------|
| `id` | `slug` (preserved as unique key) |
| `name` | `name` |
| `shortName` | `short_name` |
| `description` | `description` |
| `image` | `image` (will need migration to Storage URL) |
| `color` | `color` |

### RLS for Categories

- Public: SELECT where `is_active = TRUE` (read-only, all active categories visible)
- Staff: FULL CRUD
- Admin: FULL CRUD + can deactivate

---

## 3. PRODUCT IMAGES

### Bucket Name
`maish-product-images`

### Folder/Path Structure

```
maish-product-images/
  products/
    {product-id}/
      {filename}           → e.g. african-print-dress.webp
  categories/
    {category-slug}.webp   → e.g. women-wear.webp
```

### What to Store in Database

**`products.images`** (JSONB column): Array of objects with `src` (Storage path or public URL) and `alt` (descriptive text).

Example after Storage integration:
```json
[
  { "src": "https://crbtwikhkqbhqkimyqay.supabase.co/storage/v1/object/public/maish-product-images/products/women-dress-001/african-print-dress.webp", "alt": "African print maxi dress for women" },
  { "src": "...", "alt": "..." }
]
```

**`categories.image`** (TEXT column): Single Storage URL string.

### How Public Website Retrieves Images

1. **Primary method**: Read `products.images[0].src` for product listing cards and detail pages.
2. **Supabase Storage public URL**: Images served via `https://crbtwikhkqbhqkimyqay.supabase.co/storage/v1/object/public/maish-product-images/...`
3. **Fallback**: If image src starts with `/images/` (local path), serve from `public/images/` directory (during transition period).

### How Admin Uploads/Deletes/Replaces Images

1. **Upload**: Admin selects file in dashboard → uploaded to `maish-product-images/products/{product-id}/{filename}` via Supabase Storage API.
2. **Delete**: Admin clicks delete → removes file from Storage AND removes entry from `products.images` JSONB array.
3. **Replace**: Admin uploads new file → new entry appended to `images` array; old entry marked for deletion or immediately removed.
4. **Order**: Drag-and-drop reordering updates the JSONB array order (first item = primary/listing image).

### Storage Policy Design (intended, not implemented)

- Public: `SELECT` on all objects (images are publicly visible on website)
- Authenticated staff/admin: `INSERT`, `UPDATE`, `DELETE` on objects in `products/` prefix
- Service role: Used by edge function for image processing if needed

---

## 4. INVENTORY / STOCK

**Recommended approach: Stock remains on `products` table + optional `inventory_log` table for audit trail.**

### Rationale

For a small retail business with ~200-300 products, a separate inventory table is over-engineering. The current `stock` integer on each product is sufficient for daily operations. However, staff need an audit trail of stock changes, so we add a log table alongside (not instead of).

### Stock on `products` table

- `stock INTEGER NOT NULL DEFAULT 0` — stays as designed in Section 1
- Staff update it directly from the product edit form in admin dashboard
- RLS policy controls who can write (staff + admin only)

### Optional: `inventory_log` table (for audit)

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `id` | `UUID` | NOT NULL | PK |
| `product_id` | `UUID` | NOT NULL | FK → products(id) |
| `product_sku` | `TEXT` | NOT NULL | Snapshot of SKU at time of change (for historical accuracy) |
| `old_stock` | `INTEGER` | NOT NULL | Previous stock value |
| `new_stock` | `INTEGER` | NOT NULL | New stock value |
| `change` | `INTEGER` | NOT NULL | Computed: `new_stock - old_stock` (positive = restock, negative = sale/adjustment) |
| `reason` | `TEXT` | NULL | Optional reason: 'sale', 'restock', 'damage', 'return', 'adjustment' |
| `changed_by` | `UUID` | NULL | FK → auth.users(id) — who made the change |
| `created_at` | `TIMESTAMP` | NOT NULL | When the change was logged |

**Why keep stock on products?** Querying stock requires a JOIN with a separate table for every product listing, search result, and cart check. For a small catalog this adds unnecessary latency and complexity.

**Why add the log?** Staff mistakes happen. The log provides accountability without impacting read performance.

---

## 5. ADMIN / STAFF ROLES

### Role Storage: Add `role` column to existing `profiles` table

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer'));
```

### Who Can Change Roles

- **Only admin** can change roles (via admin dashboard → Staff/Users module).
- Self-service role changes are NOT allowed.
- Role changes are logged in a `role_audit` table (optional but recommended).

### Permission Matrix

| Action | Admin | Staff | Customer |
|--------|-------|-------|----------|
| View all products | YES | YES | YES (public) |
| Create product | YES | YES | NO |
| Edit product | YES | YES (cannot change SKU/price?) | NO |
| Delete product | YES | NO (soft-delete only) | NO |
| View categories | YES | YES | YES (public) |
| Create/edit categories | YES | NO | NO |
| View orders | YES (all) | YES (assigned/assigned zone) | YES (own only) |
| Update order status | YES | YES (restricted to their zone) | NO |
| View inventory/stock | YES | YES | NO |
| Update stock | YES | YES | NO |
| Manage product images | YES | YES | NO |
| View/manage staff | YES | NO | NO |
| View analytics | YES | NO | NO |
| View newsletter subscribers | YES | NO | NO |
| Update own profile | YES | YES | YES |

### Design Notes

- **Customers** are existing Supabase Auth users who have a `profiles` record with `role = 'customer'` (default).
- **Staff** are employees who can log in and access the admin dashboard with restricted permissions.
- **Admin** has full access to all modules.
- The current hardcoded admin check (`maishboutiquemarketing@gmail.com`) in `OrdersPage.tsx:59` will be replaced by server-side RLS + role check.
- No new table is needed for roles — the `profiles` table (which already exists and is tied to Supabase Auth) gains a `role` column. This is the most natural place for it.

### Security Requirement

Authorization must be enforced by **Supabase RLS/database policies**, NOT by frontend-only checks. The frontend may hide buttons, but the database layer MUST reject unauthorized operations regardless of what the frontend sends.

---

## 6. RLS DESIGN

### 6a. Products

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Public/Anonymous | WHERE `is_active = TRUE` | NO | NO | NO |
| Customer (authenticated) | WHERE `is_active = TRUE` | NO | NO | NO |
| Staff | ALL rows | YES | YES (all columns except `sku`, `id`) | SOFT DELETE (set `is_active = FALSE`) |
| Admin | ALL rows | YES | YES (all columns) | YES (hard or soft delete) |

**Public listing**: `SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC` — no auth required, returns active products only.

**Individual product lookup**: `SELECT * FROM products WHERE id = $1` — works for any role, returns inactive too if caller is staff/admin.

### 6b. Categories

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Public/Anonymous | WHERE `is_active = TRUE` | NO | NO | NO |
| Customer | WHERE `is_active = TRUE` | NO | NO | NO |
| Staff | ALL | YES | YES | SOFT DELETE |
| Admin | ALL | YES | YES | YES |

### 6c. Profiles

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Self | Own row only | NO | Own row (name, phone, avatar) | NO |
| Staff | ALL | NO | Role changes (admin only) | NO |
| Admin | ALL | NO | ALL | NO |

Note: `profiles` already has RLS from Step 2 audit. New policies will coexist (Supabase allows multiple policies per table per operation — the most permissive applies unless `CHECK` constraints narrow it). Need to ensure new policies don't inadvertently override existing correct ones.

### 6d. Product Images (Supabase Storage)

Storage policies (bucket-level):

| Role | READ | WRITE | DELETE |
|------|------|-------|--------|
| Public | YES (all objects in bucket) | NO | NO |
| Staff | YES | YES (objects in `products/` prefix) | YES |
| Admin | YES | YES | YES |

### 6e. Inventory Log (if implemented)

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Staff | YES (all) | YES | NO | NO |
| Admin | YES (all) | YES | NO | NO |
| Customer | NO | NO | NO | NO |

### 6f. Orders (existing — reference only)

Current RLS policies from Step 2 audit are inconsistent across 3 SQL files. Future design should:
- Resolve conflicts (see Step 2, Section D)
- Add role-aware policies: customers see own orders, staff see orders in their zone, admin sees all
- These are NOT modified in this design phase

---

## 7. MIGRATION FROM products.ts

### 7a. Field Mapping

| products.ts Field | Database Column | Type | Notes |
|-------------------|----------------|------|-------|
| `id` | `id` | UUID | NEW UUID generated; old string ID preserved in `legacy_id` column during transition (then dropped) |
| `name` | `name` | TEXT | Direct copy |
| `price` | `price` | INTEGER | Direct copy (value is already integer KES) |
| `originalPrice` | `original_price` | INTEGER NULL | Direct copy; NULL if undefined |
| `images[].src` | `images` JSONB | JSONB | Path kept as local `/images/...` initially; will be replaced with Storage URLs later |
| `images[].alt` | `images` JSONB | JSONB | Direct copy into JSONB structure |
| `category` | `category_id` | UUID (FK) | Resolved via `categories` table lookup by slug |
| `subCategory` | `subcategory` | TEXT | Direct copy |
| `gender` | `gender` | TEXT | Direct copy |
| `sizes` | `sizes` | TEXT[] | Direct copy as array |
| `colors` | `colors` | JSONB | Array of `{name, hex, available}` → JSONB objects |
| `tags` | `tags` | TEXT[] | Direct copy as array |
| `useCase` | `use_case` | TEXT[] | Direct copy as array |
| `description` | `description` | TEXT | Direct copy |
| `features` | `features` | TEXT[] | Direct copy as array |
| `rating` | `rating` | NUMERIC(2,1) | Direct copy |
| `reviewCount` | `review_count` | INTEGER | Direct copy |
| `isNew` | `is_new` | BOOLEAN | Direct copy; FALSE if undefined |
| `isSale` | `is_sale` | BOOLEAN | Direct copy; FALSE if undefined |
| `stock` | `stock` | INTEGER | Direct copy |
| `sku` | `sku` | TEXT | Direct copy; MUST be unique (see 7c) |
| `sizePrices` | `size_prices` | JSONB | Direct copy as `{"Large":7500,...}`; NULL if undefined |
| _(none)_ | `slug` | TEXT | Generated from `name` (lowercase, hyphenated) |
| _(none)_ | `is_active` | BOOLEAN | Default TRUE for all migrated products |
| _(none)_ | `created_at` | TIMESTAMP | NOW() for all migrated |
| _(none)_ | `updated_at` | TIMESTAMP | NOW() for all migrated |

### 7b. Fields Requiring Transformation

1. **`id` (string → UUID)**: Each product gets a new `gen_random_uuid()`. A `legacy_id TEXT` column will temporarily store the old string ID (e.g. 'women-dress-001') for reference during transition. Column dropped after 30 days.
2. **`category` (string slug → UUID FK)**: Each category string (e.g. 'women-wear') must be resolved to the corresponding `categories.id` UUID by looking up `categories WHERE slug = 'women-wear'`. If category doesn't exist yet in the categories table, `category_id` is NULL (must be backfilled after categories are inserted).
3. **`images[].src` (local path → potentially Storage URL)**: Initially copied as-is (local paths). A background job will replace them with Storage URLs after the bucket is created and images are uploaded.
4. **`slug` (generated)**: Derived from `name` using: lowercase → replace non-alphanumeric with hyphens → collapse multiple hyphens → trim. Example: "Elegant Ankara Maxi Dress" → "elegant-ankara-maxi-dress". If collision, append `-2`, `-3`, etc.
5. **`sizePrices` (Record<string,number> → JSONB)**: Direct serialization. TypeScript `Record<string, number>` becomes JSONB object with string keys and numeric values.
6. **`colors` (ProductColor[] → JSONB)**: Array of `{name: string, hex: string, available: boolean}` becomes JSONB array.
7. **`sizes` (Size[] → TEXT[])**: TypeScript union type becomes PostgreSQL TEXT[] (all size values are strings).
8. **`tags`, `useCase`, `features` (string[] → TEXT[])**: Direct array conversion.

### 7c. Duplicate SKUs — Critical Data Issue

The following SKUs appear on MULTIPLE products in products.ts:

| SKU | Product IDs Affected | Count |
|-----|---------------------|-------|
| `MF-WT-001` | 2 products | DUPLICATE |
| `MF-WT-002` | 2 products | DUPLICATE |
| `MF-WT-003` | 2 products | DUPLICATE |
| `MF-WT-004` | 2 products | DUPLICATE |
| `MF-MS-001` through `MF-MS-009` | 2 products each | DUPLICATE (9 SKUs × 2 products = 18 entries) |

**Total: ~22 duplicate SKU entries** across approximately 12 unique SKU values.

**Resolution required BEFORE migration**:
- Option A: Rename one of each duplicate pair (e.g. `MF-WT-001-B` for the second product)
- Option B: Merge the duplicate products if they are actually the same product listed twice
- The migration script must detect this and either auto-renumber or halt for manual review.

### 7d. Missing/Invalid Values

- **`originalPrice`**: Many products have `undefined` — maps to NULL (correct behavior)
- **`description`**: Some products have `undefined` — maps to NULL (correct)
- **`useCase`**: Some products have `undefined` — maps to NULL (correct)
- **`features`**: Some products have `undefined` — maps to NULL/empty array (correct)
- **`category`**: All products have a valid category string matching a CategoryInfo id — no orphans expected if categories are migrated first
- **`rating`**: All products seem to have a value — no NULLs expected
- **`gender`**: Some products may have `undefined` — maps to NULL (correct)

### 7e. Local Image Paths Migration

Products.ts images reference local paths like `/images/women/dresses/african-print-dress.webp`. These correspond to files in `public/images/`. During the Storage migration phase:

1. Each local path is scanned
2. Corresponding file is uploaded to `maish-product-images/products/{product-id}/`
3. The `images` JSONB `src` field is updated to the Storage public URL
4. Local files can eventually be removed from `public/images/` (but NOT during initial cutover)

---

## 8. BACKWARD-COMPATIBILITY PLAN

### Phase 0: Preparation (no user-facing changes)
1. Create `categories` table and populate from `categories` array in products.ts
2. Create `products` table (empty, no data yet)
3. Create `maish-product-images` Storage bucket (private initially)
4. Add `role` column to `profiles` table (default 'customer')
5. Build admin dashboard backend endpoints (read/write to new tables)

### Phase 1: Dual Write (no user-facing changes)
1. Product data is read from `products.ts` on the website (unchanged)
2. Admin populates `products` table from products.ts data (migration script run once)
3. Admin verifies products table has correct data by cross-referencing

### Phase 2: Shadow Read (no user-facing changes)
1. Add feature flag `USE_DATABASE_PRODUCTS=false`
2. Website still reads from `products.ts` exclusively
3. Behind the flag, backend can optionally read from DB and compare results
4. Verify parity: products.ts results === DB results for every page/category/search

### Phase 3: Controlled Cutover
1. Set `USE_DATABASE_PRODUCTS=true` for a subset (e.g. 10% of traffic or single test user)
2. Monitor: page load times, search results accuracy, category filtering
3. Expand to 50% → 100% over days
4. At each stage, compare outputs against products.ts baseline

### Phase 4: Fallback
1. Keep `products.ts` file UNTOUCHED in the repository
2. If DB products fail: feature flag flips back to `USE_DATABASE_PRODUCTS=false` → website reads from products.ts instantly
3. `products.ts` serves as the universal fallback until DB is verified stable

### Rollback Procedure
1. Change feature flag to `false` (or remove environment variable)
2. Website immediately reads from `products.ts` again
3. No code deployment needed (flag is checked at runtime)
4. Database products table remains intact for re-attempt

---

## 9. REALTIME

### Which Tables Should Use Supabase Realtime

**Primary target: `products` table** — product data changes are the most frequent and impactful to the public website.

**Secondary target: `categories` table** — changes are rare but should propagate (e.g. admin adds new category → homepage category grid updates).

**Not realtime (current):** `orders`, `order_items`, `profiles` — these already have Realtime configured in SQL but frontend doesn't use it. Out of scope for product system.

### What Events Matter

| Event | Table | Impact |
|-------|-------|--------|
| INSERT | `products` | New product appears on website (new arrivals, category pages) |
| UPDATE | `products` | Price change, stock change, image update, sale flag toggled |
| DELETE/SOFT-DELETE | `products` | Product removed from listing (is_active = FALSE) |
| INSERT | `categories` | New category appears in navigation and filters |
| UPDATE | `categories` | Category name/image/description change reflects site-wide |

### How Frontend Should Subscribe

Once TanStack React Query (or similar) is adopted:

```typescript
// Conceptual pattern — NOT implementation (no implementation in this design phase)
// Requires adoption of a data-fetching library that supports optimistic updates
// or realtime-driven cache invalidation

const { data: products } = useQuery(['products'], fetchProducts);

// Subscribe to product changes
useSubscription(
  { event: 'products_change', channel: 'products-realtime' },
  {
    onInsert: () => queryClient.invalidateQueries(['products']),
    onUpdate: () => queryClient.invalidateQueries(['products']),
    onDelete: () => queryClient.invalidateQueries(['products']),
  }
);
```

### Cache Invalidation Strategy

1. **Global product list**: Invalidate on any INSERT/UPDATE/DELETE to products
2. **Individual product detail**: Invalidate on UPDATE/DELETE for specific product ID
3. **Category-filtered lists**: Invalidate when products in that category change OR when categories change
4. **Search results**: Invalidate on any product change (search index rebuild)
5. **Homepage sections** (new arrivals, sale, featured): Invalidate on product changes matching the section criteria

**Note**: The current codebase does NOT use TanStack React Query. This section documents the eventual architecture. When the project adopts a data-fetching library (planned for a future step), this Realtime integration will be implemented.

---

## 10. ADMIN FEATURES

| Module | Purpose |
|--------|---------|
| **Dashboard** | Overview: total products, low stock alerts, recent orders, new signups, sales summary (charts) |
| **Products** | List all products (DB-backed), search by name/SKU, filter by category/stock/status, sort by various columns |
| **Add Product** | Form to create new product: name, price, images (upload to Storage), category/subcategory, sizes, colors, tags, description, features, stock, SKU |
| **Edit Product** | Modify any product field; image management (upload/delete/reorder); real-time preview |
| **Categories** | CRUD for categories: create, rename, reorder, activate/deactivate, upload category image |
| **Inventory/Stock** | Bulk stock update (CSV import/export), stock change log per product, low-stock alerts, stock history per product |
| **Product Images** | Upload to Storage, manage per product, bulk operations, thumbnail generation |
| **Orders** | View all orders (existing Supabase orders table), filter by status/date/customer, update order status, view order items |
| **Staff/Users** | Manage profiles: view all users, assign/edit roles (admin/staff/customer), deactivate users, role audit log |
| **Settings** | Store name, contact info, delivery zones, payment methods, newsletter configuration, theme/branding settings |

### Future Modules (Phase 2)

| Module | Purpose |
|--------|---------|
| **Reviews** | Moderate customer reviews, respond to reviews |
| **Promotions** | Create discount codes, flash sales, seasonal banners |
| **Analytics** | Sales reports, popular products, customer behavior, conversion rates |
| **Notifications** | Stock alerts, order status emails, newsletter management |

---

## 11. DATA SAFETY

### Existing Data That Must NOT Be Deleted

- `products.ts` — 9,907-line file, currently the sole product data source. MUST remain in repository as fallback.
- `src/types/index.ts` — TypeScript types including Product interface. MUST NOT be modified (defines data contract used across 13+ files).
- `src/data/categories` array within products.ts — currently the sole category data source.
- All existing Supabase tables: `profiles`, `orders`, `order_items`, `addresses`, `newsletter_subscribers`
- All user auth data in Supabase Auth
- All image files in `public/images/` directory

### Existing Tables That Should Remain Untouched

| Table | Reason |
|-------|--------|
| `profiles` | Only ADD a `role` column; never DELETE or MODIFY existing columns (email, full_name, etc.) |
| `orders` | Existing order history must be preserved exactly |
| `order_items` | Existing order line items must be preserved exactly |
| `addresses` | Customer shipping addresses must be preserved exactly |
| `newsletter_subscribers` | Subscriber records must be preserved exactly |

### What Should Be Backed Up Before Migration

1. **products.ts** — backup copy before any automated migration script processes it
2. **Current database snapshot** — export all existing table data (`pg_dump` or Supabase SQL editor export)
3. **Categories data** — backup the `categories` array from products.ts (will become a table)
4. **Image inventory** — list all files in `public/images/` with their current paths (for Storage migration reference)
5. **SKU list** — export all current SKUs from products.ts and flag duplicates BEFORE migration

### What Happens If Product Migration Fails

1. **No data loss**: products.ts is never modified. Migration script only READS from it.
2. **Feature flag**: `USE_DATABASE_PRODUCTS` stays `false` if migration validation fails.
3. **Database**: Products table remains empty or partially populated. No partial data is exposed to the website.
4. **Error logging**: All migration errors logged to admin dashboard for review.
5. **Manual intervention**: Admin can re-run migration after fixing issues, or populate products table manually via admin forms.

### Rollback to products.ts

1. Database products table is irrelevant — website does not use it when flag is `false`.
2. products.ts file is still in the codebase and being imported by 13+ files.
3. To revert: ensure feature flag is `false` (or env var unset). Website immediately uses products.ts.
4. Zero code changes needed on rollback. Zero database changes needed on rollback.

---

## 12. FINAL ARCHITECTURE

### Product/Admin System Architecture

```
┌─────────────────────────┐
│   ADMIN DASHBOARD       │
│  (Staff/Admin only)     │
│  ┌───────────────────┐  │
│  │ CRUD for:         │  │
│  │ Products, Categories│ │
│  │ Inventory, Images  │  │
│  │ Orders, Staff      │  │
│  │ Settings           │  │
│  └────────┬──────────┘  │
│           │             │
│  Uses Supabase Auth    │
└───────────┼─────────────┘
            │
            ▼
┌─────────────────────────┐
│   SUPABASE AUTH         │
│   (Existing, unchanged) │
│   Email/Password, OAuth │
│   → profiles table      │
│   → role column added   │
└───────────┼─────────────┘
            │
            ▼
┌─────────────────────────┐
│   ROLES / RLS           │
│   ┌─────────────────┐   │
│   │ Public: Read    │   │
│   │ Staff: CRUD     │   │
│   │ Admin: Full     │   │
│   └─────────────────┘   │
│   (Database-level auth) │
└─────┬───────────┬───────┘
      │           │
      ▼           ▼
┌───────────┐ ┌──────────────┐
│ PRODUCTS  │ │ CATEGORIES  │
│ + IMAGES  │ │             │
│ (table)   │ │ (table)     │
│ + STOCK   │ │             │
│ (column)  │ │             │
└─────┬─────┘ └──────┬───────┘
      │              │
      ▼              ▼
┌─────────────────────────┐
│   SUPABASE STORAGE      │
│   maish-product-images/ │
│   products/{id}/...     │
│   categories/*.webp     │
└─────┬───────────────────┘
      │ Public URLs
      ▼
┌─────────────────────────┐
│   PUBLIC WEBSITE        │
│   (React + Tailwind)    │
│   Reads from Supabase   │
│   via RLS policies      │
│   Fallback: products.ts │
└─────────────────────────┘
```

### Orders & Customer Profiles Connection (unchanged)

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐
│  Supabase │────→│  profiles    │     │  orders         │
│  Auth     │     │  (existing)  │     │  (existing)     │
│          │     │              │     │  user_id → profiles.id │
└──────────┘     │  role column │     │  (existing)     │
                 │  + new role  │     │  order_items    │
                 └──────────────┘     │  (existing)     │
                                      └─────────────────┘
```

**Existing connections remain intact:**
- `orders.user_id` → `profiles.id` (existing FK, already in schema)
- `order_items.order_id` → `orders.id` (existing FK, already in schema)
- `profiles.id` links to Supabase Auth user (existing, unchanged)
- New `profiles.role` column adds admin/staff distinction without affecting existing customer flows
- Orders system is completely independent from products system — no foreign key between them today, none added in this design

---

## DESIGN STATUS: COMPLETE

**FILES MODIFIED:** NONE
**DATABASE MODIFIED:** NO
**PRODUCTS MIGRATED:** NO
**FRONTEND MODIFIED:** NO
**TABLES CREATED:** NO
**SQL FILES CREATED:** NO
**ADMIN DASHBOARD BUILT:** NO

All content above is design documentation only. No implementation has been performed or initiated. Awaiting next instruction.
