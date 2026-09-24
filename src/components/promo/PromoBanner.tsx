import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromoBannerProps {
  title: string;
  subtitle: string;
  code?: string;
  bgColor?: string;
  link?: string;
  countdown?: boolean;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  title,
  subtitle,
  code,
  bgColor = 'from-primary to-accent',
  link = '/sale',
  countdown = false,
}) => {
  // Simple countdown logic (UI only)
  const [timeLeft, setTimeLeft] = React.useState({
    hours: 23,
    minutes: 45,
    seconds: 30,
  });

  React.useEffect(() => {
    if (!countdown) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <Link to={link}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'relative rounded-2xl p-5 md:p-8 overflow-hidden bg-gradient-to-r text-white',
          bgColor
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-xl md:text-2xl font-bold">{title}</h3>
              <p className="text-white/90 text-sm md:text-base mt-1">{subtitle}</p>

              {code && (
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                  <span className="text-xs">Use code:</span>
                  <span className="font-mono font-bold">{code}</span>
                </div>
              )}

              {countdown && (
                <div className="flex items-center gap-2 mt-4">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm">Ends in:</span>
                  <div className="flex gap-1 font-mono font-bold">
                    <span className="bg-white/20 px-2 py-0.5 rounded">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    :
                    <span className="bg-white/20 px-2 py-0.5 rounded">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    :
                    <span className="bg-white/20 px-2 py-0.5 rounded">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <ChevronRight className="w-6 h-6 flex-shrink-0 opacity-80" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

interface PromoBannerSliderProps {
  banners: Array<{
    id: string;
    title: string;
    subtitle: string;
    code?: string;
    bgColor?: string;
  }>;
}

export const PromoBannerSlider: React.FC<PromoBannerSliderProps> = ({ banners }) => {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="relative">
      <motion.div
        key={active}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <PromoBanner
          {...banners[active]}
          countdown={active === 0}
        />
      </motion.div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              i === active ? 'w-6 bg-primary' : 'bg-muted'
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
