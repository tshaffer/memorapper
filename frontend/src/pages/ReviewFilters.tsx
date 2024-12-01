import React, { useEffect, useState } from 'react';
import { Button, Box } from '@mui/material';
import QueryModal from './QueryModal';
import DistanceFilterModal from './DistanceFilterModal';
import WouldReturnFilterModal from './WouldReturnModal';
import ItemsOrderedModal from './ItemsOrderedModal';

const ReviewFilters: React.FC = () => {
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [isDistanceFilterOpen, setIsDistanceFilterOpen] = useState(false);
  const [isWouldReturnFilterOpen, setIsWouldReturnFilterOpen] = useState(false);
  const [isItemsOrderedFilterOpen, setIsItemsOrderedFilterOpen] = useState(false);

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
  const [itemsOrderedFilter, setItemsOrderedFilter] = useState({
    enabled: false,
    selectedItems: [] as string[],
  });

  const [itemsOrdered, setItemsOrdered] = useState<string[]>([]);

  useEffect(() => {
    const fetchStandardizedItemsOrdered = async () => {
      const response = await fetch('/api/standardizedNames');
      const uniqueStandardizedNames: string[] = await response.json();
      setItemsOrdered(uniqueStandardizedNames);
    }
    fetchStandardizedItemsOrdered();
  }, []);


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

  const toggleItemsOrderedFilterModal = () => {
    setIsItemsOrderedFilterOpen((prev) => !prev);
  };
  const handleItemsOrderedFilterApply = (updatedFilter: typeof itemsOrderedFilter) => {
    setItemsOrderedFilter(updatedFilter);
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
    setItemsOrderedFilter({
      enabled: false,
      selectedItems: [],
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

      <Button
        variant="outlined"
        onClick={toggleItemsOrderedFilterModal}
        startIcon={itemsOrderedFilter.enabled ? <>&#10003;</> : undefined}
      >
        Items Ordered
      </Button>

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
      <ItemsOrderedModal
        isOpen={isItemsOrderedFilterOpen}
        onClose={toggleItemsOrderedFilterModal}
        itemsOrdered={itemsOrdered}
        filterState={itemsOrderedFilter}
        onApply={handleItemsOrderedFilterApply}
      />
    </Box>
  );
};

export default ReviewFilters;
