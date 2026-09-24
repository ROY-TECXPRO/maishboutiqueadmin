import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, ProductColor, Size } from '@/types';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  addItem: (product: Product, size: Size, color: ProductColor, quantity?: number) => void;
  removeItem: (productId: string, size: Size, colorName: string) => void;
  updateQuantity: (productId: string, size: Size, colorName: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string, size: Size, colorName: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const SHIPPING_THRESHOLD = 5000; // Free shipping over KES 5000
const SHIPPING_COST = 300;

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('maish-cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('maish-cart', JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const addItem = (product: Product, size: Size, color: ProductColor, quantity = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && 
               item.selectedSize === size && 
               item.selectedColor.name === color.name
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        toast.success('Updated cart quantity');
        return updated;
      }

      toast.success('Added to cart');
      return [...prev, { product, quantity, selectedSize: size, selectedColor: color }];
    });
  };

  const removeItem = (productId: string, size: Size, colorName: string) => {
    setItems(prev => prev.filter(
      item => !(item.product.id === productId && 
               item.selectedSize === size && 
               item.selectedColor.name === colorName)
    ));
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId: string, size: Size, colorName: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size, colorName);
      return;
    }

    setItems(prev => prev.map(item => 
      item.product.id === productId && 
      item.selectedSize === size && 
      item.selectedColor.name === colorName
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setItems([]);
    toast.success('Cart cleared');
  };

  const isInCart = (productId: string, size: Size, colorName: string) => {
    return items.some(
      item => item.product.id === productId && 
             item.selectedSize === size && 
             item.selectedColor.name === colorName
    );
  };

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotal,
      shipping,
      total,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
