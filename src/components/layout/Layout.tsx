import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DesktopHeader } from '@/components/navigation/DesktopHeader';
import { BottomNav } from '@/components/navigation/BottomNav';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { Footer } from '@/components/layout/Footer';
import OfferBanner from '@/components/ui/OfferBanner';
import { useCart } from '@/context/CartContext';

export const Layout: React.FC = () => {
  const location = useLocation();
  const { itemCount } = useCart();

  // Show promo code only when 2+ items in cart and it's weekend (Kenya timezone)
  const now = new Date();
  const kenyaTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const day = kenyaTime.getDay();
  const isWeekend = day === 5 || day === 6 || day === 0;
  const showPromoCode = itemCount >= 2 && isWeekend;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showPromoCode && <OfferBanner />}
      <DesktopHeader />
      
      <main className="flex-1 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <BottomNav />
      <InstallPrompt />
    </div>
  );
};
