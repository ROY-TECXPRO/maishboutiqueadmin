import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getSaleProducts, products } from '@/data/products';
import { PromoBanner } from '@/components/promo/PromoBanner';
import { Button } from '@/components/ui/button';

const WORLD_CUP_FINAL_DEADLINE = Date.UTC(2026, 6, 19, 23, 59, 59);

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

const getNairobiDayOfWeek = () => new Date(getNairobiTimestamp()).getUTCDay();

const isWeekendDay = () => {
  const day = getNairobiDayOfWeek();
  return day === 5 || day === 6 || day === 0;
};

const getDayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[getNairobiDayOfWeek()];
};

const SalePage: React.FC = () => {
  const navigate = useNavigate();
  const nowTs = getNairobiTimestamp();
  const isWorldCupActive = nowTs < WORLD_CUP_FINAL_DEADLINE;
  const weekend = isWeekendDay();

  if (!isWorldCupActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <span className="text-5xl">⚽</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              World Cup Sale Has Ended
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              The FIFA World Cup 2026 Fan Zone sale is no longer active. Thank you for supporting your team!
            </p>
            <Button onClick={() => navigate('/')} className="inline-flex items-center gap-2 px-6 py-3 text-lg" size="lg">
              ← Back to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const worldCupSaleTrophies = products.filter(p => p.category === 'sports-equipment' && p.subCategory === 'Trophies');
  const worldCupShoes = products.filter(p => p.category === 'sports-equipment' && p.subCategory === 'Footwear');
  const worldCupSaleProducts = [...worldCupSaleTrophies, ...worldCupShoes];
  const regularSaleProducts = getSaleProducts();

  if (!weekend) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-lg mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <span className="text-5xl">📅</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Weekend Only
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Today is <strong>{getDayName()}</strong>
            </p>
            <p className="text-muted-foreground mb-8 text-lg">
              Sorry, World Cup Special Deals are only available on <strong>Friday, Saturday, and Sunday</strong>.
            </p>
            <p className="text-muted-foreground mb-8">
              Come back this weekend for exclusive deals on trophies and football shoes!
            </p>
            <div className="bg-muted rounded-xl p-6 mb-8">
              <p className="text-sm text-muted-foreground mb-2">
                💡 Use code <span className="font-mono font-bold text-primary">WORLDCUP</span> for extra 15% off during the weekend!
              </p>
              <p className="text-xs text-muted-foreground">
                Available Friday, Saturday & Sunday only
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/')} className="inline-flex items-center gap-2 px-6 py-3 text-lg" size="lg">
                ← Back to Homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition min-h-screen">
      <div className="bg-gradient-to-r from-emerald-600 via-green-500 to-blue-600 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
            ⚽ WORLD CUP SALE ⚽
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold">World Cup Special Deals</h1>
          <p className="text-white/90 mt-3 max-w-lg mx-auto text-lg">
            Trophies & Football Boots - Premium gear for the FIFA World Cup 2026 Fan Zone!
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl">
            <span className="font-bold">Use code:</span>
            <span className="font-mono font-bold text-xl">WORLDCUP</span>
          </div>
          <p className="text-white/80 mt-3 text-sm">Valid Friday, Saturday & Sunday only!</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <PromoBanner
          title="⚡ World Cup Sale - Best Deals!"
          subtitle="Trophies & Football Shoes - Use code WORLDCUP for 15% off!"
          code="WORLDCUP"
          countdown
        />
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-6 text-white text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">⚽ WORLD CUP WEEKEND DEALS ⚽</h2>
          <p className="text-white/90 mb-4">Trophies & Football Shoes - Premium gear for match day!</p>
          <p className="text-sm bg-white/20 inline-block px-4 py-2 rounded-lg">
            Don't forget to use code <strong className="text-xl">WORLDCUP</strong> at checkout for extra 15% off!
          </p>
        </div>
        <div className="mt-6">
          <ProductGrid
            products={worldCupSaleProducts}
            title="⚽ World Cup Sale - Trophies & Football Shoes"
            subtitle={`${worldCupSaleProducts.length} items - Trophies & Boots`}
            columns={2}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg font-semibold">
          ⚽ Shop World Cup deals and use code <span className="text-emerald-600 font-bold">WORLDCUP</span> for extra 15% off!
        </p>
      </div>
    </div>
  );
};

export default SalePage;
