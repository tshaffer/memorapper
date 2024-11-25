import { Autocomplete, Libraries, LoadScript } from '@react-google-maps/api';
import MapWithMarkers from '../components/MapWIthMarkers';
import { Paper, useMediaQuery } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { ExtendedGooglePlace, GooglePlace, MemoRappReview } from '../types';
import { useParams } from 'react-router-dom';

const MapPage: React.FC = () => {
  const { _id } = useParams<{ _id: string }>();
  console.log('MapPage _id:', _id);

  const isMobile = useMediaQuery('(max-width:768px)');

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [reviews, setReviews] = useState<MemoRappReview[]>([]);

  const mapAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const libraries = ['places'] as Libraries;

  // Fetch current location and places/reviews on mount
  useEffect(() => {
    const fetchCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentLocation(location);
            // If no placeId is provided, use current location as default
            if (!_id) {
              setMapLocation(location);
            }
          },
          (error) => console.error('Error getting current location: ', error),
          { enableHighAccuracy: true }
        );
      }
    };

    const fetchPlaces = async () => {
      const response = await fetch('/api/places');
      const data = await response.json();
      setPlaces(data.googlePlaces);
    };

    const fetchReviews = async () => {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      setReviews(data.memoRappReviews);
    };

    fetchCurrentLocation();
    fetchPlaces();
    fetchReviews();
  }, [_id]);

  // Update map location based on the provided placeId (_id)
  useEffect(() => {
    if (_id && places.length > 0) {
      const googlePlace = places.find((place) => place.place_id === _id);
      if (googlePlace && googlePlace.geometry) {
        const location = {
          lat: googlePlace.geometry.location.lat,
          lng: googlePlace.geometry.location.lng,
        };
        setMapLocation(location);
        console.log('Setting map location based on placeId:', location);
      } else {
        console.warn('Place not found or missing geometry for placeId:', _id);
      }
    }
  }, [_id, places]);

  const handleMapLocationChanged = () => {
    console.log('handleMapLocationChanged');
    if (mapAutocompleteRef.current) {
      const place: google.maps.places.PlaceResult = mapAutocompleteRef.current.getPlace();
      if (place?.geometry !== undefined) {
        const geometry = place.geometry!;
        const newCoordinates: google.maps.LatLngLiteral = {
          lat: geometry.location!.lat(),
          lng: geometry.location!.lng(),
        };
        setMapLocation(newCoordinates);
        console.log('Place changed:', place, newCoordinates);
      } else {
        console.error('No place found in handleMapLocationChanged');
      }
    }
  };

  const handleAutocompleteInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleAutocompleteInputChange');
    const inputValue = event.target.value.trim().toLowerCase();
    if (inputValue === 'current location') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const location = { lat: latitude, lng: longitude };
            setMapLocation(location);
            console.log('Current Location google.maps.LatLngLiteral:', location);
          },
          (error) => console.error('Error retrieving current location:', error)
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    }
  };

  const renderMapAutocomplete = (): JSX.Element => (
    <Autocomplete
      onLoad={(autocomplete) => (mapAutocompleteRef.current = autocomplete)}
      onPlaceChanged={handleMapLocationChanged}
    >
      <input
        type="text"
        placeholder="Enter the location"
        onChange={handleAutocompleteInputChange}
        style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
      />
    </Autocomplete>
  );

  const renderMap = () => {
    if (!mapLocation) {
      return null;
    }
    return (
      <div style={{ height: '700px', width: '100%' }}>
        <MapWithMarkers
          key={JSON.stringify({ googlePlaces: places, specifiedLocation: mapLocation })} // Forces re-render on prop change
          initialCenter={mapLocation!}
          locations={getExtendedGooglePlaces()}
        />
      </div>
    );
  };

  const getReviewsForPlace = (placeId: string): MemoRappReview[] =>
    reviews.filter((review) => review.place_id === placeId);

  const getExtendedGooglePlaces = (): ExtendedGooglePlace[] =>
    places.map((place) => ({
      ...place,
      reviews: getReviewsForPlace(place.place_id),
    }));

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY!} libraries={libraries}>
      <Paper
        style={{
          padding: isMobile ? '16px' : '24px',
          marginBottom: isMobile ? '56px' : '0',
          minHeight: '100vh',
        }}
      >
        {renderMapAutocomplete()}
        {renderMap()}
      </Paper>
    </LoadScript>
  );
};

export default MapPage;
