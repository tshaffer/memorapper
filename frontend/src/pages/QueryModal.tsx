import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import React, { useState } from "react";

const QueryModal: React.FC = () => {
  const [queryText, setQueryText] = useState<string | null>(null);
  const toggleQueryModal = () => setIsQueryModalOpen((prev) => !prev);

  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

  const applyFiltersAndQuery = () => {
    console.log('Applying filters and query');
  }
  
  return (
    <Modal open={isQueryModalOpen} onClose={toggleQueryModal}>
      <Box
        sx={{
          padding: 3,
          backgroundColor: 'white',
          borderRadius: 2,
          width: '400px',
          margin: 'auto',
          marginTop: '20vh',
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Enter Your Query
        </Typography>
        <TextField
          fullWidth
          placeholder="e.g., restaurants near me"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={() => {
            toggleQueryModal();
            applyFiltersAndQuery(); // Trigger filtering when the modal closes
          }}
          sx={{ marginTop: 2 }}
        >
          Apply
        </Button>
      </Box>
    </Modal>
  );
}

export default QueryModal;
