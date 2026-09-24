import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">About Us</h1>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p>
          Maishboutique, Kenya's no. 1 online retailer was established in May 2009 with the aim and vision to become 
          the one-stop shop for retail in Kenya with implementation of best practices both online and offline.
        </p>

        <p>
          Maishboutique is the largest online retail store in Kenya.
        </p>

        <p>
          At inception we did an average delivery time of a week, today we do, on average, delivery in 1-5 days.
        </p>

        <p>
          Initially starting with 3 employees, Maish Boutique presently has a staff strength of 50 young and 
          entrepreneurial Kenyans including our 50 man strong customer service team available 7 days a week.
        </p>

        <p>
          Country-wide Delivery in Kenya.
        </p>

        <p>
          Maish Boutique set-up the 1st ever festive season and offering Clothes and uniforms to children homes 
          in Kenya. The Maish Boutique is building young entrepreneurs pioneering various aspects of business in Kenya.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
