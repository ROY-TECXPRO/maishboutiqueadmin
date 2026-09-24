import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: 2026-01-01 10:00:00 AM</p>

      <div className="prose prose-sm max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Introduction</h2>
          <p className="text-muted-foreground">
            Welcome to Maish Boutique's terms of service. By accessing and using our website and services, you agree to be bound by these terms and conditions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Acceptance of Terms</h2>
          <p className="text-muted-foreground mb-4">
            By accessing and using Maish Boutique's website, mobile applications, and services, you accept and agree to be bound by the terms, provisions and obligations hereunder.
          </p>
          <p className="text-muted-foreground">
            If you do not agree to be bound by these terms, please do not access or use our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Use of Our Platform</h2>
          <p className="text-muted-foreground mb-4">
            Our platform is intended for lawful purposes only. You agree to use our platform only for purposes that are permitted by these terms and conditions and any applicable law.
          </p>
          <p className="text-muted-foreground mb-4">
            You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li>Use our platform in any way that breaches any applicable local, national or international law or regulation.</li>
            <li>Use our platform in any way that is unlawful or fraudulent, or has any unlawful or fraudulent purpose or effect.</li>
            <li>Transmit any unsolicited or unauthorized advertising or promotional material.</li>
            <li>Interfere with or disrupt our platform or servers or networks.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Registration</h2>
          <p className="text-muted-foreground mb-4">
            When you create an account with us, you must provide accurate, complete and up-to-date information. You are responsible for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li>Safeguarding your account credentials and password.</li>
            <li>All activities that occur under your account.</li>
            <li>Notifying us immediately of any unauthorized use of your account.</li>
          </ul>
          <p className="text-muted-foreground">
            We reserve the right to terminate or suspend your account at our sole discretion.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Products and Services</h2>
          <p className="text-muted-foreground mb-4">
            All products and services offered through our platform are subject to availability. We reserve the right to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li>Modify or discontinue any product or service without notice.</li>
            <li>Refuse to provide any products or services to any customer.</li>
            <li>Limit the quantities of any products or services.</li>
          </ul>
          <p className="text-muted-foreground">
            Prices for our products are subject to change without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Ordering and Payment</h2>
          <p className="text-muted-foreground mb-4">
            When you place an order through our platform, you are making an offer to purchase products subject to these terms. All orders are subject to acceptance and availability.
          </p>
          <p className="text-muted-foreground mb-4">
            Payment for products and services can be made through our accepted payment methods. By providing payment information, you represent and warrant that you are authorized to use the payment method.
          </p>
          <p className="text-muted-foreground">
            We reserve the right to refuse or cancel any order for any reason, including pricing errors or suspected fraud.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Shipping and Delivery</h2>
          <p className="text-muted-foreground mb-4">
            Delivery times may vary depending on your location and product availability. We will make reasonable efforts to deliver products within the estimated timeframe provided.
          </p>
          <p className="text-muted-foreground">
            Risk of loss and title for products pass to you upon delivery to the carrier.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Returns and Refunds</h2>
          <p className="text-muted-foreground mb-4">
            Our returns and refunds policy is available in our Returns & Exchanges section. Please review this policy before making a purchase.
          </p>
          <p className="text-muted-foreground">
            You may return products within 7 days from the delivery date if you change your mind or if the size is not suitable, except for certain products due to hygiene and health reasons.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Intellectual Property</h2>
          <p className="text-muted-foreground mb-4">
            All content, designs, logos, trademarks, and materials on our platform are the intellectual property of Maish Boutique or our licensors.
          </p>
          <p className="text-muted-foreground">
            You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any content from our platform without our prior written consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4">
            To the maximum extent permitted by law, Maish Boutique shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
          </p>
          <p className="text-muted-foreground">
            Our total liability for any claim arising from or relating to these terms or our platform shall not exceed the amount you paid for the products or services giving rise to the claim.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Disclaimer</h2>
          <p className="text-muted-foreground mb-4">
            Our platform is provided on an "as is" and "as available" basis. Maish Boutique makes no representations or warranties of any kind, express or implied, as to the operation of our platform or the information, content, materials, or products included on our platform.
          </p>
          <p className="text-muted-foreground">
            We do not warrant that our platform will be uninterrupted, timely, secure, or error-free.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Governing Law</h2>
          <p className="text-muted-foreground">
            These terms and conditions shall be governed by and construed in accordance with the laws of Kenya. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Kenya.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify or replace these terms at any time. Your continued use of our platform after any such changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about these Terms of Service, please contact us at maishboutiquemarketing@gmail.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
