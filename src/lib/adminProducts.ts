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
