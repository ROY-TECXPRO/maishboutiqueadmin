import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact';
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title,
  subtitle,
  viewAllLink,
  columns = 2,
  variant = 'default',
  className,
}) => {
  return (
    <section className={cn('py-6 md:py-10', className)}>
      {(title || viewAllLink) && (
        <div className="flex items-end justify-between mb-4 md:mb-6 px-4 md:px-0">
          <div>
            {title && (
              <h2 className="font-display text-xl md:text-2xl font-semibold">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      <div className={cn(
        'grid gap-2 md:gap-4 px-1 md:px-0',
        columns === 2 && 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4',
        columns === 3 && 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4',
        columns === 4 && 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
      )}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            variant={variant}
          />
        ))}
      </div>
    </section>
  );
};
