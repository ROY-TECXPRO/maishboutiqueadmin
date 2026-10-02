import { supabase } from '@/lib/supabase';
import type { ProductRecord, CategoryRecord } from '@/types';

/**
 * All functions here rely on Postgres RLS (supabase-product-system.sql)
 * to enforce that only profiles.role IN ('admin','staff') can write.
 * A non-staff user calling these will get an RLS-denied error from
 * Supabase, not a silently-succeeding request.
 */

export async function fetchAdminProducts(): Promise<ProductRecord[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchCategories(): Promise<CategoryRecord[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export interface ProductPriceStockUpdate {
  id: string;
  price?: number;
  original_price?: number | null;
  stock?: number;
}

export async function updateProductPriceStock(update: ProductPriceStockUpdate): Promise<void> {
  const { id, ...fields } = update;
  const { error } = await supabase
    .from('products')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function setProductActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

/* ============================================================
 * Full admin CRUD (add / edit / delete)
 * RLS still enforces that only profiles.role IN ('admin','staff')
 * can perform these — a customer calling them gets an RLS error.
 * ============================================================ */

export interface ProductInput {
  name: string;
  sku: string;
  slug: string;
  price: number;
  original_price?: number | null;
  description?: string | null;
  category_id?: string | null;
  gender?: string | null;
  stock?: number;
  is_new?: boolean;
  is_sale?: boolean;
  is_active?: boolean;
  sizes?: string[];
}

/** "Nike Air Zoom" -> "nike-air-zoom" (used to auto-fill the unique slug). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function createProduct(input: ProductInput): Promise<ProductRecord> {
  const { data, error } = await supabase
    .from('products')
    .insert({ ...input, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ProductRecord;
}

export async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) throw new Error(error.message);
}

/**
 * Uploads a product image to the public `maish-product-images` bucket and
 * returns its public URL.
 *
 * RLS on storage.objects only permits this for profiles.role IN
 * ('admin','staff'), so a customer's upload is rejected server-side.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from('maish-product-images').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage.from('maish-product-images').getPublicUrl(path);
  return data.publicUrl;
}

export interface CategoryInput {
  name: string;
  slug: string;
  short_name?: string | null;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export async function createCategory(input: CategoryInput): Promise<CategoryRecord> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ ...input, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CategoryRecord;
}

export async function updateCategory(id: string, patch: Partial<CategoryInput>): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) throw new Error(error.message);
}