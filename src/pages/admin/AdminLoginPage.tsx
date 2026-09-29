import { useState, useEffect, FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const { user, loading, isStaff, signIn } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname || '/admin/products';

  useEffect(() => {
    if (!loading && user && !isStaff) {
      setNotAuthorized(true);
    }
  }, [loading, user, isStaff]);

  // Already signed in with the right role — go straight in.
  if (!loading && user && isStaff) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotAuthorized(false);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message || 'Sign in failed');
      setSubmitting(false);
      return;
    }

    // signIn succeeded; AuthContext will asynchronously populate the role.
    // Give it a moment, then let the guard above route appropriately.
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground">Maish Fashion Boutique staff access</p>
        </div>

        {notAuthorized && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
            <span>This account is signed in but does not have admin or staff access.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@maishboutique.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
