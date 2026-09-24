import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Check, 
  CreditCard, 
  Phone, 
  MapPin, 
  Truck, 
  Wallet,
  ChevronRight,
  CheckCircle2,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  LogIn,
  MessageCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/data/products';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/lib/supabase';

// Delivery zones with pricing
const DELIVERY_ZONES = [
  { id: 'narok-town', name: 'Narok Town', price: 0, description: 'Free delivery within town' },
  { id: 'narok-county', name: 'Narok County', price: 200, description: 'Delivery to other areas in Narok County' },
  { id: 'nairobi', name: 'Nairobi', price: 350, description: 'Doorstep delivery in Nairobi' },
  { id: 'other', name: 'Other Counties', price: 500, description: 'Delivery to other counties in Kenya' },
];

// Payment methods
const PAYMENT_METHODS = [
  {
    id: 'mpesa',
    name: 'M-Pesa',
    icon: 'M',
    description: 'Pay via STK push or manually',
    color: '#4CAF50',
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: 'COD',
    description: 'Pay when you receive your order',
    color: '#FF9800',
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: '💳',
    description: 'Visa, Mastercard',
    color: '#1a1f71',
  },
  {
    id: 'whatsapp',
    name: 'Order via WhatsApp',
    icon: '💬',
    description: 'Send your order details via WhatsApp',
    color: '#25D366',
  },
];

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  county: string;
  town: string;
  address: string;
  instructions: string;
  otherCounty: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [selectedZone, setSelectedZone] = useState(DELIVERY_ZONES[0]);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0]);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Account creation - Required for checkout
  const [createAccount, setCreateAccount] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // WhatsApp number
  const WHATSAPP_NUMBER = '254799921036';

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    county: '',
    town: '',
    address: '',
    instructions: '',
    otherCounty: '',
  });

  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});

  const discount = promoApplied ? subtotal * 0.15 : 0;
  const finalTotal = subtotal - discount + selectedZone.price;

  const validateShipping = () => {
    const newErrors: Partial<ShippingInfo> = {};
    
    if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!shippingInfo.county.trim()) newErrors.county = 'County is required';
    if (!shippingInfo.town.trim()) newErrors.town = 'Town is required';
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';

    // Validate other county if Other Counties is selected
    if (selectedZone.id === 'other' && !shippingInfo.otherCounty.trim()) {
      newErrors.otherCounty = 'Please specify your county';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (validateShipping()) {
      setCurrentStep('payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlaceOrder = async () => {
    // Validate that user is logged in or will create account
    if (!user && createAccount && !password) {
      setSubmitError('Please create a password to continue');
      toast.error('Please create a password');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Generate order number
      const orderNum = 'MF-' + Date.now().toString(36).toUpperCase();
      
      // If user wants to create account and is not logged in
      let userId = user?.id;
      
      if (createAccount && !user && shippingInfo.email && password) {
        try {
          // Check if profile already exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', shippingInfo.email.toLowerCase())
            .single();

          if (!existingProfile) {
            // Create auth user
            const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
              email: shippingInfo.email.toLowerCase(),
              password: password,
              options: {
                data: {
                  full_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                  phone: shippingInfo.phone,
                },
              },
            });

            if (newUser) {
              userId = newUser.id;
              // Create profile
              await supabase.from('profiles').upsert({
                id: newUser.id,
                email: shippingInfo.email.toLowerCase(),
                full_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                phone: shippingInfo.phone,
                county: shippingInfo.county,
                town: shippingInfo.town,
                address: shippingInfo.address,
              });
            }
          }
        } catch (accountError) {
          console.error('Account creation error:', accountError);
        }
      }
      
      // Save order to Supabase - userId will be null if not logged in
      await addOrder({
        orderNumber: orderNum,
        customer: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          phone: shippingInfo.phone,
          email: shippingInfo.email,
        },
        shipping: {
          county: selectedZone.id === 'other' && shippingInfo.otherCounty ? shippingInfo.otherCounty : shippingInfo.county,
          town: shippingInfo.town,
          address: shippingInfo.address,
          instructions: shippingInfo.instructions,
        },
        items: items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor.name,
          colorHex: item.selectedColor.hex,
          image: item.product.images[0]?.src || '',
        })),
        payment: {
          method: selectedPayment.name,
          status: selectedPayment.id === 'cod' ? 'cod' : 'pending',
        },
        delivery: {
          zone: selectedZone.name,
          price: selectedZone.price,
          status: 'pending',
        },
        pricing: {
          subtotal,
          discount,
          delivery: selectedZone.price,
          total: finalTotal,
        },
        status: 'pending',
        userId: userId,
      });
      
      setOrderNumber(orderNum);
      setOrderPlaced(true);
      clearCart();
      setCurrentStep('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Order placed successfully!');
      
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Check for table missing error
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      
      if (errorMessage.includes('relation') || errorMessage.includes('does not exist') || errorMessage.includes('database')) {
        setSubmitError('Database not set up. Please run the SQL schema in Supabase first.');
        toast.error('Database not set up. Please contact support.');
      } else {
        setSubmitError(errorMessage);
        toast.error('Failed to place order');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('shipping');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('payment');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle WhatsApp order
  const handleWhatsAppOrder = () => {
    // Build the order message
    let message = `*New Order from Maish Style Shop*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${shippingInfo.firstName} ${shippingInfo.lastName}\n`;
    message += `Phone: ${shippingInfo.phone}\n`;
    if (shippingInfo.email) message += `Email: ${shippingInfo.email}\n`;
    message += `\n*Shipping Address:*\n`;
    message += `${shippingInfo.address}, ${shippingInfo.town}, ${shippingInfo.county}\n`;
    if (shippingInfo.instructions) message += `Instructions: ${shippingInfo.instructions}\n`;
    message += `\n*Delivery Zone:* ${selectedZone.name}${selectedZone.id === 'other' && shippingInfo.otherCounty ? ` (${shippingInfo.otherCounty})` : ''}\n`;
    message += `\n*Order Items:*\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   Size: ${item.selectedSize}, Color: ${item.selectedColor.name}\n`;
      message += `   Qty: ${item.quantity} x ${formatPrice(item.product.price)} = ${formatPrice(item.product.price * item.quantity)}\n\n`;
    });
    
    message += `------------------\n`;
    message += `*Subtotal:* ${formatPrice(subtotal)}\n`;
    if (promoApplied) {
      message += `*Discount (15%):* -${formatPrice(discount)}\n`;
    }
    message += `*Delivery:* ${selectedZone.price === 0 ? 'FREE' : formatPrice(selectedZone.price)}\n`;
    message += `*TOTAL:* ${formatPrice(finalTotal)}\n\n`;
    message += `Please confirm this order. Thank you!`;
    
    // Encode the message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with the message
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Show success message
    toast.success('WhatsApp opened! Send your order details.');
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
            <CreditCard className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">No Items to Checkout</h1>
          <p className="text-muted-foreground mt-2">
            Add some items to your cart first
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link to="/">Start Shopping</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-14 h-14 text-success" />
          </div>
          <h1 className="font-display text-2xl font-bold text-success mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your order. We'll process it right away.
          </p>
          
          <div className="bg-card rounded-xl border border-border p-5 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <p className="font-mono text-xl font-bold">{orderNumber}</p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{items.length} products</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{selectedZone.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span>{selectedPayment.name}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button size="lg" className="w-full" asChild>
              <Link to="/">Continue Shopping</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link to="/orders">View My Orders</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-transition">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
        onSuccess={() => {
          setShowAuthModal(false);
          toast.success('Welcome back! You can now checkout faster.');
        }}
      />
      
      {/* Header */}
      <div className="sticky top-16 md:top-20 z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="touch-target flex items-center justify-center hover:bg-muted rounded-lg"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-display text-lg md:text-2xl font-semibold">Checkout</h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {currentStep === 'shipping' && 'Step 1 of 2 - Shipping Details'}
                  {currentStep === 'payment' && 'Step 2 of 2 - Payment Method'}
                  {currentStep === 'confirmation' && 'Order Confirmed'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            {['shipping', 'payment'].map((step, index) => (
              <React.Fragment key={step}>
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    currentStep === step
                      ? 'bg-primary text-primary-foreground'
                      : index < ['shipping', 'payment'].indexOf(currentStep)
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {index < ['shipping', 'payment'].indexOf(currentStep) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">{step === 'shipping' ? 'Shipping' : 'Payment'}</span>
                </div>
                {index < 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Shipping Step */}
              {currentStep === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Contact Info */}
                  <div className="bg-card rounded-xl border border-border p-5">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      Contact Information
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name *</label>
                        <input
                          type="text"
                          value={shippingInfo.firstName}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                          className={cn(
                            'w-full h-11 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20',
                            errors.firstName ? 'border-destructive' : 'border-border'
                          )}
                          placeholder="First name"
                        />
                        {errors.firstName && (
                          <p className="text-destructive text-sm mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name *</label>
                        <input
                          type="text"
                          value={shippingInfo.lastName}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                          className={cn(
                            'w-full h-11 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20',
                            errors.lastName ? 'border-destructive' : 'border-border'
                          )}
                          placeholder="Last name"
                        />
                        {errors.lastName && (
                          <p className="text-destructive text-sm mt-1">{errors.lastName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                          className={cn(
                            'w-full h-11 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20',
                            errors.phone ? 'border-destructive' : 'border-border'
                          )}
                          placeholder="07XX XXX XXX"
                        />
                        {errors.phone && (
                          <p className="text-destructive text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                        <input
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                          className="w-full h-11 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Create Account Section - OPTIONAL */}
                  {!user && (
                    <div className="bg-card rounded-xl border border-border p-5">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="createAccount"
                          checked={createAccount}
                          onChange={(e) => setCreateAccount(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <label htmlFor="createAccount" className="font-medium flex items-center gap-2 cursor-pointer">
                            <User className="w-4 h-4" />
                            Create an account for faster checkout
                          </label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Save your details and track your orders. Next time you visit, just sign in!
                          </p>
                          
                          {createAccount && (
                            <div className="mt-4 grid sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Create Password *</label>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-11 pl-10 pr-10 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20"
                                    placeholder="Create password"
                                    minLength={6}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                  >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  className="w-full h-11 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20"
                                  placeholder="Confirm password"
                                />
                              </div>
                            </div>
                          )}
                          
                          {!createAccount && (
                            <p className="text-sm text-muted-foreground mt-3">
                              Already have an account?{' '}
                              <button
                                type="button"
                                onClick={() => setShowAuthModal(true)}
                                className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                              >
                                <LogIn className="w-4 h-4" />
                                Sign in
                              </button>
                            </p>
                          )}
                          
                          {accountError && (
                            <p className="text-destructive text-sm mt-2">{accountError}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {user && (
                    <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                      <p className="text-success flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Logged in as {user.email} - Your orders will be saved!
                      </p>
                    </div>
                  )}

                  {/* Delivery Address */}
                  <div className="bg-card rounded-xl border border-border p-5">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Delivery Address
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">County *</label>
                        <select
                          value={shippingInfo.county}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, county: e.target.value })}
                          className={cn(
                            'w-full h-11 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20',
                            errors.county ? 'border-destructive' : 'border-border'
                          )}
                          aria-label="Select county"
                        >
                          <option value="">Select county</option>
                          <option value="Narok">Narok</option>
                          <option value="Nairobi">Nairobi</option>
                          <option value="Kajiado">Kajiado</option>
                          <option value="Mombasa">Mombasa</option>
                          <option value="Kisumu">Kisumu</option>
                          <option value="Nakuru">Nakuru</option>
                          <option value="Eldoret">Eldoret</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.county && (
                          <p className="text-destructive text-sm mt-1">{errors.county}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Town/Area *</label>
                        <input
                          type="text"
                          value={shippingInfo.town}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, town: e.target.value })}
                          className={cn(
                            'w-full h-11 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20',
                            errors.town ? 'border-destructive' : 'border-border'
                          )}
                          placeholder="e.g., Narok Town, Kileleshwa"
                        />
                        {errors.town && (
                          <p className="text-destructive text-sm mt-1">{errors.town}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Street Address *</label>
                        <input
                          type="text"
                          value={shippingInfo.address}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                          className={cn(
                            'w-full h-11 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20',
                            errors.address ? 'border-destructive' : 'border-border'
                          )}
                          placeholder="House number, street name"
                        />
                        {errors.address && (
                          <p className="text-destructive text-sm mt-1">{errors.address}</p>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">Special Instructions (Optional)</label>
                        <textarea
                          value={shippingInfo.instructions}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, instructions: e.target.value })}
                          className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 resize-none"
                          placeholder="Any special delivery instructions..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Zone */}
                  <div className="bg-card rounded-xl border border-border p-5">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-primary" />
                      Delivery Method
                    </h2>
                    <div className="space-y-3">
                      {DELIVERY_ZONES.map((zone) => (
                        <label
                          key={zone.id}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors',
                            selectedZone.id === zone.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="deliveryZone"
                              checked={selectedZone.id === zone.id}
                              onChange={() => setSelectedZone(zone)}
                              className="w-4 h-4 text-primary"
                            />
                            <div>
                              <p className="font-medium">{zone.name}</p>
                              <p className="text-sm text-muted-foreground">{zone.description}</p>
                            </div>
                          </div>
                          <p className="font-semibold">
                            {zone.price === 0 ? 'FREE' : formatPrice(zone.price)}
                          </p>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Show county input when "Other Counties" is selected */}
                  {selectedZone.id === 'other' && (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <label className="block text-sm font-medium mb-2">
                        Which county are you in? *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.otherCounty}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, otherCounty: e.target.value })}
                        className={cn(
                          'w-full h-11 px-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20',
                          errors.otherCounty ? 'border-destructive' : 'border-border'
                        )}
                        placeholder="Enter your county name"
                      />
                      {errors.otherCounty && (
                        <p className="text-destructive text-sm mt-1">{errors.otherCounty}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        We'll contact you about delivery to your county.
                      </p>
                    </div>
                  )}

                  <Button size="lg" className="w-full h-12" onClick={handleContinueToPayment}>
                    Continue to Payment
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Payment Methods */}
                  <div className="bg-card rounded-xl border border-border p-5">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-primary" />
                      Payment Method
                    </h2>
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map((method) => (
                        <label
                          key={method.id}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors',
                            selectedPayment.id === method.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={selectedPayment.id === method.id}
                              onChange={() => setSelectedPayment(method)}
                              className="w-4 h-4 text-primary"
                            />
                            <div>
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                          </div>
                          <span className="text-lg">{method.icon}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-card rounded-xl border border-border p-5">
                    <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
                    <div className="space-y-3">
                      {items.slice(0, 3).map((item) => (
                        <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor.name}`} className="flex items-center gap-3">
                          <img
                            src={item.product.images[0]?.src || item.product.images[0]?.alt || '/placeholder.svg'}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity} | {item.selectedSize} | {item.selectedColor.name}
                            </p>
                          </div>
                          <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <p className="text-sm text-muted-foreground">+{items.length - 3} more items</p>
                      )}
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="bg-card rounded-xl border border-border p-5">
                    <h2 className="font-semibold text-lg mb-4">Promo Code</h2>
                    {!promoApplied ? (
                      <div className="space-y-2">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Enter promo code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1 h-11 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20"
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              // Using Kenya timezone (UTC+3)
                              const now = new Date();
                              const kenyaTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
                              const day = kenyaTime.getDay();
                              const isWeekend = day === 5 || day === 6 || day === 0;
                              if (promoCode.toUpperCase() === '332211') {
                                if (isWeekend) {
                                  setPromoApplied(true);
                                  setPromoError('');
                                } else {
                                  setPromoError('Code 332211 is only valid on Friday, Saturday, and Sunday');
                                }
                              } else {
                                setPromoError('Invalid promo code');
                              }
                            }}
                          >Apply</Button>
                        </div>
                        {promoError && <p className="text-destructive text-sm">{promoError}</p>}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                        <p className="text-success font-medium">15% off applied!</p>
                        <Button variant="ghost" size="sm" onClick={() => { setPromoApplied(false); setPromoCode(''); }}>Remove</Button>
                      </div>
                    )}
                  </div>

                  {submitError && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-destructive">{submitError}</p>
                    </div>
                  )}

                  <Button 
                    size="lg" 
                    className="w-full h-12" 
                    onClick={() => {
                      if (!user) {
                        // Show auth modal if not logged in
                        setShowAuthModal(true);
                        return;
                      }
                      if (selectedPayment.id === 'whatsapp') {
                        handleWhatsAppOrder();
                      } else {
                        handlePlaceOrder();
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing Order...
                      </>
                    ) : selectedPayment.id === 'whatsapp' ? (
                      <>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Order via WhatsApp - {formatPrice(finalTotal)}
                      </>
                    ) : (
                      `Place Order - ${formatPrice(finalTotal)}`
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-36 bg-card rounded-xl border border-border p-5">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({items.length})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{selectedZone.price === 0 ? 'FREE' : formatPrice(selectedZone.price)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount (15%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
