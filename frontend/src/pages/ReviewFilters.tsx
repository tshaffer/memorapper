import React, { useEffect, useState } from 'react';
import { Button, Box } from '@mui/material';
import QueryModal from './QueryModal';
import DistanceFilterModal from './DistanceFilterModal';
import WouldReturnFilterModal from './WouldReturnModal';
import ItemsOrderedModal from './ItemsOrderedModal';
import { DistanceFilter, ItemsOrderedFilter, ReviewUIFilters, WouldReturnFilter } from '../types';

interface ReviewFiltersProps {
  onApplyFilters: (filterState: ReviewUIFilters) => void;
}

const initialDistanceFilter: DistanceFilter = {
  enabled: false,
  useCurrentLocation: true,
  distance: 5,
  specificLocation: null,
};

const initialWouldReturnFilter: WouldReturnFilter = {
  enabled: false,
  values: {
    yes: false,
    no: false,
    notSure: false,
  },
};

const initialItemsOrderedFilter: ItemsOrderedFilter = {
  enabled: false,
  selectedItems: [] as string[],
};

const ReviewFilters: React.FC<ReviewFiltersProps> = ( props: ReviewFiltersProps ) => {
  const { onApplyFilters } = props;
  
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [isDistanceFilterOpen, setIsDistanceFilterOpen] = useState(false);
  const [isWouldReturnFilterOpen, setIsWouldReturnFilterOpen] = useState(false);
  const [isItemsOrderedFilterOpen, setIsItemsOrderedFilterOpen] = useState(false);

  const [queryText, setQueryText] = useState<string | null>(null);
  const [distanceFilter, setDistanceFilter] = useState(initialDistanceFilter);
  const [wouldReturnFilter, setWouldReturnFilter] = useState(initialWouldReturnFilter);
  const [itemsOrderedFilter, setItemsOrderedFilter] = useState(initialItemsOrderedFilter);

  const [itemsOrdered, setItemsOrdered] = useState<string[]>([]);

  useEffect(() => {
    const fetchStandardizedItemsOrdered = async () => {
      const response = await fetch('/api/standardizedNames');
      const uniqueStandardizedNames: string[] = await response.json();
      setItemsOrdered(uniqueStandardizedNames);
    };
    fetchStandardizedItemsOrdered();
  }, []);

  // Clear All Filters
  const clearAllFilters = () => {
    setQueryText(null);
    setDistanceFilter(initialDistanceFilter);
    setWouldReturnFilter(initialWouldReturnFilter);
    setItemsOrderedFilter(initialItemsOrderedFilter);
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
      <Button variant="outlined" onClick={() => setIsQueryModalOpen(true)}>
        {queryText ? `Query ✓` : `Query`}
      </Button>

      {/* Distance Away Button */}
      <Button
        variant="outlined"
        onClick={() => setIsDistanceFilterOpen(true)}
        startIcon={distanceFilter.enabled ? <>&#10003;</> : undefined}
      >
        Distance Away
      </Button>

      {/* Would Return Button */}
      <Button
        variant="outlined"
        onClick={() => setIsWouldReturnFilterOpen(true)}
        startIcon={wouldReturnFilter.enabled ? <>&#10003;</> : undefined}
      >
        Would Return
      </Button>

      {/* Items Ordered Button */}
      <Button
        variant="outlined"
        onClick={() => setIsItemsOrderedFilterOpen(true)}
        startIcon={itemsOrderedFilter.enabled ? <>&#10003;</> : undefined}
      >
        Items Ordered
      </Button>

      {/* Clear All Button */}
      <Button variant="text" color="error" onClick={clearAllFilters}>
        Clear All
      </Button>

      {/* Apply Button */}
      <Button
        variant="contained"
        onClick={() =>
          onApplyFilters({ queryText, distanceFilter, wouldReturnFilter, itemsOrderedFilter })
        }
      >
        Apply
      </Button>

      {/* Modals */}
      <QueryModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        onApply={(newQuery) => {
          setQueryText(newQuery);
          setIsQueryModalOpen(false);
        }}
      />
      <DistanceFilterModal
        isOpen={isDistanceFilterOpen}
        onClose={() => setIsDistanceFilterOpen(false)}
        filterState={distanceFilter}
        onApply={(updatedFilter) => {
          setDistanceFilter(updatedFilter);
          setIsDistanceFilterOpen(false);
        }}
      />
      <WouldReturnFilterModal
        isOpen={isWouldReturnFilterOpen}
        onClose={() => setIsWouldReturnFilterOpen(false)}
        filterState={wouldReturnFilter}
        onApply={(updatedFilter) => {
          setWouldReturnFilter(updatedFilter);
          setIsWouldReturnFilterOpen(false);
        }}
      />
      <ItemsOrderedModal
        isOpen={isItemsOrderedFilterOpen}
        onClose={() => setIsItemsOrderedFilterOpen(false)}
        itemsOrdered={itemsOrdered}
        filterState={itemsOrderedFilter}
        onApply={(updatedFilter) => setItemsOrderedFilter(updatedFilter)}
      />
    </Box>
  );
};

export default ReviewFilters;
