import React, { useEffect, useState } from 'react';
import { Button, Box, useMediaQuery, useTheme, IconButton } from '@mui/material';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import SocialDistanceIcon from '@mui/icons-material/SocialDistance';
import RecommendIcon from '@mui/icons-material/Recommend';
import ListIcon from '@mui/icons-material/List';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if screen size is mobile

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
        justifyContent: isMobile ? 'space-around' : 'flex-start',
      }}
    >
      {/* Query Button */}
      {isMobile ? (
        <IconButton onClick={() => setIsQueryModalOpen(true)} aria-label="Query">
          <QuestionMarkIcon />
        </IconButton>
      ) : (
        <Button
          variant="outlined"
          onClick={() => setIsQueryModalOpen(true)}
        >
          {queryText ? `Query ✓` : `Query`}
        </Button>
      )}

      {/* Distance Button */}
      {isMobile ? (
        <IconButton onClick={() => setIsDistanceFilterOpen(true)} aria-label="Distance">
          <SocialDistanceIcon />
        </IconButton>
      ) : (
        <Button
          variant="outlined"
          onClick={() => setIsDistanceFilterOpen(true)}
          startIcon={distanceFilter.enabled ? <>&#10003;</> : undefined}
        >
          Distance
        </Button>
      )}

      {/* Would Return Button */}
      {isMobile ? (
        <IconButton onClick={() => setIsWouldReturnFilterOpen(true)} aria-label="Return">
          <RecommendIcon />
        </IconButton>
      ) : (
        <Button
          variant="outlined"
          onClick={() => setIsWouldReturnFilterOpen(true)}
          startIcon={wouldReturnFilter.enabled ? <>&#10003;</> : undefined}
        >
          Return
        </Button>
      )}

      {/* Items Button */}
      {isMobile ? (
        <IconButton onClick={() => setIsItemsOrderedFilterOpen(true)} aria-label="Items">
          <ListIcon />
        </IconButton>
      ) : (
        <Button
          variant="outlined"
          onClick={() => setIsItemsOrderedFilterOpen(true)}
          startIcon={itemsOrderedFilter.enabled ? <>&#10003;</> : undefined}
        >
          Items
        </Button>
      )}

      {/* Clear Button */}
      {isMobile ? (
        <IconButton onClick={clearAllFilters} aria-label="Clear">
          <ClearIcon />
        </IconButton>
      ) : (
        <Button variant="text" color="error" onClick={clearAllFilters}>
          Clear
        </Button>
      )}

      {/* Apply Button */}
      {isMobile ? (
        <IconButton
          onClick={() =>
            onApplyFilters({ queryText, distanceFilter, wouldReturnFilter, itemsOrderedFilter })
          }
          aria-label="Apply"
        >
          <SearchIcon />
        </IconButton>
      ) : (
        <Button
          variant="contained"
          onClick={() =>
            onApplyFilters({ queryText, distanceFilter, wouldReturnFilter, itemsOrderedFilter })
          }
        >
          Apply
        </Button>
      )}

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
