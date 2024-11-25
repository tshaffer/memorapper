import { Autocomplete, Libraries, LoadScript } from '@react-google-maps/api';
import MapWithMarkers from '../components/MapWIthMarkers';
import { Paper, useMediaQuery } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { ExtendedGooglePlace, GooglePlace, MemoRappReview } from '../types';

const MapPage: React.FC = () => {

  const isMobile = useMediaQuery('(max-width:768px)');

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const mapAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [reviews, setReviews] = useState<MemoRappReview[]>([]);

  const libraries = ['places'] as Libraries;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setMapLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Error getting current location: ", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
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
    fetchPlaces();
    fetchReviews();
  }, []);

  const getReviewsForPlace = (placeId: string): MemoRappReview[] => {
    return reviews.filter((memoRappReview: MemoRappReview) => memoRappReview.place_id === placeId);
  };

  const getExtendedGooglePlaces = (): ExtendedGooglePlace[] => {
    return places.map((place: GooglePlace) => {
      const reviewsForPlace: MemoRappReview[] = getReviewsForPlace(place.place_id);
      return {
        ...place,
        reviews: reviewsForPlace,
      };
    });
  }

  const handleMapLocationChanged = () => {
    console.log('handleMapLocationChanged');
    if (mapAutocompleteRef.current) {
      const place: google.maps.places.PlaceResult = mapAutocompleteRef.current.getPlace();
      if (place?.geometry !== undefined) {
        const geometry: google.maps.places.PlaceGeometry = place.geometry!;
        const newCoordinates: google.maps.LatLngLiteral = {
          lat: geometry.location!.lat(),
          lng: geometry.location!.lng(),
        };
        setMapLocation(newCoordinates);
        console.log("Place changed:", place, newCoordinates);
      } else {
        console.error("No place found in handelMapLocationChanged");
      }
    }
  };

  const handleAutocompleteInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleAutocompleteInputChange');
    const inputValue = event.target.value.trim().toLowerCase();
    if (inputValue === "current location") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setMapLocation(
              {
                lat: latitude,
                lng: longitude,
              }
            );
            console.log("Current Location google.maps.LatLngLiteral:", { latitude, longitude });
          },
          (error) => {
            console.error("Error retrieving current location:", error);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    }
  };

  const renderMapAutocomplete = (): JSX.Element => {
    return (
      <Autocomplete
        onLoad={(autocomplete) => {
          mapAutocompleteRef.current = autocomplete;
          if (autocomplete) {
            // Ensure required fields are loaded
            autocomplete.setFields(['geometry', 'formatted_address']);
          }
        }}
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
  };
  
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

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY!} libraries={libraries}>
      <Paper
        style={{
          padding: isMobile ? '16px' : '24px',
          marginBottom: isMobile ? '56px' : '0', // Space for fixed buttons on mobile
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
