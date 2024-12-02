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
        flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile, horizontal on larger screens
        alignItems: 'center',
        gap: 2,
        padding: 2,
        borderBottom: '1px solid #ccc',
        flexWrap: 'wrap', // Wrap buttons on smaller screens
      }}
    >
      {/* Query Button */}
      <Button
        variant="outlined"
        onClick={() => setIsQueryModalOpen(true)}
        sx={{ minWidth: 'fit-content' }} // Adjust button width
      >
        {queryText ? `Query ✓` : `Query`}
      </Button>

      {/* Distance Button */}
      <Button
        variant="outlined"
        onClick={() => setIsDistanceFilterOpen(true)}
        startIcon={distanceFilter.enabled ? <>&#10003;</> : undefined}
        sx={{ minWidth: 'fit-content' }}
      >
        Distance
      </Button>

      {/* Return Button */}
      <Button
        variant="outlined"
        onClick={() => setIsWouldReturnFilterOpen(true)}
        startIcon={wouldReturnFilter.enabled ? <>&#10003;</> : undefined}
        sx={{ minWidth: 'fit-content' }}
      >
        Return
      </Button>

      {/* Items Button */}
      <Button
        variant="outlined"
        onClick={() => setIsItemsOrderedFilterOpen(true)}
        startIcon={itemsOrderedFilter.enabled ? <>&#10003;</> : undefined}
        sx={{ minWidth: 'fit-content' }}
      >
        Items
      </Button>

      {/* Clear Button */}
      <Button
        variant="text"
        color="error"
        onClick={clearAllFilters}
        sx={{ minWidth: 'fit-content' }}
      >
        Clear
      </Button>

      {/* Apply Button */}
      <Button
        variant="contained"
        onClick={() =>
          onApplyFilters({ queryText, distanceFilter, wouldReturnFilter, itemsOrderedFilter })
        }
        sx={{ minWidth: 'fit-content' }}
      >
        Apply
      </Button>
    </Box>
  );
};

export default ReviewFilters;
