import { Box, Button } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import { useState, MouseEvent } from 'react';

const ReviewsFilters: React.FC = () => {

  const [isOutdoorSeating, setIsOutdoorSeating] = useState(false);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [queryText, setQueryText] = useState<string | null>(null);
  const [isVegan, setIsVegan] = useState(false);

  function toggleQueryModal() {
    // Open a modal to enter a query
  }
  
  function toggleVegan() {
    setIsVegan(prev => !prev);
  }
  
  function toggleOpenNow() {
    setIsOpenNow(prev => !prev);
  }

  function toggleOutdoorSeating() {
    setIsOutdoorSeating(prev => !prev);
  }
  
  function applyFiltersAndQuery(event: MouseEvent<HTMLButtonElement>): void {
    console.log('Applying filters and query');
  }

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
      <Button
        variant="outlined"
        onClick={toggleQueryModal}
        startIcon={queryText ? <CheckIcon /> : undefined} // Checkmark if query is active
      >
        Query
      </Button>

      {/* Filter Buttons */}
      <Button
        variant={isOutdoorSeating ? 'contained' : 'outlined'}
        onClick={toggleOutdoorSeating}
      >
        Outdoor Seating
      </Button>
      <Button variant={isOpenNow ? 'contained' : 'outlined'} onClick={toggleOpenNow}>
        Open Now
      </Button>
      <Button variant={isVegan ? 'contained' : 'outlined'} onClick={toggleVegan}>
        Vegan Options
      </Button>

      {/* Apply Button */}
      <Button
        variant="contained"
        onClick={applyFiltersAndQuery} // Function to apply all active filters and queries
        sx={{ marginLeft: 'auto' }} // Push to the right
      >
        Apply
      </Button>
    </Box>

  );
}

export default ReviewsFilters;
