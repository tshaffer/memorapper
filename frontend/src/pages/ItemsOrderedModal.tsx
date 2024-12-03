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
          width: '80%',
          margin: 'auto',
          marginTop: '10vh',
          backgroundColor: 'white',
          padding: 3,
          borderRadius: 2,
          maxHeight: '80vh',
          overflowY: 'auto', // Ensure the modal scrolls if content overflows
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Items Ordered Filter
        </Typography>

        {/* Multi-Column Checkbox Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', // Adjust column width as needed
            gap: 2, // Space between items
            marginBottom: 2,
          }}
        >
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

export default ItemsOrderedModal;
