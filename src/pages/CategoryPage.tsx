import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, SlidersHorizontal, X } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { categories, getProductsByCategory, products } from '@/data/products';
import { Category as CategoryType } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [showFilters, setShowFilters] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<string>(categoryId === 'sports-equipment' ? 'featured' : 'popular');
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);
  const [selectedColors, setSelectedColors] = React.useState<string[]>([]);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 50000]);

  const category = categories.find(c => c.id === categoryId);
  const categoryProducts = categoryId 
    ? getProductsByCategory(categoryId as CategoryType)
    : products;

  // Get unique sizes and colors from products
  const allSizes = [...new Set(categoryProducts.flatMap(p => p.sizes))];
  const allColors = [...new Set(categoryProducts.flatMap(p => p.colors.map(c => c.name)))];

  // Filter products
  let filteredProducts = categoryProducts;
  
  if (selectedSizes.length > 0) {
    filteredProducts = filteredProducts.filter(p => 
      p.sizes.some(s => selectedSizes.includes(s))
    );
  }
  
  if (selectedColors.length > 0) {
    filteredProducts = filteredProducts.filter(p =>
      p.colors.some(c => selectedColors.includes(c.name))
    );
  }

  filteredProducts = filteredProducts.filter(p =>
    p.price >= priceRange[0] && p.price <= priceRange[1]
  );

  // Sort products
  const featuredSportsJerseys = [
    'world-cup-jersey-france-home',
    'world-cup-jersey-argentina-home',
    'world-cup-jersey-brazil-home',
    'world-cup-jersey-england-nike-home',
    'world-cup-jersey-fifa-2026',
    'world-cup-jersey-spain-home',
    'world-cup-jerseys-collection',
    'world-cup-jersey-portugal-home',
  ];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        if (categoryId === 'sports-equipment') {
          const aIndex = featuredSportsJerseys.indexOf(a.id);
          const bIndex = featuredSportsJerseys.indexOf(b.id);
          if (aIndex !== -1 || bIndex !== -1) {
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          }
        }
        return b.reviewCount - a.reviewCount;
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'newest': return a.isNew ? -1 : 1;
      case 'rating': return b.rating - a.rating;
      default: return b.reviewCount - a.reviewCount;
    }
  });

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 50000]);
  };

  const hasActiveFilters = selectedSizes.length > 0 || selectedColors.length > 0;

  return (
    <div className="page-transition min-h-screen">
      {/* Header */}
      <div className="sticky top-16 md:top-20 z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="touch-target flex items-center justify-center hover:bg-muted rounded-lg md:hidden">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-display text-lg md:text-2xl font-semibold">
                  {category?.name || 'All Products'}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {sortedProducts.length} items
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
              >
                <option value="featured">Featured</option>
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>

              {/* Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(hasActiveFilters && 'border-primary text-primary')}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {selectedSizes.length + selectedColors.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedSizes.map(size => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className="filter-chip active"
                >
                  {size}
                  <X className="w-3 h-3" />
                </button>
              ))}
              {selectedColors.map(color => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className="filter-chip active"
                >
                  {color}
                  <X className="w-3 h-3" />
                </button>
              ))}
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel (Mobile) */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-border bg-card"
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Size Filter */}
            <div>
              <h3 className="font-medium text-sm mb-2">Size</h3>
              <div className="flex flex-wrap gap-2">
                {allSizes.slice(0, 10).map(size => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={cn(
                      'size-btn',
                      selectedSizes.includes(size) && 'selected'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <h3 className="font-medium text-sm mb-2">Color</h3>
              <div className="flex flex-wrap gap-2">
                {allColors.map(color => (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className={cn(
                      'filter-chip',
                      selectedColors.includes(color) && 'active'
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-medium text-sm mb-2">
                Price: KES {priceRange[0].toLocaleString()} - KES {priceRange[1].toLocaleString()}
              </h3>
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Banner */}
      {category && (
        <div className="relative h-32 md:h-48 overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/30" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-white">
                {category.name}
              </h2>
              <p className="text-white/80 mt-1 md:text-lg">{category.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="container mx-auto">
        {sortedProducts.length > 0 ? (
          <ProductGrid products={sortedProducts} columns={2} />
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products found matching your filters.</p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
