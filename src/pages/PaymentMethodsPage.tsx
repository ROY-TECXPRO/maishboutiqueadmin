import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Banknote, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentMethodsPage: React.FC = () => {
  const navigate = useNavigate();

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: Smartphone,
      description: 'Pay instantly using your M-Pesa mobile money wallet',
      steps: [
        'Select M-Pesa at checkout',
        'Enter your phone number',
        'You will receive a pop-up on your phone',
        'Enter your M-Pesa PIN to confirm',
        'You will receive an SMS confirmation',
      ],
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Pay securely with Visa, Mastercard, or other cards',
      steps: [
        'Select Card payment at checkout',
        'Enter your card details',
        'Enter the OTP sent to your phone',
        'Your payment will be processed instantly',
      ],
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      icon: Banknote,
      description: 'Pay with cash when your order is delivered',
      steps: [
        'Select Cash on Delivery at checkout',
        'Have the exact amount ready',
        'Pay the delivery person when your order arrives',
        'Get your receipt',
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/account')}
              className="touch-target flex items-center justify-center hover:bg-muted rounded-lg"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl font-bold">Payment Methods</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Security Note */}
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg mb-6">
          <Shield className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm">
            All payments are secure and encrypted. We never store your card details.
          </p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <method.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{method.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {method.description}
                  </p>
                </div>
              </div>

              {/* How it works */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm font-medium mb-2">How to pay:</p>
                <ol className="space-y-1">
                  {method.steps.map((step, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>

        {/* Supported Cards */}
        <div className="mt-6 p-4 bg-muted rounded-xl">
          <p className="text-sm font-medium mb-3">We accept:</p>
          <div className="flex flex-wrap gap-2">
            {['Visa', 'Mastercard', 'American Express', 'Verve'].map((card) => (
              <span
                key={card}
                className="px-3 py-1 bg-background rounded-lg text-sm font-medium"
              >
                {card}
              </span>
            ))}
          </div>
        </div>

        {/* M-Pesa Info */}
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            M-Pesa Users
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Make sure you have sufficient funds in your M-Pesa wallet and that you're registered for M-Pesa transactions.
          </p>
        </div>

        {/* Cash on Delivery Info */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <Banknote className="w-4 h-4" />
            Cash on Delivery
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Available for orders up to KES 50,000. Have the exact amount ready for faster processing.
          </p>
        </div>

        {/* Back to Account */}
        <Button 
          variant="outline" 
          className="w-full mt-6"
          onClick={() => navigate('/account')}
        >
          Back to Account
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethodsPage;
