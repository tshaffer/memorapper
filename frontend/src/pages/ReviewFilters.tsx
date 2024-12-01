import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import QueryModal from './QueryModal';
import DistanceFilterModal from './DistanceFilterModal';
import WouldReturnFilterModal from './WouldReturnModal';

const ReviewFilters: React.FC = () => {
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [isDistanceFilterOpen, setIsDistanceFilterOpen] = useState(false);
  const [isWouldReturnFilterOpen, setIsWouldReturnFilterOpen] = useState(false);

  const [queryText, setQueryText] = useState<string | null>(null);
  const [distanceFilter, setDistanceFilter] = useState({
    enabled: false,
    useCurrentLocation: true,
    distance: 5,
    specificLocation: null as string | null,
  });
  const [wouldReturnFilter, setWouldReturnFilter] = useState({
    enabled: false,
    values: {
      yes: false,
      no: false,
      notSure: false,
    },
  });
  // Toggle Query Modal
  const toggleQueryModal = () => setIsQueryModalOpen((prev) => !prev);

  // Handle Query Apply
  const handleQueryApply = (newQuery: string) => {
    setQueryText(newQuery);
    setIsQueryModalOpen(false);
  };

  // Toggle Distance Filter Modal
  const toggleDistanceFilterModal = () => setIsDistanceFilterOpen((prev) => !prev);

  // Handle Distance Filter Apply
  const handleDistanceFilterApply = (updatedFilter: typeof distanceFilter) => {
    setDistanceFilter(updatedFilter);
    setIsDistanceFilterOpen(false);
  };

  const toggleWouldReturnFilterModal = () => setIsWouldReturnFilterOpen((prev) => !prev);

  // Handle WouldReturn Filter Apply
  const handleWouldReturnFilterApply = (updatedFilter: typeof wouldReturnFilter) => {
    setWouldReturnFilter(updatedFilter);
    setIsWouldReturnFilterOpen(false);
  };

  // Clear All Filters
  const clearAllFilters = () => {
    setQueryText(null);
    setDistanceFilter({
      enabled: false,
      useCurrentLocation: true,
      distance: 5,
      specificLocation: null,
    });
    setWouldReturnFilter({
      enabled: false,
      values: {
        yes: false,
        no: false,
        notSure: false,
      },
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        borderBottom: '1px solid #ccc',
      }}
    >
      {/* Query Button */}
      <Button variant="outlined" onClick={toggleQueryModal}>
        {queryText ? `Query ✓` : `Query`}
      </Button>

      {/* Distance Away Button */}
      <Button
        variant="outlined"
        onClick={toggleDistanceFilterModal}
        startIcon={distanceFilter.enabled ? <>&#10003;</> : undefined} // Checkmark if enabled
      >
        Distance Away
      </Button>

      <Button
        variant="outlined"
        onClick={toggleWouldReturnFilterModal}
        startIcon={wouldReturnFilter.enabled ? <>&#10003;</> : undefined} // Checkmark if enabled
      >
        Would Return
      </Button>

      {/* Placeholder Buttons */}
      <Button variant="outlined">Open Now</Button>
      <Button variant="outlined">Vegan Options</Button>

      {/* Clear All Button */}
      <Button variant="text" color="error" onClick={clearAllFilters}>
        Clear All
      </Button>

      {/* Apply Button */}
      <Button variant="contained" onClick={() => console.log('Apply filters')}>
        Apply
      </Button>

      {/* Modals */}
      <QueryModal
        isOpen={isQueryModalOpen}
        onClose={toggleQueryModal}
        onApply={handleQueryApply}
      />
      <DistanceFilterModal
        isOpen={isDistanceFilterOpen}
        onClose={toggleDistanceFilterModal}
        filterState={distanceFilter}
        onApply={handleDistanceFilterApply}
      />
      <WouldReturnFilterModal
        isOpen={isWouldReturnFilterOpen}
        onClose={toggleWouldReturnFilterModal}
        filterState={wouldReturnFilter}
        onApply={handleWouldReturnFilterApply}
      />
    </Box>
  );
};

export default ReviewFilters;
