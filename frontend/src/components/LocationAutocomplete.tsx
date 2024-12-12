import React from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Button, useMediaQuery, Typography, Box } from '@mui/material';
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile, row on desktop
        alignItems: { xs: 'flex-start', sm: 'center' }, // Align based on screen size
        gap: 2,
        width: '100%',
      }}
    >
      <Button
        onClick={handleUseCurrentLocation}
        sx={{
          width: { xs: '100%', sm: '200px' }, // Full width on mobile, fixed width on desktop
          padding: '8px 16px',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          '&:hover': {
            background: '#0056b3',
          },
        }}
      >
        Current Location
      </Button>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' }, // Stack label and input on mobile
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          width: '100%',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'nowrap', // Prevent wrapping of text
            marginBottom: { xs: 1, sm: 0 }, // Add spacing below label on mobile
          }}
        >
          Specify location:
        </Typography>

        <Autocomplete
          onLoad={(autocomplete) => (mapAutocompleteRef.current = autocomplete)}
          onPlaceChanged={handleMapLocationChanged}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter the location"
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '8px',
              boxSizing: 'border-box',
              fontSize: isMobile ? '14px' : '16px', // Adjust font size for mobile
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </Autocomplete>
      </Box>
    </Box>
  );
};

export default LocationAutocomplete;
