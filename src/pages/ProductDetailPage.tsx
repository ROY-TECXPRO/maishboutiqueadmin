import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Share2, Minus, Plus, ShoppingBag, Check, Star, Truck, RefreshCw, Shield } from 'lucide-react';
import { products, formatPrice, calculateDiscount, categories } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductColor, Size } from '@/types';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/product/ProductGrid';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const product = products.find(p => p.id === productId);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
    product?.colors.find(c => c.available) || null
  );
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isMobileZoomed, setIsMobileZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const discount = product.originalPrice 
    ? calculateDiscount(product.originalPrice, product.price) 
    : 0;
  const category = categories.find(c => c.id === product.category);

  // Calculate price based on selected size (for products with size-specific pricing)
  const currentPrice = product.sizePrices && selectedSize 
    ? product.sizePrices[selectedSize] 
    : product.price;

  // Related products
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      toast.error('Please select a size');
      return;
    }
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }

    // Add item with the current price (which includes size-specific pricing if applicable)
    addItem({ ...product, price: currentPrice }, selectedSize, selectedColor, quantity);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        text: `Check out ${product.name} at Maish Fashion Boutique`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleImageClick = () => {
    // On mobile, open fullscreen zoom
    if (window.innerWidth < 768) {
      setIsMobileZoomed(true);
    } else {
      setIsZoomed(!isZoomed);
    }
  };

  return (
    <div className="page-transition">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.category}`} className="hover:text-foreground">
            {category?.name}
          </Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-0 md:px-4 pb-8">
        <div className="grid md:grid-cols-2 gap-0 md:gap-10">
          {/* Image Gallery - Full width on mobile */}
          <div className="relative w-full max-w-full overflow-hidden">
            {/* Back Button - Mobile */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center md:hidden"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Wishlist & Share - Mobile */}
            <div className="absolute top-4 right-4 z-10 flex gap-2 md:hidden">
              <button
                onClick={() => toggleItem(product)}
                className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={cn('w-5 h-5', isWishlisted && 'fill-primary text-primary')} />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
                aria-label="Share product"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image - Full width on mobile with proper centering */}
            <div 
              ref={imageRef}
              className="relative w-full aspect-square md:aspect-[3/4] rounded-none md:rounded-xl overflow-hidden bg-muted cursor-zoom-in"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
            >
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={product.images[selectedImage]?.src}
                    alt={product.images[selectedImage]?.alt || product.name}
                    className="w-full h-full object-contain"
                    style={{
                      transform: isZoomed ? 'scale(2)' : 'scale(1)',
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                      transition: isZoomed ? 'none' : 'transform 0.3s ease-out'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </AnimatePresence>
              </div>

              {/* Badges */}
              {product.isSale && discount > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-sale text-white text-sm font-semibold rounded-lg">
                  -{discount}% OFF
                </span>
              )}
              {product.isNew && !product.isSale && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-foreground text-background text-sm font-semibold rounded-lg">
                  NEW
                </span>
              )}

              {/* Zoom Indicator */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-lg text-xs text-muted-foreground md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                  <path d="M11 8v6"/>
                  <path d="M8 11h6"/>
                </svg>
                <span>Tap to zoom</span>
              </div>

              {/* Image Navigation - Better positioned on mobile */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                    className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-10 md:h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background shadow-md"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-10 md:h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background shadow-md"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery - Full width on mobile */}
            {product.images.length > 1 && (
              <div className="flex gap-1 md:gap-1.5 mt-2 md:mt-3 overflow-x-auto scrollbar-hide pb-1 px-0 md:px-0">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'w-10 h-12 md:w-14 md:h-16 lg:w-16 lg:h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all',
                      i === selectedImage ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img.src} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Full width on mobile */}
          <div className="md:py-4 px-3 md:px-0">
            {/* Title & Actions */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="font-display text-xl md:text-3xl font-bold">
                  {product.name}
                </h1>
                <p className="text-muted-foreground mt-1">{product.subcategory}</p>
              </div>
              
              {/* Desktop Actions */}
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => toggleItem(product)}
                  className="w-11 h-11 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Heart className={cn('w-5 h-5', isWishlisted && 'fill-primary text-primary')} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-11 h-11 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className={cn(
                'text-2xl md:text-3xl font-bold',
                product.isSale && 'text-sale'
              )}>
                {formatPrice(currentPrice)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Color Selection */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Color</span>
                <span className="text-sm text-muted-foreground">{selectedColor?.name || 'Select color'}</span>
              </div>
              <div className="flex gap-2">
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => color.available && setSelectedColor(color)}
                    disabled={!color.available}
                    className={cn(
                      'color-btn',
                      !color.available && 'opacity-30 cursor-not-allowed',
                      selectedColor?.name === color.name && 'selected'
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor?.name === color.name && (
                      <Check className={cn(
                        'w-4 h-4 mx-auto',
                        color.hex === '#ffffff' ? 'text-foreground' : 'text-white'
                      )} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Size</span>
                <button className="text-sm text-primary hover:underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                    className={cn(
                      'size-btn',
                      selectedSize === size && 'selected',
                      sizeError && !selectedSize && 'border-destructive'
                    )}
                  >
                    <span>{size}</span>
                    {product.sizePrices && product.sizePrices[size] && (
                      <span className="text-xs ml-1 opacity-70">
                        {formatPrice(product.sizePrices[size])}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p className="text-destructive text-sm mt-2">Please select a size</p>
              )}
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <span className="font-medium block mb-3">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="quantity-btn"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="quantity-btn"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-muted-foreground ml-2">
                  {product.stock} in stock
                </span>
              </div>
            </div>

            {/* Add to Cart - Smaller on mobile */}
            <div className="mt-4 md:mt-8 flex gap-2 md:gap-3">
              <Button
                className="flex-1 h-11 md:h-14 text-sm md:text-base"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Add to Cart - {formatPrice(currentPrice * quantity)}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: Truck, label: 'Free delivery over KES 5K' },
                { icon: RefreshCw, label: '7-day returns' },
                { icon: Shield, label: 'Secure checkout' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-secondary">
                  <Icon className="w-5 h-5 mx-auto text-primary mb-1" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="font-medium mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              
              {product.features && (
                <ul className="mt-4 space-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* SKU */}
            <p className="text-xs text-muted-foreground mt-6">SKU: {product.sku}</p>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <ProductGrid
            products={relatedProducts}
            title="You May Also Like"
            viewAllLink={`/category/${product.category}`}
          />
        )}
      </div>

      {/* Mobile Fullscreen Zoom Modal */}
      <AnimatePresence>
        {isMobileZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center md:hidden"
            onClick={() => setIsMobileZoomed(false)}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white z-10"
              onClick={() => setIsMobileZoomed(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>

            {/* Image */}
            <motion.img
              src={product.images[selectedImage]?.src}
              alt={product.images[selectedImage]?.alt || product.name}
              className="w-full h-full object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            />

            {/* Image counter */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                {selectedImage + 1} / {product.images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;
