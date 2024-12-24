import React from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { IconButton, useMediaQuery, Typography, Box, Tooltip } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
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
      id="location-autocomplete-container"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '4px' : 2,
        width: '100%',
        minWidth: 0, // Ensures proper flex shrinking when needed
      }}
    >
      {/* Current Location Icon */}
      <Tooltip title="Current Location">
        <IconButton
          onClick={handleUseCurrentLocation}
          sx={{
            backgroundColor: '#007bff',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#0056b3',
            },
          }}
        >
          <MyLocationIcon />
        </IconButton>
      </Tooltip>

      {/* Label */}
      <Typography
        variant="body1"
        sx={{
          whiteSpace: 'nowrap',
        }}
      >
        Specify location:
      </Typography>

      {/* Autocomplete Input */}
      <Box
        sx={{
          flex: 1, // Take remaining space after the label
          minWidth: 0, // Prevent layout issues with shrinking
        }}
      >
        <Autocomplete
          onLoad={(autocomplete) => (mapAutocompleteRef.current = autocomplete)}
          onPlaceChanged={handleMapLocationChanged}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter the location"
            style={{
              width: '100%', // Fill available space
              padding: isMobile ? '8px' : '10px',
              boxSizing: 'border-box',
              fontSize: isMobile ? '14px' : '16px',
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
