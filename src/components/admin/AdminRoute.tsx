import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Guards admin routes. This is a UX convenience only — it hides the UI
 * from non-staff users so they don't see a page they can't use. The real
 * security boundary is Postgres Row Level Security on the `products` and
 * `categories` tables (see supabase-product-system.sql), which rejects
 * any write from a user whose profiles.role is not 'admin' or 'staff'
 * regardless of what the client sends.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isStaff } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !isStaff) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
