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
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: isMobile ? '12px' : '24px',
        minHeight: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          marginBottom: 2,
          width: '100%',
        }}
      >
        {/* Location Autocomplete */}
        <Box sx={{ flex: 1 }}>
          <LocationAutocomplete onSetMapLocation={(location) => console.log('Set Map Location:', location)} />
        </Box>

        {/* Filters Button */}
        <IconButton
          onClick={handleOpenFiltersDialog}
          sx={{
            backgroundColor: '#007bff',
            color: '#fff',
            '&:hover': { backgroundColor: '#0056b3' },
          }}
        >
          <SearchIcon />
        </IconButton>
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
