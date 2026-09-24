import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/products';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const WishlistPage: React.FC = () => {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (product: typeof items[0]) => {
    const defaultSize = product.sizes[0];
    const defaultColor = product.colors.find(c => c.available) || product.colors[0];
    
    addItem(product, defaultSize, defaultColor, 1);
    toast.success('Added to cart with default options. You can change size/color in cart.');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mt-2">
            Save items you love by tapping the heart icon on any product.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link to="/">Explore Products</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-transition min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground mt-1">{items.length} saved items</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {items.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <Link to={`/product/${product.id}`} className="block aspect-[3/4] relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.isSale && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-sale text-white text-xs font-semibold rounded">
                      SALE
                    </span>
                  )}
                </Link>

                <div className="p-4">
                  <Link to={`/product/${product.id}`} className="font-medium hover:text-primary line-clamp-2">
                    {product.name}
                  </Link>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-semibold">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
