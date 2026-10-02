import { ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  className?: string;
  /**
   * Render the long form — "Logged in as Admin" — instead of the short badge.
   * Use this wherever the role needs to be unambiguous.
   */
  verbose?: boolean;
}

/**
 * Shows the role the app actually resolved for the signed-in account.
 *
 * The value comes from AuthContext.isAdmin / isStaff, which are derived from
 * public.profiles.role — the same source of truth Postgres RLS uses to decide
 * whether writes are allowed. So if this badge says "Admin", admin writes will
 * genuinely be permitted by the database.
 */
export function RoleBadge({ className, verbose = false }: RoleBadgeProps) {
  const { user, isAdmin, isStaff } = useAuth();

  if (!user) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
        <UserIcon className="h-3.5 w-3.5" />
        Not signed in
      </span>
    );
  }

  const label = isAdmin ? 'Admin' : isStaff ? 'Staff' : 'User';
  const Icon = isStaff ? ShieldCheck : UserIcon;

  const tone = isAdmin
    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    : isStaff
      ? 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400'
      : 'border-border bg-muted text-muted-foreground';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        tone,
        className
      )}
      title={verbose ? undefined : `Logged in as ${label}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {verbose ? `Logged in as ${label}` : label}
    </span>
  );
}

export default RoleBadge;