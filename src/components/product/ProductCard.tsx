import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, ProductImage } from '@/types';
import { formatPrice, calculateDiscount } from '@/data/products';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
}

/**
 * LazyImage - Optimized image component with lazy loading and blur placeholder
 * Never imports images directly into JS bundles
 */
const LazyImage: React.FC<{
  src: string;
  alt: string;
  className: string;
}> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate placeholder color based on product name hash for consistency
  const placeholderColor = useMemo(() => {
    const colors = ['bg-gray-200', 'bg-gray-300', 'bg-gray-100', 'bg-gray-400'];
    const hash = alt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, [alt]);

  if (hasError) {
    return (
      <div className={cn(className, 'flex items-center justify-center bg-gray-100')}>
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', placeholderColor, !isLoaded && 'animate-pulse')}>
      <img
        src={src}
        alt={alt}
        className={cn(
          className,
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'default' }) => {
  const { isInWishlist, toggleItem } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  // Get first image with proper structure
  const primaryImage: ProductImage = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    // Fallback placeholder if no images
    return {
      src: '/placeholder.svg',
      alt: product.name,
    };
  }, [product.images, product.name]);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'fashion-card group touch-manipulation',
        variant === 'compact' && 'text-sm',
        variant === 'featured' && 'md:flex md:flex-row'
      )}
    >
      <Link to={`/product/${product.id}`} className={cn(
        'product-image-container block relative aspect-[3/4]',
        variant === 'featured' && 'md:w-1/2'
      )}>
        <LazyImage
          src={primaryImage.src}
          alt={primaryImage.alt}
          className="w-full h-full object-contain"
        />

        {/* Badges */}
        {product.isSale && discount > 0 && (
          <span className="sale-badge">-{discount}%</span>
        )}
        {product.isNew && !product.isSale && (
          <span className="new-badge">NEW</span>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
      </Link>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleItem(product);
        }}
        className="wishlist-btn"
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className={cn(
            'w-5 h-5 transition-colors',
            isWishlisted ? 'fill-primary text-primary' : 'text-foreground/70'
          )}
        />
      </button>

      {/* Product Info */}
      <div className={cn(
        'p-2.5 md:p-4',
        variant === 'featured' && 'md:w-1/2 md:flex md:flex-col md:justify-center'
      )}>
        <Link to={`/product/${product.id}`}>
          <h3 className={cn(
            'font-medium line-clamp-2 hover:text-primary transition-colors',
            variant === 'compact' ? 'text-sm' : 'text-base'
          )}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={cn(
                  'w-3.5 h-3.5',
                  i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Colors Available */}
        <div className="flex items-center gap-1 mt-2">
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color.name}
              className="w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-xs text-muted-foreground ml-1">
              +{product.colors.length - 4}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className={cn('price', product.isSale && 'price-sale')}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="price-original">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Tags Preview */}
        {variant === 'featured' && product.tags && product.tags.length > 0 && (
          <div className="hidden md:flex flex-wrap gap-1 mt-3">
            {product.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-secondary rounded-md"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 4 && (
              <span className="px-2 py-0.5 text-xs bg-secondary rounded-md">
                +{product.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Sizes Preview */}
        {variant === 'featured' && (
          <div className="hidden md:flex flex-wrap gap-1 mt-3">
            {product.sizes.slice(0, 5).map(size => (
              <span
                key={size}
                className="px-2 py-0.5 text-xs bg-secondary rounded-md"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 5 && (
              <span className="px-2 py-0.5 text-xs bg-secondary rounded-md">
                +{product.sizes.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
};

export default ProductCard;
