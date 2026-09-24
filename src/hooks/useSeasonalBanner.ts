import { useState, useEffect } from 'react';

export type BannerType = 'eid' | 'easter' | 'spring' | 'summer' | 'default';

interface SeasonalBannerState {
  bannerType: BannerType;
  bannerTitle: string;
  bannerSubtitle: string;
  isEasterPeriod: boolean;
}

export const useSeasonalBanner = (): SeasonalBannerState => {
  const [bannerState, setBannerState] = useState<SeasonalBannerState>({
    bannerType: 'default',
    bannerTitle: 'Special Offers',
    bannerSubtitle: 'Amazing deals waiting for you!',
    isEasterPeriod: false,
  });

  useEffect(() => {
    const checkSeasonalBanner = () => {
      const now = new Date();
      const month = now.getMonth(); // 0-11 (January = 0)
      const date = now.getDate();
      const year = now.getFullYear();

      // Easter 2026 is April 5th (approximate - Easter Sunday)
      // Easter period: April 1st to April 20th
      const easterStart = new Date(year, 3, 1); // April 1
      const easterEnd = new Date(year, 3, 20); // April 20

      // Check if it's Easter period (April 1-20)
      if (now >= easterStart && now <= easterEnd) {
        setBannerState({
          bannerType: 'easter',
          bannerTitle: 'Happy Easter 🐰',
          bannerSubtitle: 'Celebrate the season with amazing discounts!',
          isEasterPeriod: true,
        });
        return;
      }

      // Check for Eid Al-Adha (typically June/July - approximate for planning)
      // Eid Al-Adha 2026 is expected around June 17-21
      const eidAlAdhaStart = new Date(year, 5, 15); // June 15
      const eidAlAdhaEnd = new Date(year, 5, 25); // June 25
      
      if (now >= eidAlAdhaStart && now <= eidAlAdhaEnd) {
        setBannerState({
          bannerType: 'eid',
          bannerTitle: 'Eid Al-Adha Mubarak 🐑',
          bannerSubtitle: 'Special festive offers for you!',
          isEasterPeriod: false,
        });
        return;
      }

      // Spring season (March - May in Kenya)
      if (month >= 2 && month <= 4) { // March, April, May
        setBannerState({
          bannerType: 'spring',
          bannerTitle: 'Spring Collection 🌸',
          bannerSubtitle: 'Fresh styles for the new season!',
          isEasterPeriod: false,
        });
        return;
      }

      // Summer season (December - February in Kenya)
      if (month >= 11 || month <= 1) { // December, January, February
        setBannerState({
          bannerType: 'summer',
          bannerTitle: 'Summer Vibes ☀️',
          bannerSubtitle: 'Cool styles for hot days!',
          isEasterPeriod: false,
        });
        return;
      }

      // Default: General Special Offers
      setBannerState({
        bannerType: 'default',
        bannerTitle: 'Special Offers',
        bannerSubtitle: 'Amazing deals waiting for you!',
        isEasterPeriod: false,
      });
    };

    checkSeasonalBanner();
    
    // Check again every hour to update banner if date changes
    const interval = setInterval(checkSeasonalBanner, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return bannerState;
};
