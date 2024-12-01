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
} from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';

interface DistanceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: {
    enabled: boolean;
    useCurrentLocation: boolean;
    distance: number;
    specificLocation: string | null;
  };
  onApply: (newState: DistanceFilterModalProps['filterState']) => void;
}

const DistanceFilterModal: React.FC<DistanceFilterModalProps> = ({
  isOpen,
  onClose,
  filterState,
  onApply,
}) => {
  const [localFilterState, setLocalFilterState] = useState(filterState);
  const fromLocationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleApply = () => {
    onApply(localFilterState);
  };

  const handleFromLocationPlaceChanged = () => {
    if (fromLocationAutocompleteRef.current) {
      const place = fromLocationAutocompleteRef.current.getPlace();
      setLocalFilterState({
        ...localFilterState,
        specificLocation: place?.formatted_address || null,
      });
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          width: '400px',
          margin: 'auto',
          marginTop: '20vh',
          backgroundColor: 'white',
          padding: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
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

        {/* Autocomplete Input */}
        {!localFilterState.useCurrentLocation && (
          <Autocomplete
            onLoad={(autocomplete) => (fromLocationAutocompleteRef.current = autocomplete)}
            onPlaceChanged={handleFromLocationPlaceChanged}
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
        <Typography gutterBottom>Distance: {localFilterState.distance} miles</Typography>
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
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
