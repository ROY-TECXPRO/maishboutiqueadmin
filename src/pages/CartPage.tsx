import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ChevronRight, ArrowLeft, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/products';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, itemCount, subtotal, shipping, total, updateQuantity, removeItem, clearCart } = useCart();
  const [promoCode, setPromoCode] = React.useState('');
  const [promoApplied, setPromoApplied] = React.useState(false);
  const [promoError, setPromoError] = React.useState('');

  const handleApplyPromo = () => {
    // Weekend flash sale: Only Friday (5), Saturday (6), and Sunday (0)
    // Using Kenya timezone (UTC+3)
    const now = new Date();
    const kenyaTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const day = kenyaTime.getDay();
    const isWeekend = day === 5 || day === 6 || day === 0;
    
    setPromoError('');
    
    if (promoCode.toUpperCase() === '332211') {
      if (isWeekend) {
        setPromoApplied(true);
      } else {
        setPromoError('Code 332211 is only valid on Friday, Saturday, and Sunday');
      }
    } else {
      setPromoError('Invalid promo code');
    }
  };

  const discount = promoApplied ? subtotal * 0.15 : 0;
  const finalTotal = total - discount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Your Cart is Empty</h1>
          <p className="text-muted-foreground mt-2">
            Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link to="/">Start Shopping</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-transition min-h-screen">
      {/* Header */}
      <div className="sticky top-16 md:top-20 z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="touch-target flex items-center justify-center hover:bg-muted rounded-lg md:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-display text-lg md:text-2xl font-semibold">Shopping Cart</h1>
                <p className="text-xs md:text-sm text-muted-foreground">{itemCount} items</p>
              </div>
            </div>
            <button
              onClick={clearCart}
              className="text-sm text-destructive hover:underline"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor.name}`}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-4 p-4 bg-card rounded-xl border border-border"
                >
                  {/* Product Image */}
                  <Link
                    to={`/product/${item.product.id}`}
                    className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    <img
                      src={item.product.images[0]?.src}
                      alt={item.product.images[0]?.alt || item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.id}`}
                      className="font-medium hover:text-primary line-clamp-2"
                    >
                      {item.product.name}
                    </Link>

                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span
                          className="w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        {item.selectedColor.name}
                      </span>
                      <span>•</span>
                      <span>Size: {item.selectedSize}</span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor.name,
                            item.quantity - 1
                          )}
                          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor.name,
                            item.quantity + 1
                          )}
                          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price & Remove */}
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeItem(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor.name
                          )}
                          className="text-destructive text-sm hover:underline mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-5 sticky top-36">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code"
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
                      disabled={promoApplied}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode}
                  >
                    Apply
                  </Button>
                </div>
                {promoApplied && (
                  <p className="text-success text-sm mt-2">✓ 332211 applied - 15% off!</p>
                )}
                {promoError && (
                  <p className="text-destructive text-sm mt-2">{promoError}</p>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-success">
                    <span>Discount (15%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Free shipping on orders over KES 5,000
                  </p>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Button size="lg" className="w-full mt-6 h-12" asChild>
                <Link to="/checkout">
                  Proceed to Checkout
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <div className="mt-4 text-center">
                <Link to="/" className="text-sm text-primary hover:underline">
                  Continue Shopping
                </Link>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center mb-3">We accept</p>
                <div className="flex justify-center gap-3">
                  <div className="px-3 py-1.5 bg-[#4CAF50] text-white text-xs font-bold rounded">M-PESA</div>
                  <div className="px-3 py-1.5 bg-[#1a1f71] text-white text-xs font-bold rounded">VISA</div>
                  <div className="px-3 py-1.5 bg-[#eb001b] text-white text-xs font-bold rounded">MC</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
