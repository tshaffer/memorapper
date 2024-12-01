import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import QueryModal from './QueryModal';
import DistanceFilter from './DistanceFilter';

const ReviewFilters: React.FC = () => {
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [queryText, setQueryText] = useState<string | null>(null);
  const [distanceFilter, setDistanceFilter] = useState({
    enabled: false,
    useCurrentLocation: true,
    distance: 5, // Default distance
    specificLocation: null as string | null,
  });

  // Toggle Query Modal
  const toggleQueryModal = () => setIsQueryModalOpen((prev) => !prev);

  // Handle Query Apply
  const handleQueryApply = (newQuery: string) => {
    setQueryText(newQuery); // Update query text
    setIsQueryModalOpen(false); // Close modal
  };

  // Handle Distance Filter Update
  const handleDistanceFilterChange = (updatedFilter: typeof distanceFilter) => {
    setDistanceFilter(updatedFilter);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Query Button */}
      <Button variant="outlined" onClick={toggleQueryModal}>
        {queryText ? `Query ✓` : `Query`}
      </Button>

      {/* Distance Filter */}
      <DistanceFilter
        filterState={distanceFilter}
        onFilterChange={handleDistanceFilterChange}
      />

      {/* Other Filter Buttons */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined">Outdoor Seating</Button>
        <Button variant="outlined">Open Now</Button>
        <Button variant="outlined">Vegan Options</Button>
      </Box>

      {/* Clear All Button */}
      <Button
        variant="text"
        color="error"
        onClick={() => {
          setQueryText(null);
          setDistanceFilter({
            enabled: false,
            useCurrentLocation: true,
            distance: 5,
            specificLocation: null,
          });
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
