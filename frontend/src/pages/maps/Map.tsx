import React, { useState } from 'react';
import { Paper, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationAutocomplete from '../../components/LocationAutocomplete';
import SearchFilters from '../search/SearchFilters';

const MapPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width:768px)');
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

  const handleOpenFiltersDialog = () => {
    setFiltersDialogOpen(true);
  };

  const handleCloseFiltersDialog = () => {
    setFiltersDialogOpen(false);
  };

  const handleExecuteQuery = (query: string) => {
    console.log('Executed Query:', query);
    handleCloseFiltersDialog();
  };

  const handleExecuteFilter = (filters: any) => {
    console.log('Executed Filters:', filters);
    handleCloseFiltersDialog();
  };

  const handleSetSortCriteria = (sortCriteria: any) => {
    console.log('Set Sort Criteria:', sortCriteria);
  };

  return (
    <Paper
      id="map-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: isMobile ? '2px' : '24px',
        minHeight: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >

      <Box
        id='map-page-header'
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          marginBottom: 2,
          width: '100%',
          flexWrap: 'wrap', // Allow wrapping to avoid overlap
        }}
      >
        {/* LocationAutocomplete */}
        <Box
          id='map-page-locationAutocomplete-container'
          sx={{ flex: 1, minWidth: 0 }}
        >
          <LocationAutocomplete onSetMapLocation={(location) => console.log('Set Map Location:', location)} />
        </Box>

        {/* Filters Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            // marginTop: isMobile ? 1 : 0, // Add margin to handle wrapping on mobile
          }}
        >
          <IconButton
            onClick={handleOpenFiltersDialog}
            sx={{
              backgroundColor: '#007bff',
              color: '#fff',
              padding: isMobile ? '6px' : '8px',
              fontSize: isMobile ? '18px' : '24px',
              '&:hover': { backgroundColor: '#0056b3' },
            }}
          >
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Map Display */}
      <div style={{ flex: 1 }}>{/* Render your map component here */}</div>

      {/* Filters Dialog */}
      <Dialog open={filtersDialogOpen} onClose={handleCloseFiltersDialog} fullWidth maxWidth="sm">
        <DialogTitle>Search Filters</DialogTitle>
        <DialogContent>
          <SearchFilters
            onExecuteQuery={handleExecuteQuery}
            onExecuteFilter={handleExecuteFilter}
            onSetSortCriteria={handleSetSortCriteria}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFiltersDialog} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MapPage;
