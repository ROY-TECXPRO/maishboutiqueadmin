import { useState, useEffect, useRef, useCallback } from 'react';
import './CommutesMap.css';

// Google Maps types
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

interface CommutesMapProps {
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  defaultTravelMode?: 'DRIVING' | 'TRANSIT' | 'BICYCLING' | 'WALKING';
  distanceMeasurementType?: 'METRIC' | 'IMPERIAL';
  initialDestinations?: Array<{
    placeId: string;
    travelMode?: 'DRIVING' | 'TRANSIT' | 'BICYCLING' | 'WALKING';
  }>;
}

// SVG Icons as components
const CommutesIcons = () => (
  <svg className="hide" aria-hidden="true">
    <defs>
      <symbol id="commutes-initial-icon" viewBox="0 0 24 24">
        <path d="M41 20H18.6c-9.5 0-10.8 13.5 0 13.5h14.5C41 33.5 41 45 33 45H17.7" stroke="#D2E3FC" strokeWidth="5" fill="none" />
        <path d="M41 22c.2 0 .4 0 .6-.2l.4-.5c.3-1 .7-1.7 1.1-2.5l2-3c.8-1 1.5-2 2-3 .6-1 .9-2.3.9-3.8 0-2-.7-3.6-2-5-1.4-1.3-3-2-5-2s-3.6.7-5 2c-1.3 1.4-2 3-2 5 0 1.4.3 2.6.8 3.6s1.2 2 2 3.2c.9 1 1.6 2 2 2.8.5.9 1 1.7 1.2 2.7l.4.5.6.2Zm0-10.5c-.7 0-1.3-.2-1.8-.7-.5-.5-.7-1.1-.7-1.8s.2-1.3.7-1.8c.5-.5 1.1-.7 1.8-.7s1.3.2 1.8.7c.5.5.7 1.1.7 1.8s-.2 1.3-.7 1.8c-.5.5-1.1.7-1.8.7Z" fill="#185ABC" />
      </symbol>
    </defs>
  </svg>
);

const AddIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const ChevronLeftIcon = ({ direction }: { direction: number }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" data-direction={direction}>
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
  </svg>
);

const ChevronRightIcon = ({ direction }: { direction: number }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" data-direction={direction}>
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
  </svg>
);

const DrivingIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z" fill="currentColor" />
    <circle cx="7.5" cy="14.5" r="1.5" fill="currentColor" />
    <circle cx="16.5" cy="14.5" r="1.5" fill="currentColor" />
  </svg>
);

const TransitIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zm5.66 3H6.43c.61-.52 2.06-1 5.57-1 3.71 0 5.12.46 5.66 1zM11 7v3H6V7h5zm2 0h5v3h-5V7zm3.5 10h-9c-.83 0-1.5-.67-1.5-1.5V12h12v3.5c0 .83-.67 1.5-1.5 1.5z" fill="currentColor" />
    <circle cx="8.5" cy="14.5" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor" />
  </svg>
);

const BicyclingIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" fill="currentColor" />
  </svg>
);

const WalkingIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.56-.89-1.68-1.25-2.65-.84L6 8.3V13h2V9.6l1.8-.7" fill="currentColor" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4v3z" fill="currentColor" />
  </svg>
);

const DirectionsIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M22.43 10.59l-9.01-9.01c-.75-.75-2.07-.76-2.83 0l-9 9c-.78.78-.78 2.04 0 2.82l9 9c.39.39.9.58 1.41.58.51 0 1.02-.19 1.41-.58l8.99-8.99c.79-.76.8-2.02.03-2.82zm-10.42 10.4l-9-9 9-9 9 9-9 9zM8 11v4h2v-3h4v2.5l3.5-3.5L14 7.5V10H9c-.55 0-1 .45-1 1z" fill="currentColor" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" fill="currentColor" />
  </svg>
);

const TravelModeIcons = {
  DRIVING: DrivingIcon,
  TRANSIT: TransitIcon,
  BICYCLING: BicyclingIcon,
  WALKING: WalkingIcon,
};

interface Destination {
  name: string;
  place_id: string;
  label: string;
  travelModeEnum: string;
  url: string;
  distance?: string;
  duration?: string;
  marker?: google.maps.Marker;
  polylines?: {
    innerStroke: google.maps.Polyline;
    outerStroke: google.maps.Polyline;
  };
  bounds?: google.maps.LatLngBounds;
}

