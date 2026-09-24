import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, User, Sun, Moon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { categories } from '@/data/products';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const WORLD_CUP_FINAL_DEADLINE = Date.UTC(2026, 6, 19, 23, 59, 59);

// Move Intl.DateTimeFormat instantiation outside the function to reuse the formatter instance
const nairobiFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Nairobi',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const getNairobiTimestamp = () => {
  const now = new Date();
  const parts = nairobiFormatter.formatToParts(now);
  const values: Record<string, string> = {};
  parts.forEach(({ type, value }) => {
    values[type] = value;
  });

  return Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
};

export const DesktopHeader: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  // Compute once per render — the formatter is now a module-level constant
  const nowTs = getNairobiTimestamp();
  const showWorldCupBadge = nowTs < WORLD_CUP_FINAL_DEADLINE;
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      {/* Promo Banner */}
      <div className="promo-banner hidden md:block">
        <p>🎉 Weekend Flash Sale: Use code <strong>332211</strong> for 15% off - Friday, Saturday & Sunday only!</p>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20 relative">
            {/* Mobile Menu Button - Absolute positioned on mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden touch-target flex items-center justify-center absolute left-0 z-10"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo - Centered on mobile */}
            <Link to="/" className="flex items-center gap-2 md:justify-start justify-center flex-1 md:flex-none absolute left-1/2 md:relative md:left-0 transform md:transform-none -translate-x-1/2 md:translate-x-0">
              {/* Dark mode logo - shows when isDark is true */}
              <img 
                src="/maish-logo-dark-mode.webp" 
                alt="Maish Fashion Boutique" 
                className={`h-10 w-auto md:h-12 object-contain ${isDark ? 'block' : 'hidden'} dark:block`}
              />
              {/* Light mode logo - shows when isDark is false */}
              <img 
                src="/Maish-logo-light-mode.webp" 
                alt="Maish Fashion Boutique" 
                className={`h-10 w-auto md:h-12 object-contain ${isDark ? 'hidden' : 'block'} dark:hidden`}
              />
              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-lg md:text-xl leading-tight">Maish Fashion</h1>
                <p className="text-[10px] text-muted-foreground -mt-0.5">Boutique</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                className={({ isActive }) => cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
              >
                Home
              </NavLink>

              {showWorldCupBadge && (
                <Link
                  to="/sale"
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105"
                >
                  <span className="animate-pulse">⚽</span>
                  World Cup Sale <span className="hidden sm:inline">(Weekend)</span>
                </Link>
              )}

              <div
                className="relative"
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
              >
                <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted flex items-center gap-1">
                  Categories <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showCategories && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 w-[600px] bg-card rounded-xl shadow-card-hover border border-border p-6 mt-2"
                    >
                      <div className="grid grid-cols-3 gap-4">
                        {categories.slice(0, 9).map(cat => (
                          <Link
                            key={cat.id}
                            to={`/category/${cat.id}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => setShowCategories(false)}
                          >
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-sm">{cat.shortName}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <Link
                        to="/categories"
                        className="block text-center text-sm text-primary font-medium mt-4 hover:underline"
                        onClick={() => setShowCategories(false)}
                      >
                        View All Categories →
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink
                to="/sale"
                className={({ isActive }) => cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-sale text-white' : 'text-sale hover:bg-sale/10'
                )}
              >
                Sale 🔥
              </NavLink>

              <NavLink
                to="/new-arrivals"
                className={({ isActive }) => cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
              >
                New Arrivals
              </NavLink>

              <NavLink
                to="/location"
                className={({ isActive }) => cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
              >
                Location 📍
              </NavLink>
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="search-input"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      navigate(`/search?q=${encodeURIComponent(value)}`);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value;
                      if (value.trim()) {
                        navigate(`/search?q=${encodeURIComponent(value.trim())}`);
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Actions - Properly spaced on mobile */}
            <div className="flex items-center gap-0.5 md:gap-1 absolute right-0 md:relative">
              <button
                onClick={() => navigate('/search')}
                className="lg:hidden touch-target flex items-center justify-center hover:bg-muted rounded-lg p-2"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={toggleTheme}
                className="hidden md:flex touch-target items-center justify-center hover:bg-muted rounded-lg p-2"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <Link
                to="/wishlist"
                className="hidden md:flex touch-target items-center justify-center hover:bg-muted rounded-lg relative p-2"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="touch-target flex items-center justify-center hover:bg-muted rounded-lg relative p-2"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </Link>

              <Link
                to="/account"
                className="hidden md:flex touch-target items-center justify-center hover:bg-muted rounded-lg p-2"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-x-0 top-16 bg-background border-b border-border z-40 md:hidden overflow-hidden"
          >
            <div className="container px-4 py-4 max-h-[70vh] overflow-y-auto">
              <nav className="space-y-1">
                 {showWorldCupBadge && (
                   <Link
                     to="/sale"
                     className="flex items-center justify-between rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20"
                     onClick={() => setIsMenuOpen(false)}
                   >
                     <span>⚽ World Cup Sale</span>
                     <span className="text-xs opacity-90">(Weekend)</span>
                   </Link>
                 )}
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                  </Link>
                ))}
              </nav>

              <div className="border-t border-border mt-4 pt-4 space-y-2">
                <Link
                  to="/sale"
                  className="flex items-center gap-3 p-3 rounded-lg bg-sale/10 text-sale font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🔥 Weekend Sale - Up to 40% Off
                </Link>
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted w-full"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
