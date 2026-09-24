import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OfferBannerProps {
  onClose?: () => void;
}

const OfferBanner: React.FC<OfferBannerProps> = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="offer-banner relative bg-gradient-to-r from-[#C32222] to-[#A61D1D] text-white overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {/* Offer Image */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl md:text-3xl">🏷️</span>
              </div>
            </div>

            {/* Offer Text */}
            <div className="text-center">
              <p className="font-bold text-sm md:text-base">
                <span className="mr-2">🔥 WEEKEND FLASH SALE 🔥</span>
                <span className="hidden md:inline">15% OFF Everything!</span>
                <span className="md:hidden">15% OFF!</span>
              </p>
              <p className="text-xs md:text-sm opacity-90">
                Use code: <span className="font-bold bg-white/20 px-2 py-0.5 rounded">332211</span>
                <span className="ml-2 text-xs">(Fri-Sun)</span>
              </p>
            </div>

            {/* CTA Button */}
            <Link
              to="/sale"
              className="hidden sm:inline-flex items-center px-4 py-2 bg-white text-[#C32222] rounded-full font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              Shop Now
            </Link>
          </div>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Close offer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile CTA */}
        <Link
          to="/sale"
          className="sm:hidden block text-center py-2 bg-white/10 hover:bg-white/20 transition-colors font-medium text-sm"
        >
          Shop Now & Save 15% →
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfferBanner;
