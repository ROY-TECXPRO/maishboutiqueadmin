import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, TrendingUp, Clock, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { searchProducts, categories, products } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';
import { cn } from '@/lib/utils';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('maish-recent-searches');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Memoized search results - only recalculate when query or category changes
  const results = useMemo(() => {
    return searchProducts(query).filter(
      product => !selectedCategory || product.category === selectedCategory
    );
  }, [query, selectedCategory]);

  useEffect(() => {
    // Get initial query from URL params if present
    const urlQuery = searchParams.get('q');
    if (urlQuery && !query) {
      setQuery(urlQuery);
    }
  }, []);

  // Update URL when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, setSearchParams]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    // Save to recent searches
    if (searchQuery.trim()) {
      const updated = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('maish-recent-searches', JSON.stringify(updated));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('maish-recent-searches');
  };

  const popularSearches = ['ankara dress', 'men suits', 'school uniform', 'handbags', 'sports shoes', 'world cup jersey', 'world cup fan zone', 'france jersey'];

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header - Fixed */}
      <div className="sticky top-0 z-50 bg-background border-b border-border safe-top">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="touch-target flex items-center justify-center hover:bg-muted rounded-lg md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    handleSearch(query.trim());
                  }
                }}
                placeholder="Search for products..."
                className="search-input pr-10"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'touch-target flex items-center justify-center border border-border rounded-xl',
                showFilters && 'bg-primary text-primary-foreground border-primary'
              )}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filter Pills */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      'category-pill whitespace-nowrap',
                      !selectedCategory && 'active'
                    )}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        'category-pill whitespace-nowrap',
                        selectedCategory === cat.id && 'active'
                      )}
                    >
                      {cat.shortName}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Content */}
      <div className="container mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {query ? (
            // Search Results
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm text-muted-foreground mb-4">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </p>

              {results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {results.map(product => (
                    <ProductCard key={product.id} product={product} variant="compact" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                    <SearchIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">No results found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or browse categories
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Search tips: Try using color names like "blue", "black", or "pink"
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            // Empty State - Suggestions
            <motion.div
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-sm text-primary hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(search => (
                      <button
                        key={search}
                        onClick={() => handleSearch(search)}
                        className="filter-chip"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4" />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map(search => (
                    <button
                      key={search}
                      onClick={() => handleSearch(search)}
                      className="filter-chip"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse Categories */}
              <div>
                <h3 className="font-medium mb-3">Browse Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {categories.slice(0, 6).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => navigate(`/category/${cat.id}`)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-lg">
                        {cat.shortName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cat.shortName}</p>
                        <p className="text-xs text-muted-foreground">
                          {products.filter(p => p.category === cat.id).length} items
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchPage;