const CommutesMap: React.FC<CommutesMapProps> = ({
  apiKey,
  center = { lat: -1.0912005, lng: 35.871697 },
  zoom = 14,
  defaultTravelMode = 'WALKING',
  distanceMeasurementType = 'IMPERIAL',
  initialDestinations = [],
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activeDestinationIndex, setActiveDestinationIndex] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [destinationInput, setDestinationInput] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [selectedTravelMode, setSelectedTravelMode] = useState(defaultTravelMode);
  const [errorMessage, setErrorMessage] = useState('');
  const [markerIndex, setMarkerIndex] = useState(0);
  const [lastActiveEl, setLastActiveEl] = useState<HTMLElement | null>(null);

  const MAX_NUM_DESTINATIONS = 10;
  const BIAS_BOUND_DISTANCE = 0.5;
  const HOUR_IN_SECONDS = 3600;
  const MIN_IN_SECONDS = 60;

  const STROKE_COLORS = {
    active: {
      innerStroke: '#4285F4',
      outerStroke: '#185ABC',
    },
    inactive: {
      innerStroke: '#BDC1C6',
      outerStroke: '#80868B',
    },
  };

  const MARKER_ICON_COLORS = {
    active: {
      fill: '#EA4335',
      stroke: '#C5221F',
      label: '#FFF',
    },
    inactive: {
      fill: '#F1F3F4',
      stroke: '#9AA0A6',
      label: '#3C4043',
    },
  };

  // Load Google Maps API
  useEffect(() => {
    if (window.google) {
      initMap();
      return;
    }

    window.initMap = initMap;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      delete window.initMap;
    };
  }, [apiKey]);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    const mapOptions: google.maps.MapOptions = {
      center,
      zoom,
      fullscreenControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: true,
      maxZoom: 20,
    };

    const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);

    // Create origin marker
    createMarker(newMap, center, undefined, true);
  }, [center, zoom]);

  const getNextMarkerLabel = () => {
    const markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const label = markerLabels[markerIndex];
    setMarkerIndex((prev) => (prev + 1) % markerLabels.length);
    return label;
  };

  const createMarker = (
    mapInstance: google.maps.Map,
    location: google.maps.LatLngLiteral,
    label?: string,
    isOrigin?: boolean
  ) => {
    const isOriginMarker = isOrigin === undefined ? !label : isOrigin;
    const markerIconConfig = {
      path: 'M10 27c-.2 0-.2 0-.5-1-.3-.8-.7-2-1.6-3.5-1-1.5-2-2.7-3-3.8-2.2-2.8-3.9-5-3.9-8.8C1 4.9 5 1 10 1s9 4 9 8.9c0 3.9-1.8 6-4 8.8-1 1.2-1.9 2.4-2.8 3.8-1 1.5-1.4 2.7-1.6 3.5-.3 1-.4 1-.6 1Z',
      fillOpacity: 1,
      strokeWeight: 1,
      anchor: new google.maps.Point(15, 29),
      scale: 1.2,
      labelOrigin: new google.maps.Point(10, 9),
    };

    const originMarkerIcon = {
      ...markerIconConfig,
      fillColor: MARKER_ICON_COLORS.active.fill,
      strokeColor: MARKER_ICON_COLORS.active.stroke,
    };

    const destinationMarkerIcon = {
      ...markerIconConfig,
      fillColor: MARKER_ICON_COLORS.inactive.fill,
      strokeColor: MARKER_ICON_COLORS.inactive.stroke,
    };

    const markerIcon = isOriginMarker ? originMarkerIcon : destinationMarkerIcon;
    const labelColor = isOriginMarker ? MARKER_ICON_COLORS.active.label : MARKER_ICON_COLORS.inactive.label;
    const labelText = isOriginMarker ? '●' : label;

    return new google.maps.Marker({
      position: location,
      map: mapInstance,
      label: {
        text: labelText || '',
        fontFamily: 'Arial, sans-serif',
        color: labelColor,
        fontSize: isOriginMarker ? '20px' : '16px',
      },
      icon: markerIcon,
    });
  };

  const getDirections = async (destination: Destination): Promise<google.maps.DirectionsResult | null> => {
    if (!map) return null;

    const directionsService = new google.maps.DirectionsService();
    const request: google.maps.DirectionsRequest = {
      origin: center,
      destination: { placeId: destination.place_id },
      travelMode: destination.travelModeEnum as google.maps.TravelMode,
      unitSystem: distanceMeasurementType === 'METRIC' ? google.maps.UnitSystem.METRIC : google.maps.UnitSystem.IMPERIAL,
    };

    try {
      const response = await directionsService.route(request);
      return response;
    } catch (error) {
      console.error('Directions request failed:', error);
      return null;
    }
  };

  const getCommutesInfo = async (directionResponse: google.maps.DirectionsResult, destination: Destination) => {
    if (!map || !directionResponse) return;

    const path = directionResponse.routes[0].overview_path;
    const bounds = directionResponse.routes[0].bounds;
    const directionLeg = directionResponse.routes[0].legs[0];
    const destinationLocation = directionLeg.end_location;
    const distance = directionLeg.distance.text;
    const duration = convertDurationValueAsString(directionLeg.duration.value);

    const innerStroke = new google.maps.Polyline({
      path,
      strokeColor: STROKE_COLORS.inactive.innerStroke,
      strokeOpacity: 1.0,
      strokeWeight: 3,
      zIndex: 10,
    });

    const outerStroke = new google.maps.Polyline({
      path,
      strokeColor: STROKE_COLORS.inactive.outerStroke,
      strokeOpacity: 1.0,
      strokeWeight: 6,
      zIndex: 1,
    });

    const marker = createMarker(map, destinationLocation.toJSON(), destination.label);

    innerStroke.setMap(map);
    outerStroke.setMap(map);

    const updatedDestination = {
      ...destination,
      distance,
      duration,
      marker,
      polylines: { innerStroke, outerStroke },
      bounds,
    };

    setDestinations((prev) => [...prev, updatedDestination]);
    return updatedDestination;
  };

  const convertDurationValueAsString = (durationValue: number): string => {
    if (!durationValue) return '';
    if (durationValue < MIN_IN_SECONDS) return '<1 min';
    if (durationValue > HOUR_IN_SECONDS * 10) return '10+ hours';

    const hours = Math.floor(durationValue / HOUR_IN_SECONDS);
    const minutes = Math.floor((durationValue % HOUR_IN_SECONDS) / 60);
    const hoursString = hours > 0 ? hours + ' h' : '';
    const minutesString = minutes > 0 ? minutes + ' min' : '';
    const spacer = hoursString && minutesString ? ' ' : '';
    return hoursString + spacer + minutesString;
  };

  const generateMapsUrl = (destination: Destination): string => {
    let googleMapsUrl = 'https://www.google.com/maps/dir/?api=1';
    googleMapsUrl += `&origin=${center.lat},${center.lng}`;
    googleMapsUrl += '&destination=' + encodeURIComponent(destination.name) + '&destination_place_id=' + destination.place_id;
    googleMapsUrl += '&travelmode=' + destination.travelModeEnum.toLowerCase();
    return googleMapsUrl;
  };

  const handleRouteClick = (destination: Destination, destinationIdx: number) => {
    if (activeDestinationIndex !== undefined && destinations[activeDestinationIndex]) {
      const prevDest = destinations[activeDestinationIndex];
      if (prevDest.polylines) {
        prevDest.polylines.innerStroke.setOptions({ strokeColor: STROKE_COLORS.inactive.innerStroke, zIndex: 2 });
        prevDest.polylines.outerStroke.setOptions({ strokeColor: STROKE_COLORS.inactive.outerStroke, zIndex: 1 });
      }
      if (prevDest.marker) {
        prevDest.marker.setIcon({
          path: 'M10 27c-.2 0-.2 0-.5-1-.3-.8-.7-2-1.6-3.5-1-1.5-2-2.7-3-3.8-2.2-2.8-3.9-5-3.9-8.8C1 4.9 5 1 10 1s9 4 9 8.9c0 3.9-1.8 6-4 8.8-1 1.2-1.9 2.4-2.8 3.8-1 1.5-1.4 2.7-1.6 3.5-.3 1-.4 1-.6 1Z',
          fillOpacity: 1,
          strokeWeight: 1,
          anchor: new google.maps.Point(15, 29),
          scale: 1.2,
          fillColor: MARKER_ICON_COLORS.inactive.fill,
          strokeColor: MARKER_ICON_COLORS.inactive.stroke,
        });
      }
    }

    setActiveDestinationIndex(destinationIdx);

    // Make line active
    if (destination.polylines) {
      destination.polylines.innerStroke.setOptions({ strokeColor: STROKE_COLORS.active.innerStroke, zIndex: 101 });
      destination.polylines.outerStroke.setOptions({ strokeColor: STROKE_COLORS.active.outerStroke, zIndex: 99 });
    }

    if (destination.marker) {
      destination.marker.setIcon({
        path: 'M10 27c-.2 0-.2 0-.5-1-.3-.8-.7-2-1.6-3.5-1-1.5-2-2.7-3-3.8-2.2-2.8-3.9-5-3.9-8.8C1 4.9 5 1 10 1s9 4 9 8.9c0 3.9-1.8 6-4 8.8-1 1.2-1.9 2.4-2.8 3.8-1 1.5-1.4 2.7-1.6 3.5-.3 1-.4 1-.6 1Z',
        fillOpacity: 1,
        strokeWeight: 1,
        anchor: new google.maps.Point(15, 29),
        scale: 1.2,
        fillColor: MARKER_ICON_COLORS.active.fill,
        strokeColor: MARKER_ICON_COLORS.active.stroke,
      });
      destination.marker.label.color = '#ffffff';
    }

    if (destination.bounds) {
      map?.fitBounds(destination.bounds);
    }
  };

  const validateDestinationInput = (place: google.maps.places.PlaceResult | null): boolean => {
    let error = '';
    let isValid = false;

    if (!place) {
      error = 'No details available for destination input';
    } else if (destinations.length >= MAX_NUM_DESTINATIONS) {
      error = 'Cannot add more than ' + MAX_NUM_DESTINATIONS + ' destinations';
    } else if (destinations.find((d) => d.place_id === place.place_id)) {
      error = 'Destination is already added';
    } else {
      isValid = true;
    }

    if (!isValid) {
      setErrorMessage(error);
    }
    return isValid;
  };

  const handleAddDestination = async () => {
    if (!validateDestinationInput(selectedPlace)) return;

    const label = getNextMarkerLabel();
    const newDestination: Destination = {
      name: selectedPlace?.name || '',
      place_id: selectedPlace?.place_id || '',
      label,
      travelModeEnum: selectedTravelMode,
      url: '',
    };
    newDestination.url = generateMapsUrl(newDestination);

    const response = await getDirections(newDestination);
    if (response) {
      const updatedDest = await getCommutesInfo(response, newDestination);
      if (updatedDest) {
        setDestinations((prev) => [...prev, updatedDest]);
        setActiveDestinationIndex(destinations.length);
      }
    }

    closeModal();
  };

  const handleEditDestination = async () => {
    if (activeDestinationIndex === undefined) return;
    const destination = { ...destinations[activeDestinationIndex] };

    const isSameDestination = destination.name === destinationInput;
    const isSameTravelMode = destination.travelModeEnum === selectedTravelMode;

    if (isSameDestination && isSameTravelMode) {
      closeModal();
      return;
    }

    if (!isSameDestination && !selectedPlace) {
      return;
    }

    if (!isSameDestination && selectedPlace) {
      destination.name = selectedPlace.name || '';
      destination.place_id = selectedPlace.place_id || '';
      destination.url = generateMapsUrl(destination);
    }

    if (!isSameTravelMode) {
      destination.travelModeEnum = selectedTravelMode;
      destination.url = generateMapsUrl(destination);
    }

    // Remove old polylines and marker
    if (destination.polylines) {
      destination.polylines.innerStroke.setMap(null);
      destination.polylines.outerStroke.setMap(null);
    }
    if (destination.marker) {
      destination.marker.setMap(null);
    }

    const response = await getDirections(destination);
    if (response && map) {
      const path = response.routes[0].overview_path;
      const bounds = response.routes[0].bounds;
      const directionLeg = response.routes[0].legs[0];

      const innerStroke = new google.maps.Polyline({
        path,
        strokeColor: STROKE_COLORS.inactive.innerStroke,
        strokeOpacity: 1.0,
        strokeWeight: 3,
        zIndex: 10,
      });

      const outerStroke = new google.maps.Polyline({
        path,
        strokeColor: STROKE_COLORS.inactive.outerStroke,
        strokeOpacity: 1.0,
        strokeWeight: 6,
        zIndex: 1,
      });

      const marker = createMarker(map, directionLeg.end_location.toJSON(), destination.label);

      innerStroke.setMap(map);
      outerStroke.setMap(map);

      const updatedDestination: Destination = {
        ...destination,
        distance: directionLeg.distance.text,
        duration: convertDurationValueAsString(directionLeg.duration.value),
        marker,
        polylines: { innerStroke, outerStroke },
        bounds,
      };

      setDestinations((prev) => {
        const newDest = [...prev];
        newDest[activeDestinationIndex!] = updatedDestination;
        return newDest;
      });

      handleRouteClick(updatedDestination, activeDestinationIndex);
    }

    closeModal();
  };

  const handleDeleteDestination = () => {
    if (activeDestinationIndex === undefined) return;

    const dest = destinations[activeDestinationIndex];
    if (dest.polylines) {
      dest.polylines.innerStroke.setMap(null);
      dest.polylines.outerStroke.setMap(null);
    }
    if (dest.marker) {
      dest.marker.setMap(null);
    }

    setDestinations((prev) => prev.filter((_, i) => i !== activeDestinationIndex));
    setActiveDestinationIndex(undefined);
    closeModal();
  };

  const openAddModal = () => {
    setModalMode('ADD');
    setDestinationInput('');
    setSelectedPlace(null);
    setSelectedTravelMode(defaultTravelMode);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (index: number) => {
    setModalMode('EDIT');
    setActiveDestinationIndex(index);
    const dest = destinations[index];
    setDestinationInput(dest.name);
    setSelectedTravelMode(dest.travelModeEnum as 'DRIVING' | 'TRANSIT' | 'BICYCLING' | 'WALKING');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDestinationInput('');
    setSelectedPlace(null);
    setErrorMessage('');
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationInput(value);

    if (!map || !value) {
      setSelectedPlace(null);
      return;
    }

    const autocompleteService = new window.google.maps.places.AutocompleteService();
    const bounds = {
      north: center.lat + BIAS_BOUND_DISTANCE,
      south: center.lat - BIAS_BOUND_DISTANCE,
      east: center.lng + BIAS_BOUND_DISTANCE,
      west: center.lng - BIAS_BOUND_DISTANCE,
    };

    try {
      const predictions = await autocompleteService.getPlacePredictions({
        input: value,
        bounds,
        componentRestrictions: { country: 'ke' },
      });

      if (predictions && predictions.length > 0) {
        const placesService = new window.google.maps.places.PlacesService(map);
        placesService.getDetails(
          { placeId: predictions[0].place_id, fields: ['place_id', 'geometry', 'name'] },
          (place) => {
            if (place && place.geometry?.location) {
              setSelectedPlace(place);
            }
          }
        );
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
  };

  return (
    <div className="commutes">
      <CommutesIcons />
      
      <div className="commutes-map" aria-label="Map">
        <div className="map-view" ref={mapRef}></div>
      </div>

      <div className="commutes-info">
        {destinations.length === 0 ? (
          <div className="commutes-initial-state">
            <svg aria-label="Directions Icon" width="53" height="53" fill="none" xmlns="http://www.w3.org/2000/svg">
              <use href="#commutes-initial-icon" />
            </svg>
            <div className="description">
              <h1 className="heading">Estimate commute time</h1>
              <p>See travel time and directions for places nearby</p>
            </div>
            <button className="add-button" onClick={openAddModal} autoFocus>
              <AddIcon />
              <span className="label">Add destination</span>
            </button>
          </div>
        ) : (
          <div className="commutes-destinations">
            <div className="destinations-container">
              <div className="destination-list">
                {destinations.map((dest, idx) => {
                  const TravelModeIcon = TravelModeIcons[dest.travelModeEnum as keyof typeof TravelModeIcons];
                  return (
                    <div
                      key={dest.place_id}
                      className={`destination-container ${activeDestinationIndex === idx ? 'active' : ''}`}
                      onClick={() => handleRouteClick(dest, idx)}
                    >
                      <div className="destination" tabIndex={0} role="button">
                        <div className="destination-content">
                          <div className="metadata">
                            <TravelModeIcon />
                            {dest.distance}
                            <ArrowIcon />
                            <span className="location-marker">{dest.label}</span>
                          </div>
                          <div className="address">
                            To <abbr title={dest.name}>{dest.name}</abbr>
                          </div>
                          <div className="destination-eta">{dest.duration}</div>
                        </div>
                      </div>
                      <div className="destination-controls">
                        <a
                          className="directions-button"
                          href={dest.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Link to directions in Google Maps"
                        >
                          <DirectionsIcon />
                        </a>
                        <button
                          className="edit-button"
                          aria-label="Edit Destination"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(idx);
                          }}
                        >
                          <EditIcon />
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="add-button" onClick={openAddModal}>
                <AddIcon />
                <div className="label">Add destination</div>
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="commutes-modal-container" onClick={closeModal}>
          <div className="commutes-modal" role="dialog" aria-modal="true" aria-labelledby="add-edit-heading" onClick={(e) => e.stopPropagation()}>
            <div className="content">
              <h2 id="add-edit-heading" className="heading">
                {modalMode === 'ADD' ? 'Add destination' : 'Edit destination'}
              </h2>
              <form onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  id="destination-address-input"
                  placeholder="Enter a place or address"
                  autoComplete="off"
                  value={destinationInput}
                  onChange={handleInputChange}
                  className={errorMessage ? 'error' : ''}
                />
                {errorMessage && <div className="error-message" role="alert">{errorMessage}</div>}
                <div className="travel-modes">
                  <input
                    type="radio"
                    name="travel-mode"
                    id="driving-mode"
                    value="DRIVING"
                    checked={selectedTravelMode === 'DRIVING'}
                    onChange={(e) => setSelectedTravelMode(e.target.value as typeof selectedTravelMode)}
                    aria-label="Driving travel mode"
                  />
                  <label htmlFor="driving-mode" className="left-label" title="Driving travel mode">
                    <DrivingIcon />
                  </label>

                  <input
                    type="radio"
                    name="travel-mode"
                    id="transit-mode"
                    value="TRANSIT"
                    checked={selectedTravelMode === 'TRANSIT'}
                    onChange={(e) => setSelectedTravelMode(e.target.value as typeof selectedTravelMode)}
                    aria-label="Public transit travel mode"
                  />
                  <label htmlFor="transit-mode" title="Public transit travel mode">
                    <TransitIcon />
                  </label>

                  <input
                    type="radio"
                    name="travel-mode"
                    id="bicycling-mode"
                    value="BICYCLING"
                    checked={selectedTravelMode === 'BICYCLING'}
                    onChange={(e) => setSelectedTravelMode(e.target.value as typeof selectedTravelMode)}
                    aria-label="Bicycling travel mode"
                  />
                  <label htmlFor="bicycling-mode" title="Bicycling travel mode">
                    <BicyclingIcon />
                  </label>

                  <input
                    type="radio"
                    name="travel-mode"
                    id="walking-mode"
                    value="WALKING"
                    checked={selectedTravelMode === 'WALKING'}
                    onChange={(e) => setSelectedTravelMode(e.target.value as typeof selectedTravelMode)}
                    aria-label="Walking travel mode"
                  />
                  <label htmlFor="walking-mode" className="right-label" title="Walking travel mode">
                    <WalkingIcon />
                  </label>
                </div>
              </form>
              <div className="modal-action-bar">
                {modalMode === 'EDIT' && (
                  <button className="delete-destination-button" onClick={handleDeleteDestination}>
                    Delete
                  </button>
                )}
                <button className="cancel-button" onClick={closeModal}>
                  Cancel
                </button>
                {modalMode === 'ADD' ? (
                  <button className="add-destination-button" onClick={handleAddDestination}>
                    Add
                  </button>
                ) : (
                  <button className="edit-destination-button" onClick={handleEditDestination}>
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommutesMap;
