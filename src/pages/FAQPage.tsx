import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, ShoppingBag, CreditCard, RotateCcw, Truck, Package, Shield, User, Mail, Phone } from 'lucide-react';

const FAQPage: React.FC = () => {
  const faqCategories = [
    {
      icon: ShoppingBag,
      title: 'Orders & Shopping',
      questions: [
        {
          q: 'How do I place an order?',
          a: 'Browse our products, select your desired items, choose size and color, add to cart, and proceed to checkout. You\'ll need to create an account or checkout as a guest.'
        },
        {
          q: 'Can I modify or cancel my order?',
          a: 'Yes, you can modify or cancel your order within 1 hour of placing it. Contact us immediately via WhatsApp or email. Once the order is processed and shipped, modifications are not possible.'
        },
        {
          q: 'How do I check my order status?',
          a: 'Log into your account and visit the Orders section. You\'ll find real-time updates on your order status from placement to delivery.'
        },
        {
          q: 'Do you offer gift wrapping?',
          a: 'Yes, we offer gift wrapping services for a small additional fee. You can select this option at checkout and include a personalized message.'
        },
        {
          q: 'What if an item is out of stock?',
          a: 'If an item is out of stock, you can sign up for restock notifications. We restock popular items regularly, and you\'ll receive an email when it becomes available.'
        },
        {
          q: 'Can I pre-order items?',
          a: 'Pre-orders are available for select items. These will be clearly marked as "Pre-order" with an expected shipping date. Payment is collected at the time of order.'
        }
      ]
    },
    {
      icon: CreditCard,
      title: 'Payments & Pricing',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept M-Pesa, credit/debit cards (Visa, Mastercard), PayPal, and bank transfers. For M-Pesa, you\'ll receive payment instructions after checkout.'
        },
        {
          q: 'Is my payment secure?',
          a: 'Yes, all payments are processed through secure, encrypted channels. We never store your full credit card details. Your transactions are protected.'
        },
        {
          q: 'Do you offer installment payments?',
          a: 'Yes, we partner with selected financial institutions to offer buy-now-pay-later options. This is available at checkout for orders above a minimum amount.'
        },
        {
          q: 'Why was my payment declined?',
          a: 'Payment declines can occur due to insufficient funds, incorrect card details, or bank restrictions. Please verify your information or try a different payment method. Contact your bank if the issue persists.'
        },
        {
          q: 'Do you offer discounts or promo codes?',
          a: 'We regularly run promotions and offer promo codes. Sign up for our newsletter to receive exclusive offers. Sale items are already discounted and cannot be combined with other offers.'
        },
        {
          q: 'Is VAT included in the prices?',
          a: 'All displayed prices include applicable taxes. The final price shown at checkout is what you\'ll pay, with no hidden fees.'
        }
      ]
    },
    {
      icon: RotateCcw,
      title: 'Returns & Exchanges',
      questions: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 7-day return policy for most items. Products must be unworn, unwashed, and in original packaging with tags attached. Hygiene-sensitive items cannot be returned.'
        },
        {
          q: 'How do I initiate a return?',
          a: 'Log into your account, go to Orders, select the item you want to return, and follow the prompts. You\'ll receive a return shipping label and instructions.'
        },
        {
          q: 'How long does it take to process a refund?',
          a: 'Refunds are processed within 5-7 business days after we receive your return. The refund will be credited to your original payment method.'
        },
        {
          q: 'Can I exchange an item for a different size or color?',
          a: 'Yes, exchanges are free within 7 days. Select the exchange option in your account, and we\'ll ship the new item once we receive the original.'
        },
        {
          q: 'What if I received a damaged or defective item?',
          a: 'Take photos of the damage and contact us within 48 hours. We\'ll arrange a replacement or full refund at no additional cost to you.'
        },
        {
          q: 'Are return shipping costs covered?',
          a: 'Yes, return shipping is free for damaged, defective, or incorrect items. For change of mind returns, a small shipping fee may apply.'
        }
      ]
    },
    {
      icon: Truck,
      title: 'Shipping & Delivery',
      questions: [
        {
          q: 'How long does shipping take?',
          a: 'Domestic: 3-7 business days (standard), 1-2 days (express). International: 7-21 business days depending on customs clearance.'
        },
        {
          q: 'Do you ship internationally?',
          a: 'Yes, we ship worldwide. International customers are responsible for import duties and taxes. Some restrictions apply to certain destinations.'
        },
        {
          q: 'How much does shipping cost?',
          a: 'Shipping costs vary based on weight, dimensions, and destination. Free shipping is available on domestic orders above the minimum amount.'
        },
        {
          q: 'How can I track my shipment?',
          a: 'You\'ll receive an email with your tracking number once shipped. Click the link or enter the number on the carrier\'s website for real-time updates.'
        },
        {
          q: 'What if my package is lost?',
          a: 'If your package shows as delivered but you haven\'t received it, check with neighbors or building management. If still missing, contact us within 7 days to investigate.'
        },
        {
          q: 'Can I change my shipping address after ordering?',
          a: 'Address changes are possible only before shipment. Contact us immediately. A redirect fee may apply once the package is in transit.'
        },
        {
          q: 'What happens if I\'m not home for delivery?',
          a: 'Carriers typically leave packages at your door or with neighbors. Some offer scheduled delivery or hold at local facilities.'
        }
      ]
    },
    {
      icon: Package,
      title: 'Products & Sizing',
      questions: [
        {
          q: 'How do I find my correct size?',
          a: 'Use our Size Guide available on each product page. Measure yourself and compare with our size chart. Contact us for personalized assistance.'
        },
        {
          q: 'Are your sizes true to fit?',
          a: 'Most items run true to size, but we recommend checking the product description for any specific notes about fit.'
        },
        {
          q: 'Do you offer custom alterations?',
          a: 'We offer basic alterations for select items. Contact us before ordering to discuss your requirements and any additional costs.'
        },
        {
          q: 'How do I care for my garments?',
          a: 'Care instructions are on each product\'s tag. Generally, we recommend gentle washing, air drying, and avoiding direct sunlight for vibrant colors.'
        },
        {
          q: 'Are your products ethically sourced?',
          a: 'Yes, we work with suppliers who meet our ethical standards. All products are quality checked before shipping.'
        },
        {
          q: 'Do you offer personalization or monogramming?',
          a: 'Personalization is available for select items. Look for the "Personalize" option on eligible products.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'Account & Security',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click "Sign Up" at the top of the page. Enter your email and create a password. You can also sign up using your Google or Facebook account.'
        },
        {
          q: 'How do I reset my password?',
          a: 'Click "Forgot Password" on the login page. Enter your email, and we\'ll send a link to reset your password.'
        },
        {
          q: 'Is my personal information secure?',
          a: 'We use industry-standard encryption and security measures to protect your data. We never share your information with third parties.'
        },
        {
          q: 'How do I update my account information?',
          a: 'Log in and visit your Account Settings. You can update your contact info, addresses, and preferences at any time.'
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes, contact us to request account deletion. This will permanently remove all your data within 30 days.'
        },
        {
          q: 'What are your privacy practices?',
          a: 'Read our Privacy Policy for detailed information on how we collect, use, and protect your data.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-primary" />
                Frequently Asked Questions
              </h1>
              <p className="text-muted-foreground text-sm">Find answers to common questions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Contact */}
          <section className="bg-primary/5 rounded-xl border border-primary/20 p-6">
            <h2 className="font-semibold mb-4">Can't find what you're looking for?</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <a
                href="https://wa.me/254799921036"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-[#25D366]/10 rounded-lg hover:bg-[#25D366]/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Chat with us</p>
                </div>
              </a>
              <a
                href="mailto:maishboutiquemarketing@gmail.com"
                className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">Get in touch</p>
                </div>
              </a>
              <a
                href="tel:+254799921036"
                className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-xs text-muted-foreground">Call us</p>
                </div>
              </a>
            </div>
          </section>

          {/* FAQ Categories */}
          {faqCategories.map((category) => (
            <section key={category.title} className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <category.icon className="w-5 h-5 text-primary" />
                {category.title}
              </h2>
              
              <div className="space-y-4">
                {category.questions.map((faq, index) => (
                  <FAQItem key={index} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </section>
          ))}

          {/* Additional Help */}
          <section className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-xl font-semibold mb-4">Need More Help?</h2>
            <p className="text-muted-foreground text-sm mb-4">
              If you couldn't find the answer to your question, please don't hesitate to reach out to our customer support team.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shipping"
                className="px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors"
              >
                Shipping Information
              </Link>
              <Link
                to="/returns"
                className="px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors"
              >
                Returns Policy
              </Link>
              <Link
                to="/privacy"
                className="px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// FAQ Item Component
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm">{question}</span>
        <span className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-4 py-3 bg-muted/10 text-sm text-muted-foreground border-t border-border leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

export default FAQPage;
