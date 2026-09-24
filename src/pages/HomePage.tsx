import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, RefreshCw, Sparkles, Clock, CheckCircle, AlertCircle, Gift, CalendarDays, Store, Trophy, ChevronRight } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { CategoryGrid } from '@/components/category/CategoryCard';
import { ReviewsSlider } from '@/components/reviews/ReviewCard';
import { categories, products, googleReviews, getNewArrivals, getSaleProducts } from '@/data/products';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

type CountdownParts = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

type CampaignSlide = {
  id: 'world-cup' | 'mega-store';
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryLabel: string;
  secondaryLabel?: string;
  primaryTo: string;
  secondaryTo?: string;
  image: string;
  imageAlt: string;
  accent: string;
};

type CampaignCard = {
  id: string;
  badge: string;
  title: string;
  description: string;
  cta: string;
  to: string;
  image: string;
  alt: string;
};

const WORLD_CUP_FINAL_DEADLINE = Date.UTC(2026, 6, 19, 23, 59, 59);

const campaignSlides: CampaignSlide[] = [
  {
    id: 'world-cup',
    eyebrow: 'FIFA World Cup 2026',
    headline: 'FIFA World Cup 2026 Fan Zone',
    subheadline: 'Support your team in style with premium football jerseys, training kits, boots, fan merchandise and sportswear collections.',
    primaryLabel: 'Shop World Cup Collection',
    secondaryLabel: 'Browse Team Jerseys',
    primaryTo: '/category/sports-equipment',
    secondaryTo: '/category/sports-equipment',
    image: '/images/world-cup jerseys.webp',
    imageAlt: 'Football jerseys and fan merchandise for the FIFA World Cup',
    accent: 'from-emerald-400 via-green-500 to-blue-600',
  },
  {
    id: 'mega-store',
    eyebrow: 'Maish Mega Store',
    headline: 'Everything You Need Under One Roof',
    subheadline: 'Fashion, Mattresses, Uniforms, Sports Equipment, Hotel Supplies, Bags, Footwear and More.',
    primaryLabel: 'Explore Collections',
    primaryTo: '/categories',
    image: '/images/hotel/hotel-reception.webp',
    imageAlt: 'Maish Fashion Boutique mega store product collections',
    accent: 'from-primary via-accent to-amber-400',
  },
];

const megaBadges = [
  "✓ Men's Fashion",
  "✓ Women's Fashion",
  '✓ Mattresses',
  '✓ Sports Equipment',
  '✓ School Uniforms',
  '✓ Hotel Supplies',
  '✓ Footwear',
  '✓ Bags & Travel',
];

const promoMessages = [
  "⚽ FIFA World Cup Collection Available Now",
  "⚽ New Team Jerseys Just Arrived",
  "⚽ Shop Official Fan Merchandise",
  "⚽ Support Your Team In Style",
  "⚽ Limited World Cup Season Specials",
];

const getNairobiTimestamp = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);
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

const formatCountdown = (milliseconds: number): CountdownParts => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

const CountdownUnit = ({ value, label }: { value: string; label: string }) => (
  <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3 text-center shadow-xl backdrop-blur-xl">
    <span className="block text-xl font-black tracking-tight md:text-2xl">{value}</span>
    <span className="block text-[10px] uppercase tracking-[0.24em] text-white/70">{label}</span>
  </div>
);

