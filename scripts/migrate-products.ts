/**
 * Migrates categories + products from src/data/products.ts into the
 * Supabase `categories` and `products` tables created by
 * supabase-product-system.sql.
 *
 * PREREQUISITES:
 *   1. supabase-product-system.sql has already been executed against the project.
 *   2. Environment variables set (see .env.migration.example):
 *        SUPABASE_URL=https://crbtwikhkqbhqkimyqay.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=<service role key, NOT the anon key>
 *
 *   The service role key is required because it bypasses RLS for this
 *   one-time bulk load. Never commit it, never expose it client-side.
 *
 * USAGE:
 *   npm install            (installs tsx, added to devDependencies)
 *   npm run migrate:products
 *
 * SAFE TO RE-RUN:
 *   Categories are upserted on `slug`. Products are upserted on `sku`.
 *   Re-running will update existing rows rather than duplicate them.
 */

import { createClient } from '@supabase/supabase-js';
import { categories, products } from '../src/data/products';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.\n' +
    'Copy .env.migration.example to .env.migration, fill in values, then run:\n' +
    '  export $(cat .env.migration | xargs) && npm run migrate:products'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function migrateCategories(): Promise<Map<string, string>> {
  console.log(`\nMigrating ${categories.length} categories...`);

  const rows = categories.map((c, index) => ({
    slug: c.id, // category id in products.ts is already a stable slug, e.g. 'women-wear'
    name: c.name,
    short_name: c.shortName,
    description: c.description,
    image: c.image,
    color: c.color,
    sort_order: index,
    is_active: true,
  }));

  const { data, error } = await supabase
    .from('categories')
    .upsert(rows, { onConflict: 'slug' })
    .select('id, slug');

  if (error) {
    console.error('Category migration failed:', error.message);
    process.exit(1);
  }

  const slugToId = new Map<string, string>();
  for (const row of data ?? []) {
    slugToId.set(row.slug, row.id);
  }
  console.log(`  Done. ${slugToId.size} categories upserted.`);
  return slugToId;
}

async function migrateProducts(slugToId: Map<string, string>) {
  console.log(`\nMigrating ${products.length} products...`);

  const seenSlugs = new Set<string>();

  const rows = products.map((p) => {
    const categoryId = slugToId.get(p.category);
    if (!categoryId) {
      console.warn(`  WARNING: product ${p.sku} has unknown category "${p.category}" — category_id will be null`);
    }

    // slug must be unique; base it on legacy id, disambiguate on collision
    let slug = slugify(p.id);
    let suffix = 2;
    while (seenSlugs.has(slug)) {
      slug = `${slugify(p.id)}-${suffix++}`;
    }
    seenSlugs.add(slug);

    return {
      legacy_id: p.id,
      sku: p.sku,
      slug,
      name: p.name,
      price: p.price,
      original_price: p.originalPrice ?? null,
      description: p.description ?? null,
      category_id: categoryId ?? null,
      gender: p.gender ?? null,
      tags: p.tags ?? [],
      use_case: p.useCase ?? [],
      rating: p.rating ?? 0,
      review_count: p.reviewCount ?? 0,
      is_new: !!p.isNew,
      is_sale: !!p.isSale,
      stock: p.stock ?? 0,
      size_prices: p.sizePrices ?? null,
      images: p.images ?? [],
      colors: p.colors ?? [],
      sizes: p.sizes ?? [],
      features: p.features ?? [],
      is_active: true,
    };
  });

  // Insert in batches to stay well under request size limits
  const BATCH_SIZE = 100;
  let migrated = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'sku' });

    if (error) {
      console.error(`  Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
      process.exit(1);
    }
    migrated += batch.length;
    console.log(`  ...${migrated}/${rows.length} products upserted`);
  }

  console.log(`  Done. ${migrated} products upserted.`);
}

async function main() {
  console.log('=== Maish Boutique: products.ts -> Supabase migration ===');
  const slugToId = await migrateCategories();
  await migrateProducts(slugToId);

  console.log('\n=== Verification ===');
  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`categories table: ${catCount} rows`);
  console.log(`products table:   ${prodCount} rows`);
  console.log('\nMigration complete.');
}

main().catch((err) => {
  console.error('Migration failed with an unexpected error:', err);
  process.exit(1);
});
