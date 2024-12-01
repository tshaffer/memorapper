import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Modal,
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

export default WouldReturnFilterModal;