const preloadHeroImages = (images: string[]) => {
  images.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

const HomePage = () => {
  const newArrivals = getNewArrivals();
  const saleProducts = getSaleProducts();
  const popularProducts = products.slice(0, 8);
  const accessoriesProducts = products.filter(p => p.category === 'accessories').slice(0, 8);
  const [nowTs, setNowTs] = useState(getNairobiTimestamp);
  const [activeIndex, setActiveIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const worldCupIsActive = nowTs < WORLD_CUP_FINAL_DEADLINE;
  const worldCupCountdown = formatCountdown(WORLD_CUP_FINAL_DEADLINE - nowTs);

  useEffect(() => {
    preloadHeroImages(campaignSlides.map(s => s.image));
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNowTs(getNairobiTimestamp()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const activeSlides = useMemo(() => campaignSlides.filter(slide => {
    if (slide.id === 'world-cup') return worldCupIsActive;
    return true;
  }), [worldCupIsActive]);

  const activeSlideKeys = activeSlides.map(slide => slide.id).join('|');

  useEffect(() => {
    setActiveIndex(0);
  }, [activeSlideKeys]);

  useEffect(() => {
    if (!activeSlides.length) return;
    const id = window.setInterval(() => {
      setActiveIndex(previous => (previous + 1) % activeSlides.length);
    }, 6000);

    return () => window.clearInterval(id);
  }, [activeSlides.length]);

  const featuredCards = useMemo<CampaignCard[]>(() => {
    const cards: CampaignCard[] = [];

    cards.push({
      id: 'world-cup-fan-zone',
      badge: 'World Cup Fan Zone',
      title: 'World Cup Fan Zone',
      description: 'Jerseys, boots, training kits, sportswear and fan accessories for match-day energy.',
      cta: 'Shop Sports',
      to: '/category/sports-equipment',
      image: '/images/world-cup jerseys.webp',
      alt: 'Sports collection and fan merchandise for the World Cup',
    });

    cards.push({
      id: 'new-jersey-arrivals',
      badge: 'New Jersey Arrivals',
      title: 'New Jersey Arrivals',
      description: 'Fresh football jerseys from top teams. Argentina, Brazil, England, Germany, France, Portugal, Spain and Netherlands.',
      cta: 'Browse Jerseys',
      to: '/category/sports-equipment',
      image: '/images/world-cup jerseys.webp',
      alt: 'New World Cup jersey arrivals',
    });

    cards.push({
      id: 'sports-training-collection',
      badge: 'Sports & Training Collection',
      title: 'Sports & Training Collection',
      description: 'Training kits, sportswear, football boots and everything you need for the pitch.',
      cta: 'Shop Sports',
      to: '/category/sports-equipment',
      image: '/images/world-cup jerseys.webp',
      alt: 'Sports and training collection',
    });

    return cards;
  }, []);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSubscribeStatus('error');
      setErrorMessage('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubscribeStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setSubscribeStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: email.toLowerCase().trim(), status: 'subscribed' }]);

      if (error) {
        if (error.code === '23505') {
          setSubscribeStatus('error');
          setErrorMessage('This email is already subscribed!');
        } else {
          throw error;
        }
      } else {
        setSubscribeStatus('success');
        setEmail('');
        
        try {
          await supabase.functions.invoke('send-newsletter-confirmation', {
            body: { email: email.toLowerCase().trim() }
          });
        } catch (edgeError) {
          console.log('Edge Function not available or failed:', edgeError);
        }
        
        setTimeout(() => setSubscribeStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setSubscribeStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  const renderHeroVisual = (slide: CampaignSlide) => {
    if (slide.id === 'world-cup') {
      return (
        <div className="relative hidden h-full min-h-[32rem] overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 md:block md:shadow-2xl md:shadow-emerald-950/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(52,211,153,0.35),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.28),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.2),rgba(15,23,42,0.92))]" />
          <div className="absolute inset-x-0 top-0 h-1/3 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.3),transparent_45%)] opacity-70" />
          <div className="absolute left-8 top-10 h-24 w-2 rounded-full bg-white/70 blur-sm" />
          <div className="absolute right-12 top-14 h-28 w-2 rounded-full bg-emerald-200/60 blur-sm" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(circle,rgba(16,185,129,0.25)_1px,transparent_1px)] bg-[length:18px_18px] opacity-40" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute right-8 top-24 grid h-36 w-36 place-items-center rounded-full border border-white/20 bg-white/10 shadow-2xl shadow-emerald-400/20 backdrop-blur-xl"
          >
            <div className="relative h-28 w-28 rounded-full bg-white shadow-xl">
              <div className="absolute inset-4 rounded-full border-4 border-slate-950/80" />
              <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-xl border-4 border-slate-950/80 bg-white" />
              <div className="absolute left-3 top-3 h-6 w-6 rounded-full bg-slate-950/80" />
              <div className="absolute right-3 bottom-3 h-6 w-6 rounded-full bg-slate-950/80" />
            </div>
          </motion.div>
          <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/[0.15] bg-white/10 p-5 text-white backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <Trophy className="h-7 w-7 text-emerald-300" />
              <div>
                <p className="font-semibold">Match-Day Ready</p>
                <p className="text-sm text-white/70">Jerseys, boots, kits and fan accessories</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative hidden h-full min-h-[32rem] overflow-hidden rounded-[2rem] border border-white/20 md:block">
        <img src={slide.image} alt={slide.imageAlt} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-background/10 via-background/[0.35] to-background/80 dark:via-background/[0.55] dark:to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(245,158,11,0.35),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(17,24,39,0.22),transparent_35%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/20 bg-white/[0.15] p-5 text-white backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <Store className="h-7 w-7 text-amber-300" />
            <div>
              <p className="font-semibold">One-Stop Shopping</p>
              <p className="text-sm text-white/70">Fashion, home, sports, uniforms, hotel supplies and travel essentials</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const HeroSlide = ({ slide, isActive }: { slide: CampaignSlide; isActive: boolean }) => {
    return (
      <motion.div
        initial={false}
        animate={{ opacity: isActive ? 1 : 0, transition: { duration: 0.65 } }}
        className="absolute inset-0"
        style={{ pointerEvents: isActive ? 'auto' : 'none' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--accent)/0.16),transparent_30%),radial-gradient(circle_at_85%_20%,hsl(var(--primary)/0.14),transparent_32%)] dark:bg-[radial-gradient(circle_at_15%_10%,hsl(var(--accent)/0.1),transparent_30%),radial-gradient(circle_at_85%_20%,hsl(var(--primary)/0.12),transparent_32%)]" />
        <div className="relative min-h-[calc(100svh-5rem)]">
          <div className="absolute inset-0">
            <img src={slide.image} alt="" className="h-full w-full object-cover opacity-35 dark:opacity-20" />
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-75 mix-blend-multiply dark:opacity-45`} />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/[0.35] dark:from-background dark:via-background/80 dark:to-background/40" />
          </div>

          <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-6 lg:px-8">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12 }}
              className="relative z-10"
            >
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${slide.accent} px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white shadow-xl shadow-black/10`}>
                  <Sparkles className="h-3.5 w-3.5" />
                  {slide.eyebrow}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-2 text-xs font-semibold text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-card/50">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  Narok, Kenya
                </span>
              </div>

              <h1 className="font-display text-4xl font-bold leading-[0.98] tracking-tight text-foreground md:text-6xl lg:text-7xl">
                {slide.headline}
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-medium text-muted-foreground md:text-lg lg:text-xl">
                {slide.subheadline}
              </p>

              {slide.id === 'world-cup' && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 }}
                  className="mt-6 max-w-xl rounded-3xl border border-white/20 bg-white/[0.15] p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/25"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-white">
                      <Clock className="h-4 w-4 text-emerald-300" />
                      <span className="text-xs font-bold uppercase tracking-[0.2em]">World Cup Final Countdown</span>
                    </div>
                    <span className="rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-bold text-emerald-100 ring-1 ring-emerald-200/30">
                      Nairobi Time
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <CountdownUnit value={worldCupCountdown.days} label="Days" />
                    <CountdownUnit value={worldCupCountdown.hours} label="Hours" />
                    <CountdownUnit value={worldCupCountdown.minutes} label="Minutes" />
                    <CountdownUnit value={worldCupCountdown.seconds} label="Seconds" />
                  </div>
                </motion.div>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-12 rounded-full px-6 shadow-xl shadow-black/[0.15]" asChild>
                  <Link to={slide.primaryTo}>
                    {slide.primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {slide.secondaryLabel && slide.secondaryTo && (
                  <Button size="lg" variant="outline" className="h-12 rounded-full border-white/30 bg-white/10 px-6 text-white backdrop-blur-xl hover:bg-white/20 hover:text-white dark:border-white/[0.15] dark:bg-black/20 dark:hover:bg-white/10" asChild>
                    <Link to={slide.secondaryTo}>
                      {slide.secondaryLabel}
                    </Link>
                  </Button>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium text-foreground/75 md:text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-2 backdrop-blur-xl dark:border-white/10 dark:bg-card/50">
                  <Truck className="h-4 w-4 text-primary" />
                  Countrywide Delivery
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-2 backdrop-blur-xl dark:border-white/10 dark:bg-card/50">
                  <Shield className="h-4 w-4 text-primary" />
                  Secure Payments
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-2 backdrop-blur-xl dark:border-white/10 dark:bg-card/50">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  Easy Returns
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="relative z-10 md:h-full"
            >
              {renderHeroVisual(slide)}
            </motion.div>
          </div>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/60 p-1.5 backdrop-blur-xl dark:border-white/10 dark:bg-card/60">
            {activeSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${slide.headline}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${index === activeIndex ? `w-8 bg-gradient-to-r ${slide.accent}` : 'w-2.5 bg-border hover:bg-primary/60'}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActiveIndex(previous => (previous - 1 + activeSlides.length) % activeSlides.length)}
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-border bg-background/60 p-3 text-foreground shadow-lg backdrop-blur-xl transition hover:bg-background dark:border-white/10 dark:bg-card/60 md:flex"
            aria-label="Previous campaign"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex(previous => (previous + 1) % activeSlides.length)}
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-border bg-background/60 p-3 text-foreground shadow-lg backdrop-blur-xl transition hover:bg-background dark:border-white/10 dark:bg-card/60 md:flex"
            aria-label="Next campaign"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="page-transition">
      <div className="relative overflow-hidden bg-background" style={{ minHeight: 'calc(100svh - 5rem)' }}>
        {activeSlides.map((slide, index) => (
          <HeroSlide key={slide.id} slide={slide} isActive={index === activeIndex} />
        ))}
      </div>

      <section className="relative z-30 overflow-hidden border-y border-border bg-gradient-to-r from-primary via-accent to-primary text-white shadow-lg shadow-primary/10">
        <motion.div
          className="whitespace-nowrap py-3"
          animate={{ x: ['-50%', '0%'] }}
          transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
        >
          <div className="inline-flex items-center gap-8 px-4 text-sm font-bold tracking-wide md:text-base">
            {[...promoMessages, ...promoMessages].map((message, index) => (
              <span key={`${message}-${index}`} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                {message}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative z-20 -mt-8 px-4 md:-mt-12 md:px-0">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Featured Events</span>
              <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">Campaign Collections</h2>
            </div>
            <Link to="/categories" className="hidden text-sm font-semibold text-primary hover:underline md:inline-flex">
              View All Collections <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {featuredCards.map((card, index) => (
              <motion.article
                key={card.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                className="group overflow-hidden rounded-3xl border border-border bg-card/90 shadow-card backdrop-blur-xl transition-shadow duration-300 hover:shadow-card-hover dark:border-white/10 dark:bg-card/70"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={card.image} alt={card.alt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent dark:from-background dark:via-background/5" />
                  <span className="absolute left-4 top-4 rounded-full bg-background/75 px-3 py-1.5 text-xs font-bold text-foreground shadow-lg backdrop-blur-xl dark:bg-black/40 dark:text-white">
                    {card.badge}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold">{card.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
                  <Button className="mt-4 w-full rounded-full" asChild>
                    <Link to={card.to}>
                      {card.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>

          <Link to="/categories" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline md:hidden">
            View All Collections <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="py-6 md:py-10">
        <div className="container mx-auto px-4 md:px-0">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold md:text-2xl">Shop by Category</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Find what you're looking for</p>
            </div>
            <Link to="/categories" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </div>
          <CategoryGrid categories={categories} variant="scroll" />
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-0">
        <ProductGrid
          products={newArrivals.filter(p => p.category === 'sports-equipment').slice(0, 8)}
          title="New World Cup Arrivals"
          subtitle="Fresh football jerseys and fan gear now available."
          viewAllLink="/new-arrivals"
        />
      </div>

      <div className="container mx-auto px-4 md:px-0">
        <ProductGrid
          products={accessoriesProducts}
          title="Accessories"
          subtitle="Complete your look"
          viewAllLink="/category/accessories"
        />
      </div>

      {saleProducts.length > 0 && (
        <div className="container mx-auto px-4 md:px-0">
          <ProductGrid
            products={saleProducts}
            title="On Sale 🔥"
            subtitle="Grab them before they're gone"
            viewAllLink="/sale"
          />
        </div>
      )}

      <div className="container mx-auto px-4 md:px-0">
        <ProductGrid
          products={popularProducts}
          title="Trending Now"
          subtitle="Customer favorites"
        />
      </div>

      <div className="container mx-auto px-4 md:px-0">
        <ReviewsSlider reviews={googleReviews} title="What Our Customers Say" />
      </div>

      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {[
            { icon: Truck, title: 'Fast Delivery', desc: 'Countrywide shipping' },
            { icon: Shield, title: 'Secure Payment', desc: 'M-Pesa & Cards accepted' },
            { icon: RefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
            { icon: Sparkles, title: 'Quality Assured', desc: 'Handpicked products' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-3 text-center shadow-card md:p-4"
            >
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 md:mb-3 md:h-12 md:w-12">
                <feature.icon className="h-5 w-5 text-primary md:h-6 md:w-6" />
              </div>
              <h3 className="text-xs font-semibold md:text-sm">{feature.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-10">
        <div className="rounded-3xl bg-secondary p-6 text-center md:p-10">
          <h2 className="font-display text-xl font-semibold md:text-2xl">Stay in Style</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Subscribe to get exclusive offers, new arrivals, and style tips delivered to your inbox.
          </p>
          
          {subscribeStatus === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto mt-6 flex max-w-md flex-col items-center justify-center rounded-xl bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-300"
            >
              <CheckCircle className="mb-2 h-10 w-10" />
              <p className="font-medium">You're subscribed! Check your email for confirmation.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (subscribeStatus === 'error') setSubscribeStatus('idle');
                  }}
                  placeholder="Enter your email"
                  disabled={subscribeStatus === 'loading'}
                  className={`w-full h-12 rounded-xl border bg-background px-4 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    subscribeStatus === 'error' ? 'border-red-500 focus:border-red-500' : 'border-border'
                  }`}
                />
                {subscribeStatus === 'error' && (
                  <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
              <Button 
                size="lg" 
                type="submit"
                disabled={subscribeStatus === 'loading'}
                className="h-12 min-w-[120px] rounded-full"
              >
                {subscribeStatus === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;