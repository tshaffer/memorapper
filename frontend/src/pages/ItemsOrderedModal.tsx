import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Modal,
} from '@mui/material';

interface ItemsOrderedModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemsOrdered: string[]; // List of all available items
  filterState: {
    enabled: boolean;
    selectedItems: string[];
  };
  onApply: (newState: ItemsOrderedModalProps['filterState']) => void;
}

const ItemsOrderedModal: React.FC<ItemsOrderedModalProps> = ({
  isOpen,
  onClose,
  itemsOrdered,
  filterState,
  onApply,
}) => {
  const [localFilterState, setLocalFilterState] = useState(filterState);

  const toggleItemSelection = (item: string) => {
    setLocalFilterState((prev) => {
      const isSelected = prev.selectedItems.includes(item);
      const updatedItems = isSelected
        ? prev.selectedItems.filter((i) => i !== item) // Remove item if already selected
        : [...prev.selectedItems, item]; // Add item if not selected
      return {
        ...prev,
        selectedItems: updatedItems,
      };
    });
  };

  const handleApply = () => {
    const isEnabled = localFilterState.selectedItems.length > 0;

    onApply({
      ...localFilterState,
      enabled: isEnabled,
    });
    onClose();
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
          Items Ordered Filter
        </Typography>

        {/* List of Items */}
        <Box sx={{ maxHeight: '300px', overflowY: 'auto', marginBottom: 2 }}>
          {itemsOrdered.map((item) => (
            <FormControlLabel
              key={item}
              control={
                <Checkbox
                  checked={localFilterState.selectedItems.includes(item)}
                  onChange={() => toggleItemSelection(item)}
                />
              }
              label={item}
            />
          ))}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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

export default ItemsOrderedModal;
