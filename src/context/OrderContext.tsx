import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { saveOrder as saveOrderToSupabase, getOrders, getOrdersByPhone, getOrdersByUserId, getAllOrders, updateOrderStatus as updateOrderStatusSupabase, Order as SupabaseOrder, OrderItem as SupabaseOrderItem } from '@/lib/supabase';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  colorHex?: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  shipping: {
    county: string;
    town: string;
    address: string;
    instructions: string;
  };
  items: OrderItem[];
  payment: {
    method: string;
    status: 'pending' | 'paid' | 'cod';
  };
  delivery: {
    zone: string;
    price: number;
    status: 'pending' | 'shipped' | 'delivered';
  };
  pricing: {
    subtotal: number;
    discount: number;
    delivery: number;
    total: number;
  };
  createdAt: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  userId?: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  getOrder: (orderId: string) => Order | undefined;
  getOrdersByPhone: (phone: string) => Order[];
  fetchUserOrders: (userId: string) => Promise<void>;
  fetchAllOrders: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Transform Supabase order to local order format
const transformSupabaseOrder = (supabaseOrder: SupabaseOrder & { items?: SupabaseOrderItem[] }): Order => ({
  id: supabaseOrder.id?.toString() || '',
  orderNumber: supabaseOrder.order_number,
  userId: supabaseOrder.user_id,
  customer: {
    firstName: supabaseOrder.customer_first_name,
    lastName: supabaseOrder.customer_last_name,
    phone: supabaseOrder.customer_phone,
    email: supabaseOrder.customer_email || '',
  },
  shipping: {
    county: supabaseOrder.shipping_county,
    town: supabaseOrder.shipping_town,
    address: supabaseOrder.shipping_address,
    instructions: supabaseOrder.shipping_instructions || '',
  },
  items: (supabaseOrder.items || []).map((item) => ({
    productId: item.product_id,
    name: item.product_name,
    price: item.price,
    quantity: item.quantity,
    selectedSize: item.selected_size,
    selectedColor: item.selected_color,
    colorHex: item.color_hex,
    image: item.image || '',
  })),
  payment: {
    method: supabaseOrder.payment_method,
    status: supabaseOrder.payment_status as 'pending' | 'paid' | 'cod',
  },
  delivery: {
    zone: supabaseOrder.delivery_zone,
    price: supabaseOrder.delivery_price,
    status: supabaseOrder.delivery_status as 'pending' | 'shipped' | 'delivered',
  },
  pricing: {
    subtotal: supabaseOrder.subtotal,
    discount: supabaseOrder.discount,
    delivery: supabaseOrder.delivery_price,
    total: supabaseOrder.total,
  },
  createdAt: new Date(supabaseOrder.created_at || Date.now()),
  status: supabaseOrder.status as Order['status'],
});

// Transform local order to Supabase format
const transformToSupabaseOrder = (order: Omit<Order, 'id' | 'createdAt'>): { order: SupabaseOrder; items: SupabaseOrderItem[] } => ({
  order: {
    order_number: order.orderNumber,
    user_id: order.userId,
    customer_first_name: order.customer.firstName,
    customer_last_name: order.customer.lastName,
    customer_phone: order.customer.phone,
    customer_email: order.customer.email,
    shipping_county: order.shipping.county,
    shipping_town: order.shipping.town,
    shipping_address: order.shipping.address,
    shipping_instructions: order.shipping.instructions,
    payment_method: order.payment.method,
    payment_status: order.payment.status,
    delivery_zone: order.delivery.zone,
    delivery_price: order.delivery.price,
    delivery_status: order.delivery.status,
    subtotal: order.pricing.subtotal,
    discount: order.pricing.discount,
    total: order.pricing.total,
    status: order.status,
  },
  items: order.items.map((item) => ({
    product_id: item.productId,
    product_name: item.name,
    price: item.price,
    quantity: item.quantity,
    selected_size: item.selectedSize,
    selected_color: item.selectedColor,
    color_hex: item.colorHex,
    image: item.image,
  })),
});

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const supabaseOrders = await getOrders();
      setOrders(supabaseOrders.map(transformSupabaseOrder));
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      const { order: supabaseOrder, items } = transformToSupabaseOrder(orderData);
      await saveOrderToSupabase(supabaseOrder, items);
      
      // Refresh orders
      await fetchOrders();
    } catch (err) {
      console.error('Error saving order:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatusSupabase(parseInt(orderId), status);
      
      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  const getOrder = (orderId: string) => {
    return orders.find((order) => order.id === orderId);
  };

  const getOrdersByPhone = (phone: string) => {
    return orders.filter((order) =>
      order.customer.phone.includes(phone)
    );
  };

  const fetchUserOrders = async (userId: string) => {
    try {
      setLoading(true);
      const supabaseOrders = await getOrdersByUserId(userId);
      setOrders(supabaseOrders.map(transformSupabaseOrder));
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setError('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const supabaseOrders = await getAllOrders();
      setOrders(supabaseOrders.map(transformSupabaseOrder));
    } catch (err) {
      console.error('Error fetching all orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        getOrder,
        getOrdersByPhone,
        fetchUserOrders,
        fetchAllOrders,
        loading,
        error,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
