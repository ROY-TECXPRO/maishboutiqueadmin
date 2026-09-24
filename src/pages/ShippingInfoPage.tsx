import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Ruler, FileText, Clock, Truck, Shield, Box } from 'lucide-react';

const ShippingInfoPage: React.FC = () => {
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
              <h1 className="text-2xl font-bold">Shipping Information</h1>
              <p className="text-muted-foreground text-sm">Everything you need to know about shipping</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Shipping Essentials */}
          <section className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Shipping Essentials
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Addresses */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Addresses</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Sender Information</p>
                    <ul className="text-sm space-y-1">
                      <li>• Full name</li>
                      <li>• Street address</li>
                      <li>• City, state, zip code</li>
                      <li>• Contact phone number</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Recipient Information</p>
                    <ul className="text-sm space-y-1">
                      <li>• Full name</li>
                      <li>• Street address</li>
                      <li>• City, state, zip code</li>
                      <li>• Contact phone number</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ruler className="w-4 h-4" />
                  <span className="text-sm font-medium">Package Details</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[80px]">Weight:</span>
                      <span>Accurate package weight in kg/lbs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[80px]">Dimensions:</span>
                      <span>Length × Width × Height</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[80px]">Content:</span>
                      <span>Detailed description of items</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {/* Tracking */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">Tracking Number</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    A unique identifier used to monitor your shipment progress from pickup to delivery.
                    Enter this number on the carrier's website to get real-time updates.
                  </p>
                </div>
              </div>

              {/* Documentation */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">International Documentation</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <ul className="text-sm space-y-1">
                    <li>• Commercial invoices</li>
                    <li>• Customs declarations</li>
                    <li>• Certificates of origin</li>
                    <li>• Export/import licenses (if required)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Costs & Timeline */}
            <div className="mt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Costs & Timeline</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Estimated Cost</p>
                    <p className="text-sm">Based on weight, dimensions, and destination</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Shipping Methods</p>
                    <p className="text-sm">Express, Ground, Standard, Economy</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Delivery Time</p>
                    <p className="text-sm">Expected delivery date provided at checkout</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How to Prepare a Package */}
          <section className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Box className="w-5 h-5 text-primary" />
              How to Prepare a Package
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Pack Securely</h3>
                  <p className="text-sm text-muted-foreground">
                    Use appropriate boxes and padding materials. Wrap fragile items individually with bubble wrap or packing paper. Fill empty spaces with packing peanuts, crumpled paper, or foam inserts to prevent movement during transit.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Label Correctly</h3>
                  <p className="text-sm text-muted-foreground">
                    Clearly print the destination address in the center of the box. Place the return address in the top-left corner. Use waterproof markers or adhesive labels. Include a second copy of the address inside the package.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Select Shipping Method</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a carrier (USPS, FedEx, DHL, UPS) based on your needs:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• <strong>Express:</strong> Fastest delivery, highest cost</li>
                    <li>• <strong>Ground:</strong> Economical, longer transit time</li>
                    <li>• <strong>Economy:</strong> Best for non-urgent, heavy packages</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Pay and Ship</h3>
                  <p className="text-sm text-muted-foreground">
                    Apply correct postage or use a prepaid shipping label. Drop off at carrier location or schedule a pickup. Keep your receipt and tracking number for reference.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              <FAQItem
                question="How long does shipping take?"
                answer="Shipping times vary based on the method selected and destination. Domestic orders typically arrive within 3-7 business days for standard shipping and 1-2 days for express shipping. International orders may take 7-21 business days depending on customs clearance."
              />
              
              <FAQItem
                question="Do you ship internationally?"
                answer="Yes, we ship worldwide. International shipments may require additional documentation such as commercial invoices and customs declarations. Customers are responsible for any import duties or taxes."
              />
              
              <FAQItem
                question="How can I track my order?"
                answer="Once your order ships, you'll receive an email with your tracking number. You can also find it in your account orders section. Click the tracking link or enter the number on the carrier's website for real-time updates."
              />
              
              <FAQItem
                question="What carriers do you use?"
                answer="We work with major carriers including DHL, FedEx, UPS, and local postal services. The carrier is selected based on your location, package size, and delivery preferences."
              />
              
              <FAQItem
                question="Is my package insured?"
                answer="All shipments include basic carrier insurance. Additional coverage can be purchased at checkout for high-value items. Please report any damage or loss within 48 hours of delivery."
              />
              
              <FAQItem
                question="What if my package is damaged?"
                answer="Take photos of the damage immediately. Contact us within 48 hours with photos and your order details. We'll work with the carrier to file a claim and send a replacement or refund."
              />
              
              <FAQItem
                question="Can I change my shipping address?"
                answer="Address changes are possible only before the package ships. Contact us immediately via WhatsApp or email. Once shipped, the carrier may charge a redirect fee."
              />
              
              <FAQItem
                question="What happens if I'm not home for delivery?"
                answer="Carriers typically leave the package at your door or with a neighbor. Some may attempt redelivery or hold it at a local facility. You can provide delivery instructions during checkout."
              />
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-primary/5 rounded-xl border border-primary/20 p-6 text-center">
            <h3 className="font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Our customer service team is here to help you with any shipping inquiries.
            </p>
            <a
              href="https://wa.me/254799921036"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#20BDC5] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12"/>
              </svg>
              Chat on WhatsApp
            </a>
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
        <div className="px-4 py-3 bg-muted/10 text-sm text-muted-foreground border-t border-border">
          {answer}
        </div>
      )}
    </div>
  );
};

export default ShippingInfoPage;
