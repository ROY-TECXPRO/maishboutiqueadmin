import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, ChevronDown, ChevronUp, ShoppingBag, CreditCard, Truck, RefreshCw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HelpSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Browse our products, add items to your cart, and proceed to checkout. Follow the steps to enter your delivery details and payment information.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept M-Pesa, Credit/Debit Cards (Visa, Mastercard), and Cash on Delivery. Choose your preferred method at checkout.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 2-5 business days within Kenya. For Nairobi, same-day or next-day delivery may be available.',
    },
    {
      question: 'How do I track my order?',
      answer: 'Go to your account and click on "My Orders" to see the status of your orders. You can also contact our support for tracking updates.',
    },
    {
      question: 'What is your return policy?',
      answer: 'We accept returns within 7 days of delivery for unused items in original packaging. Contact our support to initiate a return.',
    },
    {
      question: 'How do I use a promo code?',
      answer: 'Enter your promo code in the "Promo Code" field at checkout and click "Apply". Note: Promo codes are only valid on Friday, Saturday, and Sunday.',
    },
    {
      question: 'Do you offer delivery nationwide?',
      answer: 'Yes, we deliver to all major towns and cities in Kenya. Delivery fees may vary based on location.',
    },
    {
      question: 'How do I contact customer support?',
      answer: 'You can reach us via phone, WhatsApp, or email. Our contact details are available below.',
    },
  ];

  const contactMethods = [
    {
      id: 'whatsapp1',
      name: 'WhatsApp',
      icon: MessageCircle,
      description: 'Chat with us on WhatsApp',
      contact: '+254-799-921-036',
      available: 'Mon-Sat, 8am-8pm',
      action: 'https://wa.me/254799921036',
      isButton: true,
    },
    {
      id: 'whatsapp2',
      name: 'WhatsApp',
      icon: MessageCircle,
      description: 'Chat with us on WhatsApp',
      contact: '+254-706-397-660',
      available: 'Mon-Sat, 8am-8pm',
      action: 'https://wa.me/254706397660',
      isButton: true,
    },
    {
      id: 'phone',
      name: 'Phone',
      icon: Phone,
      description: 'Call our customer service',
      contact: '+254-799-921-036',
      available: 'Mon-Sat, 9am-6pm',
      action: 'tel:+254799921036',
      isButton: true,
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      description: 'Send us an email',
      contact: 'maishboutiquemarketing@gmail.com',
      available: 'We respond within 24 hours',
      action: 'mailto:maishboutiquemarketing@gmail.com',
      isButton: true,
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
            <h1 className="font-display text-xl font-bold">Help & Support</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: ShoppingBag, label: 'Track Order', href: '/orders' },
            { icon: CreditCard, label: 'Payment Issues', action: () => navigate('/payments') },
            { icon: Truck, label: 'Delivery Info', action: () => navigate('/shipping') },
            { icon: RefreshCw, label: 'Returns', action: () => {} },
          ].map((item, index) => (
            <button
              key={index}
              onClick={item.action || (() => navigate(item.href || '/'))}
              className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border hover:border-primary transition-colors"
            >
              <item.icon className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="mb-8">
          <h2 className="font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                  aria-expanded={openFaq === index}
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Methods */}
        <div className="mb-8">
          <h2 className="font-semibold mb-4">Contact Us</h2>
          <div className="space-y-3">
            {contactMethods.map((method) => (
              <a
                key={method.id}
                href={method.action}
                target={method.id === 'email' ? '_self' : '_blank'}
                rel={method.id !== 'email' ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <method.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                  <p className="text-sm font-medium mt-1 text-primary">{method.contact}</p>
                  <p className="text-xs text-muted-foreground">{method.available}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Rate Experience */}
        <div className="p-6 bg-card rounded-xl border border-border text-center">
          <h3 className="font-semibold mb-2">How was your experience?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Let us know how we can improve our service
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="p-2 hover:scale-110 transition-transform"
                aria-label={`Rate ${star} stars`}
              >
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </button>
            ))}
          </div>
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

export default HelpSupportPage;
