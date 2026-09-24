import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Heart, ShoppingBag, MapPin, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Moon, Sun, Download, Mail, Phone, Edit2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { usePWA } from '@/hooks/use-pwa';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AuthModal } from '@/components/auth/AuthModal';
import { toast } from 'sonner';

const AccountPage: React.FC = () => {
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const { user, signOut, updateProfile, refreshUser, loading } = useAuth();
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    county: '',
    town: '',
    address: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        county: user.county || '',
        town: user.town || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignIn = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setEditForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      county: user?.county || '',
      town: user?.town || '',
      address: user?.address || '',
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile({
        fullName: editForm.fullName,
        phone: editForm.phone,
        county: editForm.county,
        town: editForm.town,
        address: editForm.address,
      });
      
      if (error) {
        toast.error('Failed to update profile');
      } else {
        // Refresh user data from Supabase
        await refreshUser();
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      county: user?.county || '',
      town: user?.town || '',
      address: user?.address || '',
    });
    setIsEditing(false);
  };

  const menuItems = [
    {
      title: 'My Orders',
      icon: ShoppingBag,
      href: '/orders',
      badge: itemCount > 0 ? 'Cart: ' + itemCount : undefined,
    },
    {
      title: 'Wishlist',
      icon: Heart,
      href: '/wishlist',
      badge: wishlistItems.length > 0 ? wishlistItems.length.toString() : undefined,
    },
    {
      title: 'Saved Addresses',
      icon: MapPin,
      href: '/addresses',
    },
    {
      title: 'Payment Methods',
      icon: CreditCard,
      href: '/payments',
    },
    {
      title: 'Notifications',
      icon: Bell,
      href: '/notifications',
    },
    {
      title: 'Help & Support',
      icon: HelpCircle,
      href: '/help',
    },
  ];

  return (
    <div className="page-transition min-h-screen pb-8">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultMode={authMode}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName || 'User'} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div className="flex-1">
              {user ? (
                <>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20"
                        placeholder="Full Name"
                      />
                    </div>
                  ) : (
                    <h1 className="font-display text-xl font-bold">
                      {user.fullName || 'User'}
                    </h1>
                  )}
                  <div className="space-y-1 mt-1">
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {user.email}
                    </p>
                    {user.phone && (
                      <p className="text-muted-foreground text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {user.phone}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <h1 className="font-display text-xl font-bold">Guest User</h1>
              )}
            </div>
            {user && (
              <button
                onClick={isEditing ? handleCancelEdit : handleEditClick}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label={isEditing ? 'Cancel edit' : 'Edit profile'}
              >
                {isEditing ? <X className="w-5 h-5 text-muted-foreground" /> : <Edit2 className="w-5 h-5 text-muted-foreground" />}
              </button>
            )}
          </div>

          {/* Profile Details (Edit Mode) */}
          {user && isEditing && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">County</label>
                  <input
                    type="text"
                    value={editForm.county}
                    onChange={(e) => setEditForm({ ...editForm, county: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20"
                    placeholder="County"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Town</label>
                  <input
                    type="text"
                    value={editForm.town}
                    onChange={(e) => setEditForm({ ...editForm, town: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20"
                    placeholder="Town"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20"
                    placeholder="Address"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-1" /> Save Changes
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Profile Details (View Mode) */}
          {user && !isEditing && (user.county || user.town || user.address) && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Saved Details</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {user.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {user.phone}</p>}
                {user.county && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {user.county}{user.town && `, ${user.town}`}</p>}
                {user.address && <p className="text-xs">{user.address}</p>}
              </div>
            </div>
          )}

          {/* Sign In / Create Account Buttons - Always show when no user (ignore loading) */}
          {!user && (
            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button className="flex-1" onClick={handleSignUp}>
                Create Account
              </Button>
            </div>
          )}

          {/* Sign Out Button - Show when user is logged in */}
          {user && (
            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </motion.div>

        {/* Install App Banner */}
        {isInstallable && !isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl p-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Install the App</h3>
                <p className="text-sm text-white/80 mt-1">
                  Get faster access, offline mode, and push notifications
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3 bg-white text-primary hover:bg-white/90"
                  onClick={installApp}
                >
                  Install Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: 'Cart', value: itemCount, icon: ShoppingBag, href: '/cart' },
            { label: 'Wishlist', value: wishlistItems.length, icon: Heart, href: '/wishlist' },
            { label: 'Orders', value: 0, icon: ShoppingBag, href: '/orders' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link
                to={stat.href}
                className="block text-center p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors"
              >
                <stat.icon className="w-6 h-6 mx-auto text-primary mb-2" />
                <p className="font-bold text-xl">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="mt-6 space-y-2">
          {menuItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Link
                to={item.href}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Dark Mode Toggle */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              {isDark ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
              <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className={cn(
              'w-12 h-6 rounded-full p-1 transition-colors',
              isDark ? 'bg-primary' : 'bg-muted'
            )}>
              <div className={cn(
                'w-4 h-4 rounded-full bg-white transition-transform',
                isDark && 'translate-x-6'
              )} />
            </div>
          </motion.button>
        </div>

        {/* App Info */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Maish Fashion Boutique</p>
          <p className="mt-1">Version 1.0.0</p>
          <div className="flex justify-center gap-4 mt-3">
            <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
