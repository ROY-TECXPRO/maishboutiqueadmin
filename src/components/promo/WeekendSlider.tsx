import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SliderItem {
  id: string;
  image: string;
  title: string;
  discount?: string;
}

const weekdayImages: SliderItem[] = [
  { id: '1', image: '/images/men/shirts/blue-suit1.webp', title: 'Blue Suit' },
  { id: '2', image: '/images/men/shirts/brown-suit.webp', title: 'Brown Suit' },
  { id: '3', image: '/images/men/shirts/official-suit.webp', title: 'Official Suit' },
  { id: '4', image: '/images/men/shirts/suit-men.webp', title: 'Classic Suit' },
  { id: '5', image: '/images/men/shirts/maish-blazzer-suit.webp', title: 'Maish Blazer' },
];

const weekendOffers: SliderItem[] = [
  { id: '1', image: '/images/women/dresses/elegant-dress-1.webp', title: 'Elegant Dress', discount: '40% OFF' },
  { id: '2', image: '/images/women/dresses/elegant-dress-4.webp', title: 'Designer Dress', discount: '30% OFF' },
  { id: '3', image: '/images/women/dresses/elegant-dress-5.webp', title: 'Evening Dress', discount: '45% OFF' },
];

const checkIsWeekend = (): boolean => {
  const today = new Date();
  const day = today.getDay();
  return day === 5 || day === 6 || day === 0;
};

export const WeekendSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isWeekend, setIsWeekend] = useState(checkIsWeekend);
  const [visibleSlides, setVisibleSlides] = useState(2);

  useEffect(() => {
    const getSlides = () => {
      if (typeof window === 'undefined') return 2;
      if (window.innerWidth < 640) return 2;
      if (window.innerWidth < 768) return 3;
      if (window.innerWidth < 1024) return 4;
      return 5;
    };
    setVisibleSlides(getSlides());
    const handleResize = () => setVisibleSlides(getSlides());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkWeekend = () => {
      setIsWeekend(checkIsWeekend());
      setCurrentIndex(0);
    };
    checkWeekend();
    const interval = setInterval(checkWeekend, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const images = isWeekend ? weekendOffers : weekdayImages;
        return (prev + 1) % images.length;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isWeekend]);

  const currentImages = isWeekend ? weekendOffers : weekdayImages;
  const title = isWeekend ? 'Weekend Flash Sale' : "Men's Collection";
  const sectionBg = isWeekend 
    ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-600' 
    : 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800';

  const getVisibleItems = () => {
    const items = [];
    for (let i = 0; i < visibleSlides; i++) {
      const index = (currentIndex + i) % currentImages.length;
      items.push({ ...currentImages[index], position: i });
    }
    return items;
  };

  return (
    <section className={`w-full py-2 md:py-4 ${sectionBg} overflow-hidden`}>
      <div className="flex items-center justify-between px-3 md:px-6 mb-2 md:mb-3">
        <div className="flex items-center gap-2 md:gap-3">
          <span className={`inline-flex items-center justify-center px-2 py-0.5 md:px-3 md:py-1 ${isWeekend ? 'bg-white text-red-600' : 'bg-amber-400 text-amber-900'} text-[10px] md:text-xs font-bold rounded-full animate-pulse min-w-[60px]`}>
            {isWeekend ? 'WEEKEND' : 'NEW'}
          </span>
          <h3 className="font-display text-sm md:text-xl font-bold text-white truncate max-w-[120px] md:max-w-none">
            {title}
          </h3>
        </div>
        <Link to="/sale" className="text-xs md:text-base font-medium text-white hover:text-white/80 flex items-center gap-1 bg-white/20 px-2 md:px-3 py-1 rounded-full transition-colors">
          <span className="hidden sm:inline">View All</span>
          <span className="sm:hidden">Shop</span>
          <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
        </Link>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-r ${isWeekend ? 'from-red-600' : 'from-slate-800'} to-transparent z-10 pointer-events-none`} />
        <div className={`absolute right-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-l ${isWeekend ? 'from-red-600' : 'from-slate-800'} to-transparent z-10 pointer-events-none`} />

        <div className="flex w-full px-1 md:px-4">
          <AnimatePresence mode="popLayout">
            {getVisibleItems().map((item, i) => (
              <motion.div
                key={`${item.id}-${currentIndex}`}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex-1 px-1 md:px-2"
              >
                <Link to="/sale" className="group block">
                  <div className="relative rounded-lg overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-0.5">
                    <div className="aspect-[2/3] md:aspect-[3/4] lg:aspect-[4/5] overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    {item.discount && (
                      <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-600 text-white text-[9px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                        {item.discount}
                      </div>
                    )}
                    <div className="p-1.5 md:p-3 text-center bg-gradient-to-t from-black/70 to-transparent absolute bottom-0 left-0 right-0">
                      <p className="text-[10px] md:text-sm font-semibold text-white truncate drop-shadow-md">{item.title}</p>
                      {item.discount && <p className="text-[8px] md:text-xs text-red-300 font-medium hidden sm:block">Limited Time!</p>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 md:gap-2 mt-2 md:mt-4">
        {currentImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white w-4 md:w-8' : 'bg-white/40 hover:bg-white/60 w-1.5 md:w-2'}`}
            aria-label={`Go to item ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default WeekendSlider;
