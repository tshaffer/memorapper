import React, { useState } from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';

interface QueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (query: string) => void;
}

const QueryModal: React.FC<QueryModalProps> = ({ isOpen, onClose, onApply }) => {
  const [inputText, setInputText] = useState('');

  function handleApply() {
    onApply(inputText); // Pass query text back to parent
    setInputText(''); // Clear input field
  }

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
          Enter Your Query
        </Typography>
        <TextField
          fullWidth
          placeholder="e.g., restaurants near me"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleApply}
          sx={{ marginTop: 2 }}
        >
          Apply
        </Button>
      </Box>
    </Modal>
  );
};

export default QueryModal;
