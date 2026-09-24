import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: 2026-01-01 10:00:00 AM</p>

      <div className="prose prose-sm max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Introduction</h2>
          <p className="text-muted-foreground">
            Welcome to Maish Boutique's privacy policy. Maish Boutique respects your privacy and is committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you 
            visit it from) and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Important information and who we are</h2>
          
          <h3 className="text-lg font-medium mb-2">Purpose of this privacy policy</h3>
          <p className="text-muted-foreground mb-4">
            This privacy policy aims to give you information on how we collect and processes your personal data through your use of our 
            platform (website, mobile phone applications or third-party solutions), including any data you may provide us through the platform 
            when you sign up to our services. Please note that where third-party solutions are offered, such third-parties may have their own 
            policies that you must consider prior to using their respective services that we rely on to offer our services.
          </p>
          <p className="text-muted-foreground mb-4">
            This website is not intended for children and we do not knowingly collect data relating to children.
          </p>
          <p className="text-muted-foreground">
            It is important that you read this privacy policy together with any other privacy policy or fair processing policy we may provide 
            on specific occasions when we are collecting or processing personal data about you so that you are fully aware of how and why we are 
            using your data. This privacy policy supplements other notices and privacy policies and is not intended to override them.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">Controller</h3>
          <p className="text-muted-foreground">
            Maish Boutique is the controller and responsible for your personal data (collectively referred to as Maish Boutique, "we", "us" or 
            "our" in this privacy policy).
          </p>
          <p className="text-muted-foreground mt-2">
            You have the right to make a complaint at any time to the Office of the Data Protection Commissioner (ODPC), the Kenyan regulator 
            for data protection issues (www.odpc.go.ke). We would, however, appreciate the chance to deal with your concerns before you 
            approach the ODPC so please contact us in the first instance.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">Changes to the privacy policy and your duty to inform us of changes</h3>
          <p className="text-muted-foreground">
            We keep our privacy policy under regular review. It is important that the personal data we hold about you is accurate and current. 
            Please keep us informed if your personal data changes during your relationship with us.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">Third-party links</h3>
          <p className="text-muted-foreground">
            This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those 
            connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not 
            responsible for their privacy statements. When you leave our platform, we encourage you to read the privacy policy of every 
            third-party website you visit. It is essential to note that some of the third-parties are not located in Kenya.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. The data we collect about you</h2>
          <p className="text-muted-foreground mb-4">
            Personal data, or personal information, means any information about an individual from which that person can be identified. It does 
            not include data where the identity has been removed (anonymous data).
          </p>
          <p className="text-muted-foreground mb-4">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li><strong>Identity Data</strong> includes first name, maiden name, last name, username or similar identifier, title, date of birth and gender.</li>
            <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Financial Data</strong> includes bank account and payment details.</li>
            <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            <li><strong>Profile Data</strong> includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.</li>
            <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
            <li><strong>Marketing and Communications Data</strong> includes your preferences in receiving marketing from us and our third parties and your communication preferences.</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            We also collect, use and share Aggregated Data such as statistical or demographic data for any purpose. Aggregated Data could be 
            derived from your personal data but is not considered personal data in law as this data will not directly or indirectly reveal your 
            identity.
          </p>
          <p className="text-muted-foreground">
            We do not collect any Special Categories of Personal Data about you (this includes details about your race or ethnicity, religious 
            or philosophical beliefs, sex life, sexual orientation, political opinions, trade union membership, information about your health, 
            and genetic and biometric data).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. How is your personal data collected?</h2>
          <p className="text-muted-foreground mb-4">
            We use different methods to collect data from and about you including through:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li><strong>Direct interactions</strong> - You may give us your Identity, Contact and Financial Data by filling in forms or by corresponding with us by post, phone, email or otherwise.</li>
            <li><strong>Automated technologies or interactions</strong> - As you interact with our platform, we will automatically collect Technical Data about your equipment, browsing actions and patterns.</li>
            <li><strong>Third parties or publicly available sources</strong> - We will receive personal data about you from various third parties and public sources.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. How we use your personal data</h2>
          <p className="text-muted-foreground mb-4">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Marketing</h3>
          <p className="text-muted-foreground mb-2">
            We strive to provide you with choices regarding certain personal data uses, particularly around marketing and advertising.
          </p>
          <p className="text-muted-foreground">
            You have the right to withdraw consent to marketing at any time by unsubscribing from the marketing solutions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Disclosures of your personal data</h2>
          <p className="text-muted-foreground mb-4">
            We may share your personal data with the parties set out below for the purposes set out in the intended contract or compliance with a legitimate legal purpose:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li>Internal Third Parties.</li>
            <li>External Third Parties.</li>
            <li>Specific/special third parties (like government agencies investigating a matter).</li>
            <li>Third parties to whom we may choose to sell, transfer or merge parts of our business or our assets.</li>
          </ul>
          <p className="text-muted-foreground">
            We require all third parties to respect the security of your personal data and to treat it in accordance with the law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. International transfers</h2>
          <p className="text-muted-foreground mb-4">
            We share your personal data within the corporate structure of the company. This will involve transferring your data outside Kenya.
          </p>
          <p className="text-muted-foreground">
            Whenever we transfer your personal data out of Kenya, we ensure a similar degree of protection is afforded to it by ensuring at least 
            one of the following safeguards is implemented.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Data security</h2>
          <p className="text-muted-foreground">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in 
            an unauthorised way, altered or disclosed. We have put in place procedures to deal with any suspected personal data breach and 
            will notify you and any applicable regulator of a breach where we are legally required to do so.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. Data retention</h2>
          <p className="text-muted-foreground mb-4">
            We will only retain your personal data for as long as reasonably necessary to fulfil the purposes we collected it for, including 
            for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements.
          </p>
          <p className="text-muted-foreground">
            In some circumstances you can ask us to delete your data; however, it is not an absolute right as per the Data Protection Act.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. Your legal rights</h2>
          <p className="text-muted-foreground mb-4">
            Under certain circumstances, you have rights under data protection laws that you can exercise per the law.
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>You will not have to pay a fee to access your personal data (or to exercise any of the other rights).</li>
            <li>We may need to request specific information from you to help us confirm your identity.</li>
            <li>We try to respond to all legitimate requests within one month.</li>
            <li>You have the right to withdraw consent at any time where we are relying on consent to process your personal data.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
