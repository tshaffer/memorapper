import React from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Button, useMediaQuery } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

interface LocationAutocompleteProps {
  onSetMapLocation: (mapLocation: google.maps.LatLngLiteral) => void;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = (props: LocationAutocompleteProps) => {
  const { _id } = useParams<{ _id: string }>();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const mapAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
              setCurrentLocation(location);
            }
          },
          (error) => console.error('Error getting current location: ', error),
          { enableHighAccuracy: true }
        );
      }
    };

    fetchCurrentLocation();
  }, [_id]);

  const handleUseCurrentLocation = () => {
    props.onSetMapLocation(currentLocation!);

    // Clear the Autocomplete input field
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleMapLocationChanged = () => {
    if (mapAutocompleteRef.current) {
      const place: google.maps.places.PlaceResult = mapAutocompleteRef.current.getPlace();
      if (place?.geometry !== undefined) {
        const geometry = place.geometry!;
        const newCoordinates: google.maps.LatLngLiteral = {
          lat: geometry.location!.lat(),
          lng: geometry.location!.lng(),
        };
        props.onSetMapLocation(newCoordinates);
        console.log('Place changed:', place, newCoordinates);
      } else {
        console.error('No place found in handleMapLocationChanged');
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex', // Makes children align horizontally
        alignItems: 'center', // Aligns items vertically in the center
        gap: '8px', // Adds space between items
      }}
    >
      <Button
        onClick={handleUseCurrentLocation}
        style={{
          width: '200px', // Explicit width for the button
          padding: '8px 16px',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Current Location
      </Button>

      <Autocomplete
        onLoad={(autocomplete) => (mapAutocompleteRef.current = autocomplete)}
        onPlaceChanged={handleMapLocationChanged}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter the location"
          style={{
            width: '600px',
            maxWidth: '600px',
            padding: isMobile ? '8px' : '10px', // Smaller padding for mobile
            boxSizing: 'border-box',
            fontSize: isMobile ? '14px' : '16px', // Adjust font size
          }}
        />
      </Autocomplete>
    </div>
  );
};

export default LocationAutocomplete;
