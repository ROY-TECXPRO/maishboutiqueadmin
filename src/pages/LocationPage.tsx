import CommutesMap from '@/components/CommutesMap';

const LocationPage = () => {
  // Replace with your actual Google Maps API key
  const GOOGLE_MAPS_API_KEY = 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg';

  // Your store location (Maish Style Shop location in Kenya)
  const storeLocation = {
    lat: -1.0912005,
    lng: 35.871697,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Find Our Location</h1>
        <p className="mb-6 text-gray-600">
          Use the map below to estimate your commute time to our store. 
          You can add destinations and see travel times by driving, transit, bicycling, or walking.
        </p>
        
        <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
          <CommutesMap
            apiKey={GOOGLE_MAPS_API_KEY}
            center={storeLocation}
            zoom={14}
            defaultTravelMode="WALKING"
            distanceMeasurementType="METRIC"
          />
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Visit Our Store</h2>
          <p className="text-gray-600">
            We're located in Kenya/Narok and offer a wide range of fashion items including suits, 
            casual wear, uniforms, and more. Come visit us for a personalized shopping experience!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;
