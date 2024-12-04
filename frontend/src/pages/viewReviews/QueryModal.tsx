import React, { useState } from 'react';
import { Box, Button, Modal, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';

interface QueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (query: string) => void;
}

const QueryModal: React.FC<QueryModalProps> = ({ isOpen, onClose, onApply }) => {
  const [inputText, setInputText] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if the device is mobile

  function handleApply() {
    onApply(inputText); // Pass query text back to parent
    onClose(); // Close the modal
  }

  const handleDisable = () => {
    onApply(''); // Pass query text back to parent
    setInputText(''); // Clear input field
    onClose(); // Close the modal
  }
  
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          width: isMobile ? '90%' : '400px', // Full width for mobile, fixed width for desktop
          margin: 'auto',
          marginTop: isMobile ? '10vh' : '20vh', // Lower modal for smaller screens
          backgroundColor: 'white',
          padding: isMobile ? 2 : 3, // Adjust padding for mobile
          borderRadius: 2,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2, textAlign: 'center' }}>
          Enter Your Query
        </Typography>
        <TextField
          fullWidth
          placeholder="e.g., restaurants near me"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          inputProps={{ style: { fontSize: isMobile ? '0.875rem' : '1rem' } }} // Smaller font for mobile
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

export default QueryModal;
