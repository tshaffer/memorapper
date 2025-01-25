import React, { useState, useEffect } from 'react';
import { ReviewedRestaurantWithPlace, ReviewedRestaurant, NewRestaurant, GooglePlace } from '../types';
import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps';
import '../App.css';

// // https://icon-sets.iconify.design/?query=<query>
import ReviewedRestaurantMarker from './ReviewedRestaurantMarker';
import NewRestaurantMarker from './NewRestaurantMarker';
import ReviewedRestaurantInfoWindow from './ReviewedRestaurantInfoWindow';
import NewRestaurantInfoWindow from './NewRestaurantInfoWindow';
import { useUserContext } from '../contexts/UserContext';

const DEFAULT_ZOOM = 14;

const CustomBlueDot = () => (
  <div style={{
    width: '16px',
    height: '16px',
    backgroundColor: '#4285F4',
    borderRadius: '50%',
    border: '2px solid #FFFFFF',
    boxShadow: '0 0 8px rgba(66, 133, 244, 0.5)',
  }} />
);

interface MapWithMarkersProps {
  initialCenter: google.maps.LatLngLiteral;
  reviewedRestaurants: ReviewedRestaurant[];
  newRestaurants: NewRestaurant[];
  blueDotLocation?: google.maps.LatLngLiteral;
}

const MapWithMarkers: React.FC<MapWithMarkersProps> = ({ initialCenter, reviewedRestaurants, newRestaurants, blueDotLocation }) => {

  const { places } = useUserContext();

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const [selectedReviewedRestaurant, setSelectedReviewedRestaurant] = useState<ReviewedRestaurantWithPlace | null>(null);
  const [selectedNewRestaurant, setSelectedNewRestaurant] = useState<NewRestaurant | null>(null);

  useEffect(() => {

    // const handleKeyDown = (event: KeyboardEvent) => {
    //   if ((event.metaKey || event.ctrlKey) && (event.key === '+' || event.key === '=' || event.key === '-')) {
    //     event.preventDefault();
    //     if (event.key === '+' || event.key === '=') {
    //       setZoom(zoom + 1);
    //     } else if (event.key === '-') {
    //       setZoom(zoom - 1);
    //     }
    //   }
    // };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && (event.key === '+' || event.key === '=' || event.key === '-')) {
        event.preventDefault();
        setZoom((prevZoom) => (event.key === '+' || event.key === '=') ? prevZoom + 1 : prevZoom - 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  // }, [zoom]);


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.error("Error getting current location: ", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);


  const getPlaceFromPlaceId = (placeId: string): GooglePlace | null => {
    for (const place of places) {
      if (place.googlePlaceId === placeId) {
        return place;
      }
    };
    return null;
  }

  const handleReviewedRestaurantClicked = (reviewedRestaurantWithPlace: ReviewedRestaurantWithPlace) => {
    setSelectedReviewedRestaurant(reviewedRestaurantWithPlace);
    setSelectedNewRestaurant(null);
  };

  const handleNewRestaurantClick = (newRestaurant: NewRestaurant) => {
    setSelectedNewRestaurant(newRestaurant);
    setSelectedReviewedRestaurant(null);
  };

  const handleCloseInfoWindow = () => {
    setSelectedReviewedRestaurant(null);
    setSelectedNewRestaurant(null);
  };

  const renderReviewedRestaurantMarker = (reviewedRestaurant: ReviewedRestaurant, index: number): JSX.Element => {
    const googlePlace = getPlaceFromPlaceId(reviewedRestaurant.googlePlaceId);
    const reviewedRestaurantWithPlace: ReviewedRestaurantWithPlace = { ...reviewedRestaurant, googlePlace: googlePlace! };
    return (
      <ReviewedRestaurantMarker
        key={`location-${index}`}
        reviewedRestaurant={reviewedRestaurantWithPlace}
        onMarkerClick={(reviewedRestaurantWithPlace) => handleReviewedRestaurantClicked(reviewedRestaurantWithPlace)}
      >
      </ReviewedRestaurantMarker>
    );
  };

  const renderNewRestaurantMarker = (newRestaurant: NewRestaurant, index: number): JSX.Element => {
    return (
      <NewRestaurantMarker
        key={`location-${index}`}
        newRestaurant={newRestaurant}
        onMarkerClick={(clickedRestaurant: NewRestaurant) => handleNewRestaurantClick(clickedRestaurant)}
      >
      </NewRestaurantMarker>
    );
  };

  const googleMapsApiKey = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY!;
  console.log('MapWithMarkers: googleMapsApiKey:', googleMapsApiKey);

  return (
    <APIProvider apiKey={googleMapsApiKey} version="beta">
      <Map
        style={{ width: '100%', height: '100%' }}
        id="gmap"
        mapId="1ca0b6526e7d4819"
        defaultCenter={initialCenter}
        zoom={zoom}
        onZoomChanged={(event) => setZoom(event.detail.zoom)}
        fullscreenControl={false}
        zoomControl
        gestureHandling="greedy"
        scrollwheel
        mapTypeControl={false}
        streetViewControl={false}
        rotateControl={false}
        scaleControl={false}
      >
        {reviewedRestaurants.map((reviewedRestaurant, index) => renderReviewedRestaurantMarker(reviewedRestaurant, index))}
        {newRestaurants.map((newRestaurant, index) => renderNewRestaurantMarker(newRestaurant, index))}
        {currentLocation && (
          <AdvancedMarker position={blueDotLocation || currentLocation}>
            <CustomBlueDot />
          </AdvancedMarker>
        )}
        {selectedReviewedRestaurant && (
          <ReviewedRestaurantInfoWindow reviewedRestaurant={selectedReviewedRestaurant} onClose={handleCloseInfoWindow} />
        )}
        {selectedNewRestaurant && (
          <NewRestaurantInfoWindow newRestaurant={selectedNewRestaurant} onClose={handleCloseInfoWindow} />
        )}
      </Map>
    </APIProvider>
  );
};

export default MapWithMarkers;
