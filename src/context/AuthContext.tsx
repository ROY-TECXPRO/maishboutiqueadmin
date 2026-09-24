import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'staff' | 'customer';

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
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: Error | null }>;
  checkEmailExists: (email: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  isStaff: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

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
          const profile = await fetchProfile(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: profile?.full_name || '',
            phone: profile?.phone || '',
            avatarUrl: profile?.avatar_url || '',
            county: profile?.county || '',
            town: profile?.town || '',
            address: profile?.address || '',
            role: (profile?.role as UserRole) || 'customer',
          });
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

      // Defer profile fetch to avoid blocking the auth state callback
      // Use a timeout fallback to guarantee loading is always reset
      const profileFetchTimeout = setTimeout(() => {
        console.warn('Profile fetch timed out, resetting loading state');
        setLoading(false);
      }, 5000);

      setTimeout(async () => {
        try {
          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            if (profile) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                fullName: profile?.full_name || '',
                phone: profile?.phone || '',
                avatarUrl: profile?.avatar_url || '',
                county: profile?.county || '',
                town: profile?.town || '',
                address: profile?.address || '',
                role: (profile?.role as UserRole) || 'customer',
              });
            } else {
              // Profile fetch failed but session exists - set basic user info
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: 'customer',
              });
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
  }, [fetchProfile]);

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

      // Skip profile upsert for now to test if that's causing the delay
      // Profile can be created later when needed
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
        return { error };
      }

      // Successfully authenticated - access_token is set by Supabase
      // The onAuthStateChange listener will update the user context
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

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success('Signed out successfully');
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
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          fullName: profile?.full_name || '',
          phone: profile?.phone || '',
          avatarUrl: profile?.avatar_url || '',
          county: profile?.county || '',
          town: profile?.town || '',
          address: profile?.address || '',
          role: (profile?.role as UserRole) || 'customer',
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  const isStaff = user?.role === 'admin' || user?.role === 'staff';
  const isAdmin = user?.role === 'admin';

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
      isStaff,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
