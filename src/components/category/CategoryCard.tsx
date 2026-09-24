import React from 'react';
import { Link } from 'react-router-dom';
import { CategoryInfo } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: CategoryInfo;
  variant?: 'default' | 'compact' | 'large';
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, variant = 'default' }) => {
  return (
    <Link to={`/category/${category.id}`}>
      <motion.article
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative rounded-2xl overflow-hidden group',
          variant === 'compact' && 'aspect-square',
          variant === 'default' && 'aspect-[3/4]',
          variant === 'large' && 'aspect-[4/5] md:aspect-[3/4]'
        )}
      >
        <img
          src={category.image}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
          <h3 className={cn(
            'font-display font-semibold text-white',
            variant === 'compact' ? 'text-sm' : 'text-lg md:text-xl'
          )}>
            {category.shortName}
          </h3>
          {variant !== 'compact' && (
            <p className="text-white/80 text-xs md:text-sm mt-0.5 line-clamp-1">
              {category.description}
            </p>
          )}
        </div>

        {/* Color Accent */}
        <div
          className="absolute top-3 right-3 w-3 h-3 rounded-full opacity-80"
          style={{ backgroundColor: category.color }}
        />
      </motion.article>
    </Link>
  );
};

interface CategoryGridProps {
  categories: CategoryInfo[];
  variant?: 'scroll' | 'grid';
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, variant = 'scroll' }) => {
  if (variant === 'scroll') {
    return (
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 py-2">
        <div className="flex gap-3 w-max">
          {categories.map(cat => (
            <div key={cat.id} className="w-36 md:w-44 flex-shrink-0">
              <CategoryCard category={cat} variant="compact" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 px-2 md:px-0">
      {categories.map(cat => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  );
};
