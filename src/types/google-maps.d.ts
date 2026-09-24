// Google Maps API type declarations
declare namespace google {
  namespace maps {
    interface MapOptions {
      center?: LatLngLiteral | LatLng;
      zoom?: number;
      fullscreenControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      zoomControl?: boolean;
      maxZoom?: number;
      mapId?: string;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
      toJSON(): LatLngLiteral;
    }

    class LatLngBounds {
      constructor(sw?: LatLngLiteral, ne?: LatLngLiteral);
      extend(latLng: LatLng | LatLngLiteral): LatLngBounds;
      union(other: LatLngBounds): LatLngBounds;
      fitBounds(bounds: LatLngBounds): void;
    }

    class Map {
      constructor(mapDiv: Element, options?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      fitBounds(bounds: LatLngBounds): void;
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map?: Map | null;
      label?: string | MarkerLabel;
      icon?: Symbol | string | MarkerIcon;
    }

    interface MarkerLabel {
      text: string;
      color?: string;
      fontFamily?: string;
      fontSize?: string;
    }

    interface MarkerIcon {
      path?: string;
      fillOpacity?: number;
      strokeWeight?: number;
      anchor?: Point;
      scale?: number;
      fillColor?: string;
      strokeColor?: string;
      labelOrigin?: Point;
    }

    class Marker {
      constructor(options?: MarkerOptions);
      setMap(map: Map | null): void;
      setIcon(icon: Symbol | string | MarkerIcon): void;
      label?: MarkerLabel;
      position: LatLng | LatLngLiteral;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
    }

    class Polyline {
      constructor(options?: PolylineOptions);
      setMap(map: Map | null): void;
      setOptions(options: Partial<PolylineOptions>): void;
      path: LatLng[] | LatLngLiteral[];
    }

    interface PolylineOptions {
      path: LatLng[] | LatLngLiteral[];
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      zIndex?: number;
    }

    interface DirectionsRequest {
      origin: LatLng | LatLngLiteral | string;
      destination: LatLng | LatLngLiteral | string | { placeId: string };
      travelMode?: TravelMode;
      unitSystem?: UnitSystem;
    }

    interface DirectionsResult {
      routes: DirectionsRoute[];
    }

    interface DirectionsRoute {
      overview_path: LatLng[];
      bounds: LatLngBounds;
      legs: DirectionsLeg[];
    }

    interface DirectionsLeg {
      start_location: LatLng;
      end_location: LatLng;
      distance: { text: string };
      duration: { value: number };
    }

    enum TravelMode {
      DRIVING = 'DRIVING',
      TRANSIT = 'TRANSIT',
      BICYCLING = 'BICYCLING',
      WALKING = 'WALKING',
    }

    enum UnitSystem {
      METRIC = 'METRIC',
      IMPERIAL = 'IMPERIAL',
    }

    class DirectionsService {
      route(request: DirectionsRequest, callback: (result: DirectionsResult | null, status: DirectionsStatus) => void): void;
      route(request: DirectionsRequest): Promise<DirectionsResult>;
    }

    enum DirectionsStatus {
      OK = 'OK',
      NOT_FOUND = 'NOT_FOUND',
      ZERO_RESULTS = 'ZERO_RESULTS',
      MAX_WAYPOINTS_EXCEEDED = 'MAX_WAYPOINTS_EXCEEDED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    }

    namespace places {
      interface PlaceResult {
        place_id?: string;
        name?: string;
        geometry?: {
          location?: LatLng;
        };
      }

      class AutocompleteService {
        getPlacePredictions(request: AutocompleteRequest): Promise<AutocompletePrediction[]>;
      }

      interface AutocompleteRequest {
        input: string;
        bounds?: {
          north: number;
          south: number;
          east: number;
          west: number;
        };
        componentRestrictions?: {
          country: string | string[];
        };
      }

      interface AutocompletePrediction {
        place_id: string;
        description: string;
      }

      interface AutocompletePredictionList {
        predictions: AutocompletePrediction[];
      }

      class PlacesService {
        constructor(map: Map);
        getDetails(request: { placeId: string; fields?: string[] }, callback: (place: PlaceResult | null, status: PlacesServiceStatus) => void): void;
      }

      enum PlacesServiceStatus {
        OK = 'OK',
        NOT_FOUND = 'NOT_FOUND',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
      }
    }

    class BicyclingLayer {
      setMap(map: Map | null): void;
    }

    class TransitLayer {
      setMap(map: Map | null): void;
    }
  }
}

interface Symbol {
  path: string;
  fillOpacity?: number;
  strokeWeight?: number;
  anchor?: google.maps.Point;
  scale?: number;
  fillColor?: string;
  strokeColor?: string;
}
