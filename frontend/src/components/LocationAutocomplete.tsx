import { Autocomplete } from '@react-google-maps/api';
import { useMediaQuery } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { GooglePlace } from '../types';
import { useParams } from 'react-router-dom';

const LocationAutocomplete: React.FC = () => {

  const { _id } = useParams<{ _id: string }>();

  const isMobile = useMediaQuery('(max-width:768px)');

  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);

  const mapAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

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

    fetchCurrentLocation();
    fetchPlaces();
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
      } else {
        console.warn('Place not found or missing geometry for placeId:', _id);
      }
    }
  }, [_id, places]);

  const handleMapLocationChanged = () => {
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

  return (
    <Autocomplete
      onLoad={(autocomplete) => (mapAutocompleteRef.current = autocomplete)}
      onPlaceChanged={handleMapLocationChanged}
    >
      <input
        type="text"
        placeholder="Enter the location"
        onChange={handleAutocompleteInputChange} // Custom input handling
        style={{
          width: '100%',
          padding: isMobile ? '8px' : '10px', // Smaller padding for mobile
          boxSizing: 'border-box',
          fontSize: isMobile ? '14px' : '16px', // Adjust font size
        }}
      />
    </Autocomplete>
  );
};

export default LocationAutocomplete;
