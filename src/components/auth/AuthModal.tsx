import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, User, Mail, Lock, Phone, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login', onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const { signIn, signUp } = useAuth();

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
      if (mode === 'login') {
        setEmail('');
        setPassword('');
      } else {
        setEmail('');
        setPassword('');
        setFullName('');
        setPhone('');
      }
    }
  }, [isOpen, mode]);

  const getFirstName = (name: string) => {
    return name.split(' ')[0].trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message || 'Invalid email or password');
        } else {
          setSuccess('Welcome back!');
          onSuccess?.();
          setTimeout(() => {
            onClose();
            resetForm();
          }, 500);
        }
      } else {
        const { error } = await signUp(email, password, fullName, phone);
        if (error) {
          if (error.message.includes('already')) {
            setError('An account with this email already exists. Please sign in instead.');
            setMode('login');
          } else {
            setError(error.message);
          }
        } else {
          const name = getFirstName(fullName);
          setFirstName(name);
          setSuccess(`Welcome ${name}! Your account has been created.`);
          onSuccess?.();
          setTimeout(() => {
            onClose();
            resetForm();
          }, 500);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setError(null);
    setSuccess(null);
    setFirstName('');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            {success ? (
              <CheckCircle className="w-8 h-8 text-success" />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <h2 className="font-display text-2xl font-bold">
            {success ? 'Success!' : mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {success 
              ? success
              : mode === 'login' 
                ? 'Sign in to access your orders and saved items'
                : 'Join Maish Fashion to track your orders and save your preferences'}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {success && firstName && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-3 flex items-start gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <p className="text-success text-sm">
              Your account has been created! You can now checkout faster and track your orders.
            </p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={cn(
                        'w-full h-11 pl-10 pr-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20',
                        error ? 'border-destructive' : 'border-border'
                      )}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={cn(
                        'w-full h-11 pl-10 pr-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20',
                        error ? 'border-destructive' : 'border-border'
                      )}
                      placeholder="07XX XXX XXX"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    'w-full h-11 pl-10 pr-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20',
                    error ? 'border-destructive' : 'border-border'
                  )}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Password {mode === 'login' && '*'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    'w-full h-11 pl-10 pr-10 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20',
                    error ? 'border-destructive' : 'border-border'
                  )}
                  placeholder={mode === 'signup' ? 'Optional - will be created automatically' : '••••••••'}
                  required={mode === 'login'}
                  minLength={mode === 'login' ? 6 : 0}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-muted-foreground mt-1">Leave blank to create account without password</p>
              )}
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        )}

        {!success && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={toggleMode}
                className="ml-2 text-primary hover:underline font-medium"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        )}

        <p className="mt-4 text-xs text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
