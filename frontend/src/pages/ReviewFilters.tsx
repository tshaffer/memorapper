import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import QueryModal from './QueryModal';

const ReviewFilters: React.FC = () => {
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [queryText, setQueryText] = useState<string | null>(null);

  function toggleQueryModal() {
    setIsQueryModalOpen((prev) => !prev);
  }

  function handleQueryApply(newQuery: string) {
    setQueryText(newQuery); // Update query text in the parent state
    setIsQueryModalOpen(false); // Close the modal
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Query Button */}
      <Button variant="outlined" onClick={toggleQueryModal}>
        {queryText ? `Query ✓` : `Query`}
      </Button>

      {/* Other Filter Buttons */}
      <Button variant="outlined">Outdoor Seating</Button>
      <Button variant="outlined">Open Now</Button>
      <Button variant="outlined">Vegan Options</Button>

      {/* Clear All Button */}
      <Button
        variant="text"
        color="error"
        onClick={() => {
          setQueryText(null); // Clear query text
        }}
      >
        Clear All
      </Button>

      {/* Query Modal */}
      <QueryModal
        isOpen={isQueryModalOpen}
        onClose={toggleQueryModal}
        onApply={handleQueryApply}
      />
    </Box>
  );
};

export default ReviewFilters;
