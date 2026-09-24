import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Search, 
  Filter, 
  Phone, 
  MapPin, 
  CreditCard, 
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useOrders, Order, OrderItem } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/data/products';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ORDER_STATUSES = [
  { id: 'all', name: 'All Orders' },
  { id: 'pending', name: 'Pending' },
  { id: 'processing', name: 'Processing' },
  { id: 'shipped', name: 'Shipped' },
  { id: 'delivered', name: 'Delivered' },
  { id: 'cancelled', name: 'Cancelled' },
];

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  cod: 'bg-orange-100 text-orange-800',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  processing: <Package className="w-4 h-4" />,
  shipped: <Truck className="w-4 h-4" />,
  delivered: <CheckCircle2 className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
};

const OrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, fetchUserOrders, fetchAllOrders } = useOrders();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);

  // Admin email - change this to your email to see all orders
  const ADMIN_EMAIL = 'maishboutiquemarketing@gmail.com'; // Change to your admin email
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    // If admin, fetch all orders. Otherwise, fetch user's orders if logged in
    if (isAdmin) {
      fetchAllOrders();
      setIsAdminView(true);
    } else if (user) {
      fetchUserOrders(user.id);
      setIsAdminView(false);
    }
  }, [user, isAdmin]);

  const filteredOrders = orders.filter((order) => {
    // For non-admin users, hide cancelled orders
    if (!isAdminView && order.status === 'cancelled') {
      return false;
    }
    
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery) ||
      order.customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getWhatsAppLink = (order: Order) => {
    const message = `*New Order #${order.orderNumber}*

*Customer:* ${order.customer.firstName} ${order.customer.lastName}
*Phone:* ${order.customer.phone}
*Email:* ${order.customer.email || 'N/A'}

*Delivery Address:*
${order.shipping.address}, ${order.shipping.town}, ${order.shipping.county}
${order.shipping.instructions ? `Note: ${order.shipping.instructions}` : ''}

*Items:*
${order.items.map(item => `• ${item.name} - ${item.selectedColor} / ${item.selectedSize} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`).join('\n')}

*Payment:* ${order.payment.method} (${order.payment.status})
*Total:* ${formatPrice(order.pricing.total)}
*Status:* ${order.status}

Ready to process!`;
    
    return `https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
  };

  const sendOrderToWhatsApp = (order: Order) => {
    window.open(getWhatsAppLink(order), '_blank');
  };

  // Show message when user is not logged in
  if (!user && !isAdminView) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Login Required</h1>
          <p className="text-muted-foreground mt-2">
            Please login to view your orders
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            You need to be logged in to see your order history.
          </p>
        </motion.div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">{isAdminView ? 'No Orders Yet' : 'No Orders Found'}</h1>
          <p className="text-muted-foreground mt-2">
            {isAdminView ? 'Orders placed by customers will appear here' : 'You have not placed any orders yet'}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            {isAdminView ? `Current total orders: 0` : 'Start shopping to place your first order'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-transition">
      {/* Header */}
      <div className="sticky top-16 md:top-20 z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold">Orders</h1>
              <p className="text-sm text-muted-foreground">
                {orders.length} total orders
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders..."
                  className="h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 pl-10 pr-8 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Orders List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No orders found matching your search</p>
              </div>
            ) : (
              filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  {/* Order Header */}
                  <div 
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">#{order.orderNumber}</h3>
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1',
                            PAYMENT_STATUS_COLORS[order.payment.status]
                          )}>
                            {order.payment.status === 'cod' ? 'COD' : order.payment.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.customer.firstName} {order.customer.lastName} • {order.customer.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(order.pricing.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} items • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="p-4 space-y-4">
                          {/* Status & Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {isAdminView ? (
                              // Admin: Can update status
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Update Status:</span>
                                <select
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                                  className="h-8 px-3 rounded-lg border border-border bg-background text-sm cursor-pointer"
                                  title="Update order status"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            ) : (
                              // User: View status and can cancel or mark delivered
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Status:</span>
                                <span className={cn(
                                  'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                                  order.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                                  order.status === 'processing' && 'bg-blue-100 text-blue-800',
                                  order.status === 'shipped' && 'bg-purple-100 text-purple-800',
                                  order.status === 'delivered' && 'bg-green-100 text-green-800',
                                  order.status === 'cancelled' && 'bg-red-100 text-red-800'
                                )}>
                                  {STATUS_ICONS[order.status]}
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            )}

                            {isAdminView ? (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sendOrderToWhatsApp(order);
                                }}
                                className="bg-[#25D366] hover:bg-[#20BD5C]"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Contact Customer
                              </Button>
                            ) : (
                              // User actions: Cancel order or Mark as delivered
                              <div className="flex gap-2">
                                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateOrderStatus(order.id, 'cancelled');
                                        toast.success('Order cancelled');
                                      }}
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateOrderStatus(order.id, 'delivered');
                                        toast.success('Order marked as delivered');
                                      }}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      Delivered
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Customer Details */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Customer Details
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p>{order.customer.firstName} {order.customer.lastName}</p>
                                <p className="text-muted-foreground">{order.customer.phone}</p>
                                {order.customer.email && (
                                  <p className="text-muted-foreground">{order.customer.email}</p>
                                )}
                              </div>
                            </div>

                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Delivery Address
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p>{order.shipping.address}</p>
                                <p className="text-muted-foreground">{order.shipping.town}, {order.shipping.county}</p>
                                {order.shipping.instructions && (
                                  <p className="text-muted-foreground italic">"{order.shipping.instructions}"</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Payment & Delivery
                            </h4>
                            <div className="grid sm:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Payment Method</p>
                                <p className="font-medium">{order.payment.method}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Delivery Zone</p>
                                <p className="font-medium">{order.delivery.zone}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Order Status</p>
                                <p className="font-medium flex items-center gap-1">
                                  {STATUS_ICONS[order.status]}
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <h4 className="font-medium mb-2">Items Ordered</h4>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <OrderItemRow key={idx} item={item} />
                              ))}
                            </div>
                          </div>

                          {/* Pricing Summary */}
                          <div className="bg-primary/5 rounded-lg p-4">
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatPrice(order.pricing.subtotal)}</span>
                              </div>
                              {order.pricing.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Discount</span>
                                  <span>-{formatPrice(order.pricing.discount)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery</span>
                                <span>{order.pricing.delivery === 0 ? 'FREE' : formatPrice(order.pricing.delivery)}</span>
                              </div>
                              <div className="border-t border-primary/20 pt-2 flex justify-between font-semibold text-base">
                                <span>Total</span>
                                <span>{formatPrice(order.pricing.total)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const OrderItemRow: React.FC<{ item: OrderItem }> = ({ item }) => {
  return (
    <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-20 object-cover rounded-lg"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium line-clamp-1">{item.name}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span 
            className="w-3 h-3 rounded-full border border-border" 
            style={{ backgroundColor: item.colorHex || '#ccc' }} 
          />
          <span>{item.selectedColor}</span>
          <span>•</span>
          <span>Size: {item.selectedSize}</span>
          <span>•</span>
          <span>Qty: {item.quantity}</span>
        </div>
      </div>
      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
    </div>
  );
};

export default OrdersPage;
