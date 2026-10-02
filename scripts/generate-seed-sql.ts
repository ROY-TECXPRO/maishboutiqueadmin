/**
 * Generates INSERT statements that load the real catalogue
 * (src/data/products.ts) into the Supabase `categories` + `products` tables.
 *
 * Why: the storefront reads from those tables. Loading the real catalogue
 * means every product keeps its images AND admin edits stay visible.
 *
 * USAGE:  npm run seed:generate
 *
 * SAFE TO RE-RUN: categories upsert on `slug`, products upsert on `sku`.
 */

import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { categories, products } from '../src/data/products';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'supabase', 'seed-batches');
const BATCH_SIZE = 40;

/** Escapes a value for use inside a single-quoted SQL literal. */
function lit(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return json(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** text[] column, e.g. tags / use_case / sizes / features. */
function arr(value: unknown[] | null | undefined): string {
  if (!value || value.length === 0) return `'{}'::text[]`;
  return `ARRAY[${value.map((v) => lit(v)).join(', ')}]::text[]`;
}

/** jsonb column, e.g. images / colors / size_prices (these hold objects). */
function json(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const UPSERT_PRODUCT = `on conflict (sku) do update set
  name = excluded.name,
  price = excluded.price,
  original_price = excluded.original_price,
  description = excluded.description,
  gender = excluded.gender,
  category_id = excluded.category_id,
  tags = excluded.tags,
  use_case = excluded.use_case,
  rating = excluded.rating,
  review_count = excluded.review_count,
  is_new = excluded.is_new,
  is_sale = excluded.is_sale,
  stock = excluded.stock,
  size_prices = excluded.size_prices,
  images = excluded.images,
  colors = excluded.colors,
  sizes = excluded.sizes,
  features = excluded.features,
  is_active = excluded.is_active;`;

function main() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  // ---- Categories -------------------------------------------------------
  const catRows = categories.map((c, index) => {
    const vals = [
      lit(c.id), lit(c.name), lit(c.shortName ?? c.name), lit(c.description ?? null),
      lit(c.image ?? null), lit(c.color ?? null), lit(index), lit(true),
    ];
    return `(${vals.join(', ')})`;
  });

  writeFileSync(
    join(OUT_DIR, '000-categories.sql'),
    `-- categories (${categories.length})
insert into public.categories (slug, name, short_name, description, image, color, sort_order, is_active)
values
${catRows.join(',\n')}
on conflict (slug) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  description = excluded.description,
  image = excluded.image,
  color = excluded.color,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
`,
    'utf8'
  );

  // ---- Products ---------------------------------------------------------
  const seenSlugs = new Set<string>();
  const rows = products.map((p) => {
    let slug = slugify(p.id);
    let suffix = 2;
    while (seenSlugs.has(slug)) slug = `${slugify(p.id)}-${suffix++}`;
    seenSlugs.add(slug);

    const vals = [
      lit(p.id), lit(p.sku), lit(slug), lit(p.name), lit(p.price),
      lit(p.originalPrice ?? null), lit(p.description ?? null), lit(p.gender ?? null),
      // p.category is already the category slug used by categories.id
      `(select id from public.categories where slug = ${lit(p.category)})`,
      arr(p.tags), arr(p.useCase), lit(p.rating ?? 0), lit(p.reviewCount ?? 0),
      lit(!!p.isNew), lit(!!p.isSale), lit(p.stock ?? 0), json(p.sizePrices ?? null),
      json(p.images ?? []), json(p.colors ?? []), arr(p.sizes), arr(p.features),
      lit(true),
    ];
    return { vals: `  (${vals.join(', ')})`, sku: p.sku };
  });

  const PRODUCT_COLS = [
    'legacy_id', 'sku', 'slug', 'name', 'price', 'original_price', 'description',
    'gender', 'category_id', 'tags', 'use_case', 'rating', 'review_count',
    'is_new', 'is_sale', 'stock', 'size_prices', 'images', 'colors', 'sizes',
    'features', 'is_active',
  ].join(', ');

  let file = 1;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    writeFileSync(
      join(OUT_DIR, `${String(file).padStart(3, '0')}-products.sql`),
      `-- products batch ${file}
insert into public.products (${PRODUCT_COLS})
values
${batch.map((b) => b.vals).join(',\n')}
${UPSERT_PRODUCT}
`,
      'utf8'
    );
    file++;
  }

  console.log(`categories: ${categories.length} -> 000-categories.sql`);
  console.log(`products:   ${products.length} -> ${file - 1} batch file(s) of ${BATCH_SIZE}`);
}

main();
