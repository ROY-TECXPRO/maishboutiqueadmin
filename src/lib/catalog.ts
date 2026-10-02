import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  products as staticProducts,
  categories as staticCategories,
} from '@/data/products';
import type {
  Product,
  Category,
  CategoryInfo,
  Gender,
  Size,
  UseCase,
} from '@/types';

/**
 * Catalog layer.
 *
 * The storefront used to read ONLY from the static src/data/products.ts file,
 * which meant anything written through the admin dashboard (which writes to
 * the `products` table) never appeared on the website.
 *
 * This module reads from Supabase first and falls back to the static bundle
 * when the table is empty or unreachable — so the site keeps rendering even
 * if the database is down or not yet seeded.
 */

export interface CatalogResult {
  products: Product[];
  categories: CategoryInfo[];
  /** True when the data came from the database rather than the static fallback. */
  source: 'supabase' | 'static';
}

interface DbProductRow {
  id: string;
  legacy_id?: string | null;
  sku: string;
  slug: string;
  name: string;
  price: number;
  original_price?: number | null;
  description?: string | null;
  category_id?: string | null;
  gender?: string | null;
  tags?: string[] | null;
  use_case?: string[] | null;
  rating?: number | null;
  review_count?: number | null;
  is_new?: boolean | null;
  is_sale?: boolean | null;
  stock?: number | null;
  size_prices?: Record<string, number> | null;
  images?: Array<{ src: string; alt: string }> | null;
  colors?: Array<{ name: string; hex: string; available: boolean }> | null;
  sizes?: string[] | null;
  features?: string[] | null;
  is_active?: boolean | null;
}

interface DbCategoryRow {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  description?: string | null;
  image?: string | null;
  color?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
}

function mapCategory(row: DbCategoryRow, index: number): CategoryInfo {
  return {
    id: row.slug as Category,
    name: row.name,
    shortName: row.short_name ?? row.name,
    description: row.description ?? '',
    image: row.image ?? '',
    color: row.color ?? '#666666',
    sortOrder: index,
    _dbId: row.id,
  } as CategoryInfo;
}

/** Convert a database row into the storefront's `Product` shape. */
function mapProduct(row: DbProductRow, categoryName: string | undefined): Product {
  const active = row.is_active !== false;
  if (!active) {
    // `Product` has no is_active flag; inactive products are filtered out
    // by the caller instead of being mapped.
  }

  return {
    // The static bundle uses legacy ids in the URL; keep those when present so
    // old links keep working. New admin-created products fall back to the
    // database uuid.
    id: row.legacy_id || row.id,
    name: row.name,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    images: (row.images ?? []).length
      ? (row.images as Array<{ src: string; alt: string }>)
      : [{ src: '/placeholder.svg', alt: row.name }],
    category: (categoryName ?? 'accessories') as Category,
    gender: (row.gender ?? undefined) as Gender | undefined,
    sizes: (row.sizes ?? []) as Size[],
    colors: (row.colors ?? []).map((c) => ({
      name: c.name,
      hex: c.hex,
      available: c.available !== false,
    })),
    tags: row.tags ?? [],
    useCase: (row.use_case ?? []) as UseCase[],
    description: row.description ?? undefined,
    features: row.features ?? [],
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    isNew: !!row.is_new,
    isSale: !!row.is_sale,
    stock: row.stock ?? 0,
    sku: row.sku,
    sizePrices: row.size_prices ?? undefined,
  };
}

export async function fetchCatalog(): Promise<CatalogResult> {
  try {
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    ]);

    if (prodRes.error) throw prodRes.error;

    const dbCategories = (catRes.data ?? []) as DbCategoryRow[];
    const dbProducts = (prodRes.data ?? []) as DbProductRow[];

    // Nothing seeded yet — keep the site alive with the static bundle.
    if (dbProducts.length === 0) {
      return { products: staticProducts, categories: staticCategories, source: 'static' };
    }

    const categoryNameById = new Map<string, string>();
    const categoryById = new Map<string, string>();
    dbCategories.forEach((c) => {
      categoryNameById.set(c.id, c.slug);
      categoryById.set(c.id, c.slug);
    });

    // Preserve the static ordering of categories so the nav looks unchanged.
    const orderedCategories: CategoryInfo[] = dbCategories.length
      ? dbCategories
          .filter((c) => c.is_active !== false)
          .map((c, i) => mapCategory(c, i))
      : staticCategories;

    const products = dbProducts
      .filter((p) => p.is_active !== false)
      .map((p) =>
        mapProduct(p, p.category_id ? categoryNameById.get(p.category_id) : undefined)
      );

    return { products, categories: orderedCategories, source: 'supabase' };
  } catch (error) {
    console.warn('[catalog] Supabase read failed, using static fallback:', error);
    return { products: staticProducts, categories: staticCategories, source: 'static' };
  }
}

/* ------------------------------------------------------------------
 * Selectors mirroring the static data helpers, so pages can switch
 * over with minimal changes.
 * ------------------------------------------------------------------ */

export function selectByCategory(all: Product[], category: Category): Product[] {
  return all.filter((p) => p.category === category);
}

export function selectNewArrivals(all: Product[], limit = 8): Product[] {
  const flagged = all.filter((p) => p.isNew);
  const pool = flagged.length ? flagged : all;
  return [...pool].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export function selectSaleProducts(all: Product[], limit = 12): Product[] {
  const flagged = all.filter((p) => p.isSale || (p.originalPrice ?? 0) > p.price);
  const pool = flagged.length ? flagged : all;
  return [...pool].slice(0, limit);
}

export function searchCatalog(all: Product[], query: string): Product[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.tags.some((t) => t.toLowerCase().includes(term))
  );
}

/** Resolves both legacy static ids and database uuids. */
export function findById(all: Product[], id: string): Product | undefined {
  return all.find((p) => p.id === id || p.sku === id);
}

/* ------------------------------------------------------------------
 * React Query hook — the single entry point for storefront pages.
 * ------------------------------------------------------------------ */

export const CATALOG_QUERY_KEY = ['catalog'] as const;

export function useCatalog() {
  const query = useQuery({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: fetchCatalog,
    staleTime: 30_000,
  });

  return {
    products: query.data?.products ?? staticProducts,
    categories: query.data?.categories ?? staticCategories,
    source: query.data?.source ?? 'static',
    isLoading: query.isLoading,
    isError: query.isError,
    /** Re-reads the database — wired to the admin Refresh button. */
    refetch: query.refetch,
  };
}

/** Drops the cached catalog so every open tab re-reads from Supabase. */
export function useInvalidateCatalog() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
}

