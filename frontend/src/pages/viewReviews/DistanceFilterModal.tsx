import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Modal,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';
import { DistanceFilter } from '../../types';

interface DistanceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: DistanceFilter;
  onApply: (newState: DistanceFilterModalProps['filterState']) => void;
}

const DistanceFilterModal: React.FC<DistanceFilterModalProps> = (props: DistanceFilterModalProps) => {
  const { isOpen, onClose, filterState, onApply } = props;
  const [localFilterState, setLocalFilterState] = useState(filterState);
  const specificLocationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect mobile screens

  const handleApply = () => {
    // Enable the filter before applying
    onApply({
      ...localFilterState,
      enabled: true,
    });
    onClose();
  };

  const handleDisable = () => {
    // Reset the filter state to default
    onApply({
      ...localFilterState,
      enabled: false,
    });
    onClose();
  }

  const handleSpecificLocationPlaceChanged = () => {
    if (specificLocationAutocompleteRef.current) {
      const place = specificLocationAutocompleteRef.current.getPlace();
      if (place.geometry !== undefined) {
        const geometry: google.maps.places.PlaceGeometry = place.geometry!;
        setLocalFilterState(
          {
            ...localFilterState,
            specificLocation: {
              lat: geometry.location!.lat(),
              lng: geometry.location!.lng(),
            }
          }
        );
        console.log("From location place changed:", place);
      }
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          width: isMobile ? '90%' : '400px', // Responsive width
          margin: 'auto',
          marginTop: isMobile ? '10vh' : '20vh',
          backgroundColor: 'white',
          padding: isMobile ? 2 : 3,
          borderRadius: 2,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2, textAlign: isMobile ? 'center' : 'left' }}>
          Configure Distance Filter
        </Typography>

        {/* Distance Options */}
        <RadioGroup
          value={localFilterState.useCurrentLocation ? 'current' : 'specific'}
          onChange={(e) =>
            setLocalFilterState({
              ...localFilterState,
              useCurrentLocation: e.target.value === 'current',
            })
          }
          sx={{ marginTop: 2 }}
        >
          <FormControlLabel value="current" control={<Radio />} label="From Current Location" />
          <FormControlLabel value="specific" control={<Radio />} label="From Specific Location" />
        </RadioGroup>

        {/* Autocomplete Input */}
        {!localFilterState.useCurrentLocation && (
          <Autocomplete
            onLoad={(autocomplete) => (specificLocationAutocompleteRef.current = autocomplete)}
            onPlaceChanged={handleSpecificLocationPlaceChanged}
          >
            <input
              type="text"
              placeholder="Enter a specific location"
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
        <Typography gutterBottom textAlign={isMobile ? 'center' : 'left'}>
          Distance: {localFilterState.distance} miles
        </Typography>
        <Slider
          value={localFilterState.distance}
          onChange={(e, value) =>
            setLocalFilterState({
              ...localFilterState,
              distance: value as number,
            })
          }
          min={0}
          max={10}
          step={0.1}
        />

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            marginTop: 2,
          }}
        >
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDisable}
            variant="text"
            color="error"
          >
            Disable
          </Button>
          <Button onClick={handleApply} variant="contained">
            Apply
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DistanceFilterModal;
