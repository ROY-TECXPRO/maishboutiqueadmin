import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useIdleSignOut } from '@/hooks/useIdleSignOut';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'staff' | 'customer';

interface ProfileRow {
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  county?: string | null;
  town?: string | null;
  address?: string | null;
  role?: string | null;
}

interface SessionUser {
  id: string;
  email?: string | null;
}

interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  county?: string;
  town?: string;
  address?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: (options?: { reason?: 'manual' | 'idle' }) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: Error | null }>;
  checkEmailExists: (email: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: Error | null }>;
  isStaff: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string): Promise<ProfileRow | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, avatar_url, county, town, address, role')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      return (data as ProfileRow) ?? null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Retrying wrapper around fetchProfile.
   *
   * Immediately after SIGNED_IN the Supabase client can send the PostgREST
   * request before the access token is attached. That request then runs as
   * `anon`, RLS `auth.uid() = id` matches zero rows, and `.single()` reports
   * PGRST116 — indistinguishable from "this user has no profile row".
   *
   * Without a retry the caller falls back to role 'customer', so an admin who
   * is correctly marked role='admin' in the database still gets treated as a
   * normal shopper until they hard-refresh the page. Retrying with a short
   * backoff makes role resolution reliable.
   */
  const fetchProfileWithRetry = useCallback(
    async (userId: string, attempts = 5): Promise<ProfileRow | null> => {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const profile = await fetchProfile(userId);
        if (profile) return profile;
        if (attempt < attempts - 1) await sleep(200 * (attempt + 1));
      }

      console.error(
        `Could not load a public.profiles row for user ${userId} after ${attempts} attempts. ` +
        'This account will be treated as a customer. Check in the Supabase SQL Editor that a ' +
        'row exists in public.profiles whose id equals this user\'s auth.users.id (and that ' +
        'profiles.role is set to \'admin\' or \'staff\' if it should have access).'
      );
      return null;
    },
    [fetchProfile]
  );

  // Build the app User from a session + fetched profile. The role comes
  // exclusively from public.profiles.role — never from the JWT's database
  // role claim. When a profile row exists we trust its role value as-is and
  // do not overwrite it with a default; only fall back to 'customer' when
  // there is no profile row at all.
  //
  // The value is normalised (trim + lowercase) because a role stored as
  // 'Admin' or ' admin' in the dashboard would otherwise fail every exact
  // `=== 'admin'` comparison and silently demote a real administrator.
  const buildUser = (session: { user: SessionUser }, profile: ProfileRow | null): User => ({
    id: session.user.id,
    email: session.user.email || '',
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    avatarUrl: profile?.avatar_url || '',
    county: profile?.county || '',
    town: profile?.town || '',
    address: profile?.address || '',
    role: (profile?.role?.trim().toLowerCase() as UserRole) || 'customer',
  });

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      // Set a timeout to ensure loading becomes false even if Supabase hangs
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 3000); // 3 second timeout

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await fetchProfileWithRetry(session.user.id);
          setUser(buildUser(session, profile));
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes (must be synchronous per Supabase docs to avoid deadlock)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Set loading state immediately and synchronously
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setLoading(true);
      }

      // DIAGNOSTIC (safe to remove): lets you confirm in the browser console
      // exactly what the app resolved for this account — useful when an
      // administrator keeps being treated as a customer.
      if (event === 'SIGNED_IN' && session?.user) {
        console.info('[auth] signed in as', session.user.email);
      }

      // Defer profile fetch to avoid blocking the auth state callback
      // Use a timeout fallback to guarantee loading is always reset
      const profileFetchTimeout = setTimeout(() => {
        console.warn('Profile fetch timed out, resetting loading state');
        setLoading(false);
      }, 5000);

      setTimeout(async () => {
        try {
          if (session?.user) {
            const profile = await fetchProfileWithRetry(session.user.id);
            if (profile) {
              setUser(buildUser(session, profile));
            } else {
              // Do NOT clobber an already-resolved role. Previously this branch
              // hard-coded role: 'customer', which silently downgraded a real
              // admin whenever the profile read lost the token race.
              console.warn(
                '[auth] no public.profiles row resolved for', session.user.email,
                '- falling back to role "customer". Run supabase/verify-admin-access.sql.'
              );
              setUser((previous) =>
                previous && previous.id === session.user.id
                  ? previous
                  : {
                      id: session.user.id,
                      email: session.user.email || '',
                      role: 'customer',
                    }
              );
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          clearTimeout(profileFetchTimeout);
          setLoading(false);
        }
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchProfileWithRetry]);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    // Generate a random password if not provided (for easy signup)
    const finalPassword = password || `Maish${Date.now()}${Math.random().toString(36).slice(2)}!`;

    try {
      // Create auth user - Supabase will automatically trigger onAuthStateChange
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: finalPassword,
        options: {
          data: {
            full_name: fullName,
            phone,
          },
        },
      });

      if (error) {
        // Check for timeout/network errors
        if (error.message.includes('timed out') || error.message.includes('network') || error.message.includes('fetch')) {
          return { error: new Error('Connection timed out. Please check your internet connection and try again.') };
        }
        return { error };
      }

      // The profiles row is created automatically by the on_auth_user_created
      // trigger (see supabase-master-schema.sql) — no manual insert needed here.
      console.log('Signup successful, user ID:', data.user?.id);

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      const err = error as Error;
      if (err.message.includes('timed out') || err.message.includes('network') || err.name === 'AbortError') {
        return { error: new Error('Connection timed out. Please check your internet connection and try again.') };
      }
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        // Check for timeout/network errors
        if (error.message.includes('timed out') || error.message.includes('network') || error.message.includes('fetch')) {
          return { error: new Error('Connection timed out. Please check your internet connection and try again.') };
        }
        // Handle email not confirmed - guide user to resend confirmation
        if (error.message.toLowerCase().includes('email not confirmed') || error.message.toLowerCase().includes('email_confirm')) {
          return { error: new Error('Email not confirmed. Please check your inbox for the confirmation link, or request a new one.') };
        }
        return { error };
      }

      // Successfully authenticated. Resolve the profile (and therefore the
      // role) HERE, authoritatively. Previously this returned immediately and
      // relied solely on the onAuthStateChange listener, which races the
      // access-token attach and could downgrade an admin to 'customer'.
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchProfileWithRetry(session.user.id);
        if (profile) {
          setUser(buildUser(session, profile));
          console.info('[auth] resolved role:', profile.role, 'for', session.user.email);
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: 'customer',
          });
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error during token storage phase:', error);
      const err = error as Error;
      if (err.message.includes('timed out') || err.message.includes('network') || err.name === 'AbortError') {
        return { error: new Error('Connection timed out. Please check your internet connection and try again.') };
      }
      return { error: err };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.toLowerCase(),
      });

      if (error) {
        if (error.message.includes('timed out') || error.message.includes('network') || error.message.includes('fetch')) {
          return { error: new Error('Connection timed out. Please check your internet connection and try again.') };
        }
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      const err = error as Error;
      if (err.message.includes('timed out') || err.message.includes('network') || err.name === 'AbortError') {
        return { error: new Error('Connection timed out. Please check your internet connection and try again.') };
      }
      return { error: err };
    }
  };

  const signOut = async (options?: { reason?: 'manual' | 'idle' }) => {
    try {
      await supabase.auth.signOut();
      setUser(null);

      if (options?.reason === 'idle') {
        toast.info('You were signed out after 5 minutes of inactivity. Please sign in again.');
      } else {
        toast.success('Signed out successfully');
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      const error = new Error('No user logged in');
      toast.error(error.message);
      return { error };
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone: data.phone,
          county: data.county,
          town: data.town,
          address: data.address,
          avatar_url: data.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        toast.error(updateError.message);
        return { error: updateError };
      }

      // Refresh user data
      await refreshUser();

      return { error: null };
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
      return { error };
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(buildUser(session, profile));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  // Same normalisation as buildUser, applied to the exact-match staff check so
  // a stored 'Admin'/' admin' still grants access.
  const normalisedRole = user?.role?.trim().toLowerCase();
  const isStaff = normalisedRole === 'admin' || normalisedRole === 'staff';
  const isAdmin = normalisedRole === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      checkEmailExists,
      refreshUser,
      resendConfirmation,
      isStaff,
      isAdmin,
    }}>
      {/* Signs the user out after 5 minutes of inactivity. Must live inside
          the provider so it can call useAuth(). */}
      <IdleSignOutGate enabled={!!user}>{children}</IdleSignOutGate>
    </AuthContext.Provider>
  );
};

/** Runs the idle timer for as long as somebody is signed in. */
const IdleSignOutGate = ({ enabled, children }: { enabled: boolean; children: ReactNode }) => {
  useIdleSignOut(enabled);
  return <>{children}</>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};