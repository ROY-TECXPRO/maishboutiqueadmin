// Product Types
export interface ProductImage {
  src: string;
  alt: string;
}

// Database types for future product system (not yet in use)
export interface CategoryRecord {
  id: string;
  slug: string;
  name: string;
  short_name?: string;
  description?: string;
  image?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryLogRecord {
  id: string;
  product_id: string;
  product_sku: string;
  old_stock: number;
  new_stock: number;
  change: number;
  reason?: string;
  changed_by?: string;
  created_at: string;
}

export interface ProductRecord {
  id: string;
  legacy_id?: string;
  sku: string;
  slug: string;
  name: string;
  price: number;
  original_price?: number;
  description?: string;
  category_id?: string;
  gender?: string;
  tags: string[];
  use_case: string[];
  rating: number;
  review_count: number;
  is_new: boolean;
  is_sale: boolean;
  stock: number;
  size_prices?: Record<string, number>;
  images: Array<{ src: string; alt: string }>;
  colors: Array<{ name: string; hex: string; available: boolean }>;
  sizes: string[];
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type Gender = 'Women' | 'Men' | 'Kids' | 'Unisex' | 'Boys' | 'Girls';

export type UseCase = 'work' | 'casual' | 'sports' | 'hotel' | 'formal' | 'party' | 'beach' | 'home' | 'school' | 'wedding' | 'evening' | 'uniform' | 'church' | 'workout' | 'birthday' | 'PE' | 'scouts' | 'outdoor' | 'camping' | 'construction' | 'industrial' | 'gardening' | 'corporate' | 'roadside' | 'medical' | 'laboratory' | 'hospitality' | 'retail' | 'girl guides' | 'office' | 'running' | 'football' | 'soccer' | 'fan gear' | 'basketball' | 'training' | 'referee' | 'official' | 'rugby' | 'handball' | 'tennis' | 'award' | 'championship' | 'competition' | 'tournament' | 'medal' | 'recognition' | 'athletics' | 'gym' | 'hiking' | 'swimming' | 'cycling' | 'volleyball' | 'baseball' | 'cricket' | 'netball' | 'boxing' | 'martial arts' | 'weightlifting' | 'yoga' | 'pilates' | 'dance' | 'golf' | 'fishing' | 'hunting' | 'travel' | 'luggage' | 'everyday' | 'sleepwear' | 'loungewear' | 'activewear' | 'performance' | 'protective' | 'safety' | 'professional' | 'diplomatic' | 'traditional' | 'ceremonial' | 'graduation' | 'interview' | 'date night' | 'anniversary' | 'photography' | 'stage' | 'rehearsal' | 'costume' | 'themed' | 'cosplay' | 'fantasy' | 'renaissance' | 'vintage' | 'retro' | 'modern' | 'classic' | 'minimalist' | 'bohemian' | 'ethnic' | 'african' | 'western' | 'eastern' | 'practice' | 'sleep' | 'bedroom' | 'bath' | 'spa' | 'restaurant' | 'kitchen' | 'safari' | 'decoration' | 'youth';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: ProductImage[];
  category: Category;
  subCategory?: string;
  gender?: Gender;
  sizes: Size[];
  colors: ProductColor[];
  tags: string[];
  useCase?: UseCase[];
  description?: string;
  features?: string[];
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isSale?: boolean;
  stock: number;
  sku: string;
  sizePrices?: Record<string, number>; // For products with size-based pricing
}

export interface ProductColor {
  name: string;
  hex: string;
  available: boolean;
}

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '2XL' | '3XL' | 
  '28' | '29' | '30' | '31' | '32' | '33' | '34' | '35' | '36' | '37' | '38' | '39' | '40' | '41' | '42' | '43' | '44' | '45' |
  '2-3Y' | '4-5Y' | '6-7Y' | '8-9Y' | '10-11Y' | '12-13Y' | '14-15Y' | '12-14Y' |
  '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | 'One Size' |
  '16' | '18' | '20' | '22' | '24' |
  "16\"" | "18\"" | "20\"" | "22\"" | "24\"" |
  "7\"" | "8\"" | "9\"" |
  'S/M' | 'M/L' | 'L/XL' |
  'Size 5' | 'Size 4' | 'Size 3' | 'Size 2' | 'Size 1' |
  'Official' |
  'Small (8 inch)' | 'Medium (12 inch)' | 'Large (16 inch)' |
  'Small (6 inch)' | 'Medium (10 inch)' |
  'Can (3 balls)' |
  'Small (3 inch)' | 'Medium (4 inch)' | 'Large (5 inch)' |
  'Junior' | 'Senior' |
  'Standard' | 'Competition' |
  'Beginner' | 'Intermediate' | 'Advanced' |
  '2-4 Years' | '4-6 Years' | '6-8 Years' | '8-10 Years' |
  '3-5 Years' | '5-7 Years' | '7-9 Years' | '9-11 Years' |
  '12-18 Months' | '18-24 Months' |
  'Newborn' | '0-3 Months' | '3-6 Months' | '6-12 Months' |
  'Extra Small' | 'Small' | 'Medium' | 'Large' | 'Extra Large' |
  '32A' | '32B' | '32C' | '34A' | '34B' | '34C' | '36A' | '36B' | '36C' | '38A' | '38B' | '38C' |
  'S (40-42)' | 'M (44-46)' | 'L (48-50)' | 'XL (52-54)' | 'XXL (56-58)' |
  'Set of 10' | 'Set of 20' | 'Set of 50' | 'Set of 12' | 'Set of 24' | 'Set of 3' | 'Set (Yellow + Red + Notebook)' |
  'Pair' |
  '6x4 ft' | '8x6 ft' | '12x6 ft' | '5x6 ft' | '4x6 ft' | '6x6 ft' |
  'Single' | 'Double' | 'Queen' | 'King' |
  'Hand Towel' | 'Bath Towel' | 'Bath Sheet' | 'Face Towel' |
  'Standard Kit';

export type Category =
  | 'women-wear'
  | 'men-wear'
  | 'kids-wear'
  | 'work-wear'
  | 'uniform-center'
  | 'accessories'
  | 'women-handbags'
  | 'bags-suitcases'
  | 'sports-equipment'
  | 'mattress-center'
  | 'hotel-supplies';

export interface CategoryInfo {
  id: Category;
  name: string;
  shortName: string;
  description: string;
  image: string;
  color: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: Size;
  selectedColor: ProductColor;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

// Review Types
export interface Review {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

// Search & Filter Types
export interface SearchFilters {
  category?: Category;
  priceRange?: [number, number];
  sizes?: Size[];
  colors?: string[];
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating';
  gender?: Gender;
  useCase?: UseCase[];
}

// Search Result Types
export interface SearchResult {
  products: Product[];
  totalCount: number;
  query: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface MegaMenuItem {
  category: string;
  items: { label: string; href: string }[];
}

// PWA Types
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
