import { supabase } from '@/lib/supabase';

/**
 * Audit trail for the admin dashboard.
 *
 * Every action an admin or staff member takes (add, edit, delete, price or
 * stock change, activate/deactivate, sign out, …) is written to
 * public.admin_activity_log so there is a permanent record of who changed
 * what and when.
 *
 * RLS on the table allows INSERT for any staff member but restricts SELECT to
 * admins, so staff can record activity without being able to read everyone
 * else's history.
 *
 * Logging is deliberately fire-and-forget: a failure here must never block or
 * fail the actual admin operation the user asked for.
 */

export type AdminAction =
  | 'product.create'
  | 'product.update'
  | 'product.delete'
  | 'product.price_stock_update'
  | 'product.activate'
  | 'product.deactivate'
  | 'product.out_of_stock'
  | 'category.create'
  | 'category.update'
  | 'category.delete'
  | 'session.sign_out'
  | 'admin.terms_accepted';

export interface AdminLogEntry {
  action: AdminAction;
  entityType?: 'product' | 'category' | 'session';
  entityId?: string | null;
  entityLabel?: string | null;
  details?: Record<string, unknown>;
}

export interface AdminActivityRecord {
  id: string;
  admin_id: string | null;
  admin_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_label: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

/** Records one admin action. Resolves even if the insert fails. */
export async function logAdminActivity(entry: AdminLogEntry): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('admin_activity_log').insert({
      admin_id: user.id,
      admin_email: user.email ?? null,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      entity_label: entry.entityLabel ?? null,
      details: (entry.details ?? {}) as Record<string, unknown>,
    });

    if (error) {
      // Never surface this to the user — it must not interrupt their work.
      console.warn('[admin-audit] could not record activity:', error.message);
    }
  } catch (error) {
    console.warn('[admin-audit] could not record activity:', error);
  }
}

/**
 * The main admin, who alone may read the activity log.
 *
 * RLS on `admin_activity_log` is the real boundary — a second admin
 * signing in still gets zero rows from the API, whatever the browser
 * sends. This list only exists so the UI can hide the tab instead of
 * showing an admin a panel they are not allowed to open.
 */
export const ACTIVITY_LOG_VIEWER_EMAIL = 'roysanga127@gmail.com';

/** True only for the main admin's account. */
export function canViewActivityLog(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ACTIVITY_LOG_VIEWER_EMAIL;
}

/** Reads the most recent activity. Owner only (enforced by RLS). */
export async function fetchAdminActivity(limit = 50): Promise<AdminActivityRecord[]> {
  const { data, error } = await supabase
    .from('admin_activity_log')
    .select('id, admin_id, admin_email, action, entity_type, entity_id, entity_label, details, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminActivityRecord[];
}
