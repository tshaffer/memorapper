import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Modal,
  useMediaQuery,
  useTheme,
} from '@mui/material';

interface WouldReturnFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: {
    enabled: boolean;
    values: {
      yes: boolean;
      no: boolean;
      notSure: boolean;
    };
  };
  onApply: (newState: WouldReturnFilterModalProps['filterState']) => void;
}

const WouldReturnFilterModal: React.FC<WouldReturnFilterModalProps> = ({
  isOpen,
  onClose,
  filterState,
  onApply,
}) => {
  const [localFilterState, setLocalFilterState] = useState(filterState);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect mobile screens

  const toggleValue = (key: keyof typeof localFilterState.values) => {
    setLocalFilterState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [key]: !prev.values[key],
      },
    }));
  };

  const handleApply = () => {
    const isEnabled =
      localFilterState.values.yes ||
      localFilterState.values.no ||
      localFilterState.values.notSure;

    onApply({
      ...localFilterState,
      enabled: isEnabled,
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

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          width: isMobile ? '90%' : '400px', // Responsive width
          margin: 'auto',
          marginTop: isMobile ? '10vh' : '20vh', // Adjust vertical position for mobile
          backgroundColor: 'white',
          padding: isMobile ? 2 : 3, // Adjust padding for mobile
          borderRadius: 2,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant="h6"
          sx={{ marginBottom: 2, textAlign: isMobile ? 'center' : 'left' }} // Center text for mobile
        >
          Would Return Filter
        </Typography>

        {/* Filter Options */}
        <FormControlLabel
          control={
            <Checkbox
              checked={localFilterState.values.yes}
              onChange={() => toggleValue('yes')}
            />
          }
          label="Yes"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={localFilterState.values.no}
              onChange={() => toggleValue('no')}
            />
          }
          label="No"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={localFilterState.values.notSure}
              onChange={() => toggleValue('notSure')}
            />
          }
          label="Not Sure"
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

export default WouldReturnFilterModal;
