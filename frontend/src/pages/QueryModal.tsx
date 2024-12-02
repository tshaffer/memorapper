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
        <Button
          variant="contained"
          onClick={handleApply}
          sx={{
            marginTop: 2,
            fontSize: isMobile ? '0.875rem' : '1rem', // Adjust button font size
            alignSelf: 'center', // Center button horizontally
          }}
        >
          Apply
        </Button>
      </Box>
    </Modal>
  );
};

export default QueryModal;
