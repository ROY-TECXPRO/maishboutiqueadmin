import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid3X3, Search, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      'flex flex-col items-center justify-center gap-1 py-2 px-3 relative touch-target transition-colors',
      isActive ? 'text-primary' : 'text-muted-foreground'
    )}
  >
    {({ isActive }) => (
      <>
        <div className="relative">
          <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
          {badge !== undefined && badge > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {badge > 9 ? '9+' : badge}
            </motion.span>
          )}
        </div>
        <span className="text-[10px] font-medium">{label}</span>
        {isActive && (
          <motion.div
            layoutId="bottomNavIndicator"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
          />
        )}
      </>
    )}
  </NavLink>
);

export const BottomNav: React.FC = () => {
  const { itemCount } = useCart();

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <NavItem to="/" icon={Home} label="Home" />
        <NavItem to="/categories" icon={Grid3X3} label="Categories" />
        <NavItem to="/search" icon={Search} label="Search" />
        <NavItem to="/cart" icon={ShoppingBag} label="Cart" badge={itemCount} />
        <NavItem to="/account" icon={User} label="Account" />
      </div>
    </nav>
  );
};
