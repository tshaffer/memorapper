import React, { useRef } from 'react';
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

interface DistanceFilterProps {
  filterState: {
    enabled: boolean;
    useCurrentLocation: boolean;
    distance: number;
    specificLocation: string | null;
  };
  onFilterChange: (newState: DistanceFilterProps['filterState']) => void;
}

const DistanceFilter: React.FC<DistanceFilterProps> = ({
  filterState,
  onFilterChange,
}) => {
  const fromLocationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Toggle Distance Filter
  const toggleDistanceFilter = () => {
    onFilterChange({
      ...filterState,
      enabled: !filterState.enabled,
    });
  };

  // Handle Radio Change
  const handleUseCurrentLocationChange = (useCurrent: boolean) => {
    onFilterChange({
      ...filterState,
      useCurrentLocation: useCurrent,
    });
  };

  // Handle Slider Change
  const handleDistanceChange = (newDistance: number) => {
    onFilterChange({
      ...filterState,
      distance: newDistance,
    });
  };

  // Handle Autocomplete Place Change
  const handleFromLocationPlaceChanged = () => {
    if (fromLocationAutocompleteRef.current) {
      const place = fromLocationAutocompleteRef.current.getPlace();
      onFilterChange({
        ...filterState,
        specificLocation: place?.formatted_address || null,
      });
    }
  };

  return (
    <Box
      sx={{
        border: '1px solid #ccc',
        borderRadius: 2,
        padding: 2,
        backgroundColor: filterState.enabled ? '#f5f5f5' : 'white',
      }}
    >
      {/* Filter Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Distance Away
        </Typography>
        <Button
          variant={filterState.enabled ? 'contained' : 'outlined'}
          onClick={toggleDistanceFilter}
        >
          {filterState.enabled ? 'Disable' : 'Enable'}
        </Button>
      </Box>

      {filterState.enabled && (
        <>
          {/* Distance Options */}
          <RadioGroup
            value={filterState.useCurrentLocation ? 'current' : 'specific'}
            onChange={(e) => handleUseCurrentLocationChange(e.target.value === 'current')}
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
          {!filterState.useCurrentLocation && (
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
              />
            </Autocomplete>
          )}

          {/* Distance Slider */}
          <Typography gutterBottom>Distance: {filterState.distance} miles</Typography>
          <Slider
            value={filterState.distance}
            onChange={(e, value) => handleDistanceChange(value as number)}
            min={0}
            max={10}
            step={0.1}
          />
        </>
      )}
    </Box>
  );
};

export default DistanceFilter;
