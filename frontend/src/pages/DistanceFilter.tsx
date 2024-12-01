import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
} from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';

const DistanceFilter: React.FC = () => {
  const [distanceFilterEnabled, setDistanceFilterEnabled] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [distance, setDistance] = useState<number>(5); // Default to 5 miles
  const [specificLocation, setSpecificLocation] = useState<string | null>(null);
  const fromLocationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const toggleDistanceFilter = () => {
    setDistanceFilterEnabled((prev) => !prev);
    if (!distanceFilterEnabled) {
      setSpecificLocation(null); // Reset specific location if the filter is turned off
    }
  };

  const handleFromLocationPlaceChanged = () => {
    if (fromLocationAutocompleteRef.current) {
      const place = fromLocationAutocompleteRef.current.getPlace();
      setSpecificLocation(place?.formatted_address || null);
    }
  };

  return (
    <Box
      sx={{
        border: '1px solid #ccc',
        borderRadius: 2,
        padding: 2,
        marginBottom: 2,
        backgroundColor: distanceFilterEnabled ? '#f5f5f5' : 'white',
      }}
    >
      {/* Filter Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Distance Away
        </Typography>
        <Button
          variant={distanceFilterEnabled ? 'contained' : 'outlined'}
          onClick={toggleDistanceFilter}
        >
          {distanceFilterEnabled ? 'Disable' : 'Enable'}
        </Button>
      </Box>

      {distanceFilterEnabled && (
        <>
          {/* Distance Options */}
          <RadioGroup
            value={useCurrentLocation ? 'current' : 'specific'}
            onChange={(e) => setUseCurrentLocation(e.target.value === 'current')}
            sx={{ marginTop: 2 }}
          >
            <FormControlLabel
              value="current"
              control={<Radio />}
              label="From Current Location"
            />
            <FormControlLabel
              value="specific"
              control={<Radio />}
              label="From Specific Location"
            />
          </RadioGroup>

          {/* Autocomplete Input for Specific Location */}
          {!useCurrentLocation && (
            <Autocomplete
              onLoad={(autocomplete) => (fromLocationAutocompleteRef.current = autocomplete)}
              onPlaceChanged={handleFromLocationPlaceChanged}
            >
              <input
                type="text"
                placeholder="Enter a from location"
                style={{
                  fontSize: '0.875rem',
                  width: '100%',
                  padding: '10px',
                  boxSizing: 'border-box',
                  marginBottom: '10px',
                }}
                disabled={!distanceFilterEnabled} // Disable when filter is off
              />
            </Autocomplete>
          )}

          {/* Distance Slider */}
          <Typography gutterBottom>Distance: {distance} miles</Typography>
          <Slider
            value={distance}
            onChange={(e, value) => setDistance(value as number)}
            min={0}
            max={10}
            step={0.1}
            disabled={!distanceFilterEnabled} // Disable when filter is off
          />
        </>
      )}
    </Box>
  );
};

export default DistanceFilter;
