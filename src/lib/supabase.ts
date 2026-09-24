import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase credentials - Remote project with optimized timeout for local testing
const supabaseUrl = 'https://crbtwikhkqbhqkimyqay.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYnR3aWtoa3FiaHFraW15cWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjYxMDksImV4cCI6MjA4NjIwMjEwOX0.rcAdNQyKYYRnWpuSifQZ4SgPp0JbIcZY1quzTAG0a14';

// Custom fetch with timeout
const fetchWithTimeout = (url: string | URL | Request, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeoutMs = 15000; // 15 second timeout
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).catch((error) => {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw error;
  }).finally(() => {
    clearTimeout(timeoutId);
  });
};

// Create Supabase client with timeout settings
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: fetchWithTimeout,
  },
});

export { supabase };

// Database types
export interface Order {
  id?: number;
  user_id?: string;
  order_number: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_county: string;
  shipping_town: string;
  shipping_address: string;
  shipping_instructions?: string;
  payment_method: string;
  payment_status: string;
  delivery_zone: string;
  delivery_price: number;
  delivery_status: string;
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  selected_size: string;
  selected_color: string;
  color_hex?: string;
  image?: string;
}

// Order functions with better error handling
export const saveOrder = async (order: Order, items: OrderItem[]) => {
  try {
    // Insert order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (orderError) {
      console.error('Order insert error:', orderError);
      throw new Error(`Database error: ${orderError.message}`);
    }

    // Insert order items with order_id
    const itemsWithOrderId = items.map(item => ({
      ...item,
      order_id: orderData.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error('Order items insert error:', itemsError);
      throw new Error(`Database error: ${itemsError.message}`);
    }

    return orderData;
  } catch (error) {
    console.error('Save order error:', error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Get orders error:', ordersError);
      throw new Error(`Database error: ${ordersError.message}`);
    }

    // Get items for each order
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (itemsError) {
          console.error('Get order items error:', itemsError);
          return { ...order, items: [] };
        }

        return { ...order, items: items || [] };
      })
    );

    return ordersWithItems;
  } catch (error) {
    console.error('Get orders error:', error);
    throw error;
  }
};

export const getOrdersByPhone = async (phone: string) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('customer_phone', `%${phone}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get orders by phone error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (itemsError) {
          console.error('Get order items error:', itemsError);
          return { ...order, items: [] };
        }
        return { ...order, items: items || [] };
      })
    );

    return ordersWithItems;
  } catch (error) {
    console.error('Get orders by phone error:', error);
    throw error;
  }
};

// Get orders by user ID (for logged-in users)
export const getOrdersByUserId = async (userId: string) => {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Get orders by user error:', ordersError);
      throw new Error(`Database error: ${ordersError.message}`);
    }

    // Get items for each order
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (itemsError) {
          console.error('Get order items error:', itemsError);
          return { ...order, items: [] };
        }

        return { ...order, items: items || [] };
      })
    );

    return ordersWithItems;
  } catch (error) {
    console.error('Get orders by user error:', error);
    throw error;
  }
};

// Get all orders (for admin view only)
export const getAllOrders = async () => {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Get all orders error:', ordersError);
      throw new Error(`Database error: ${ordersError.message}`);
    }

    // Get items for each order
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (itemsError) {
          console.error('Get order items error:', itemsError);
          return { ...order, items: [] };
        }

        return { ...order, items: items || [] };
      })
    );

    return ordersWithItems;
  } catch (error) {
    console.error('Get all orders error:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('Update order status error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  } catch (error) {
    console.error('Update order status error:', error);
    throw error;
  }
};

export const deleteOrder = async (orderId: number) => {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Delete order error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete order error:', error);
    throw error;
  }
};
