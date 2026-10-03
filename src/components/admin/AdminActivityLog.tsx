import { useQuery } from '@tanstack/react-query';
import { History, Loader2, ShieldAlert } from 'lucide-react';
import { fetchAdminActivity, canViewActivityLog, type AdminActivityRecord } from '@/lib/adminActivity';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/** Human-readable label for each audited action. */
const ACTION_LABELS: Record<string, string> = {
  'product.create': 'Added product',
  'product.update': 'Edited product',
  'product.delete': 'Deleted product',
  'product.price_stock_update': 'Changed price / stock',
  'product.activate': 'Made product visible',
  'product.deactivate': 'Hid product',
  'product.out_of_stock': 'Marked out of stock',
  'category.create': 'Added category',
  'category.update': 'Edited category',
  'category.delete': 'Deleted category',
  'session.sign_out': 'Signed out',
  'admin.terms_accepted': 'Accepted terms & conditions',
};

const ACTION_TONES: Record<string, string> = {
  'product.delete': 'border-destructive/40 bg-destructive/10 text-destructive',
  'product.create': 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  'product.price_stock_update': 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
};

function formatDetails(details: Record<string, unknown> | null): string | null {
  if (!details) return null;
  const parts: string[] = [];

  if (typeof details.old_price === 'number' || typeof details.new_price === 'number') {
    parts.push(`price ${details.old_price} → ${details.new_price} KSh`);
  }
  if (typeof details.old_stock === 'number' || typeof details.new_stock === 'number') {
    parts.push(`stock ${details.old_stock} → ${details.new_stock}`);
  }
  if (typeof details.sku === 'string') parts.push(`SKU ${details.sku}`);
  if (typeof details.is_active === 'boolean') {
    parts.push(details.is_active ? 'now visible' : 'now hidden');
  }

  return parts.length ? parts.join(' · ') : null;
}

/**
 * Read-only audit trail of admin actions.
 *
 * Only the main admin may read it. The table is SELECT-protected by RLS, so a
 * second admin would receive zero rows from the API regardless of what the
 * browser asks for; this check simply avoids showing them a dead panel.
 */
export function AdminActivityLog() {
  const { user, isAdmin } = useAuth();
  const isViewer = canViewActivityLog(user?.email);

  const query = useQuery({
    queryKey: ['admin-activity'],
    queryFn: () => fetchAdminActivity(50),
    enabled: isAdmin && isViewer,
  });

  if (!isViewer) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        The activity log is restricted to the main administrator.
      </div>
    );
  }

  const entries: AdminActivityRecord[] = query.data ?? [];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-4 w-4" />
          Activity Log
        </h2>
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          Refresh log
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Every change made in this dashboard is recorded with who did it and when.
      </p>

      {query.isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {query.isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Could not load the activity log.
        </div>
      )}

      {!query.isLoading && !query.isError && entries.length === 0 && (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No activity recorded yet.
        </div>
      )}

      {entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map((entry) => {
            const summary = formatDetails(entry.details);
            return (
              <li
                key={entry.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 rounded-md border p-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={ACTION_TONES[entry.action] ?? 'font-normal'}
                    >
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </Badge>
                    {entry.entity_label && (
                      <span className="font-medium truncate">{entry.entity_label}</span>
                    )}
                  </div>
                  {summary && (
                    <p className="text-xs text-muted-foreground mt-1 break-words">{summary}</p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground sm:text-right shrink-0">
                  <p className="break-all">{entry.admin_email ?? 'Unknown'}</p>
                  <p>{new Date(entry.created_at).toLocaleString()}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default AdminActivityLog;
