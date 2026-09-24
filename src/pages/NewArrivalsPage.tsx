import React from 'react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getNewArrivals, products } from '@/data/products';

const NewArrivalsPage: React.FC = () => {
  const newArrivals = getNewArrivals();
  // Add more products for demo
  const allProducts = [...newArrivals, ...products.slice(3, 9)];

  return (
    <div className="page-transition min-h-screen">
      {/* Hero */}
      <div className="hero-section py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            ✨ Fresh Drops
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">New Arrivals</h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            The latest styles just landed. Be the first to rock these new pieces!
          </p>
        </div>
      </div>

      <div className="container mx-auto">
        <ProductGrid
          products={allProducts}
          title="Just In"
          subtitle={`${allProducts.length} new products`}
          columns={2}
        />
      </div>
    </div>
  );
};

export default NewArrivalsPage;
