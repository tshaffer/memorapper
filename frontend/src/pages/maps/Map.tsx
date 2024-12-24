import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationAutocomplete from '../../components/LocationAutocomplete';
import SearchFilters from '../search/SearchFilters';
import MapWithMarkers from '../../components/MapWIthMarkers';
import { ExtendedGooglePlace, GooglePlace, MemoRappReview } from '../../types';

const MapPage: React.FC = () => {
  const { _id } = useParams<{ _id: string }>();

  const isMobile = useMediaQuery('(max-width:768px)');

  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [reviews, setReviews] = useState<MemoRappReview[]>([]);

  // Fetch current location and places/reviews on mount
  useEffect(() => {
    const fetchCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            if (!_id) {
              setMapLocation(location);
            }
          },
          (error) => console.error('Error getting current location: ', error),
          { enableHighAccuracy: true }
        );
      }
    };

    const fetchPlaces = async () => {
      const response = await fetch('/api/places');
      const data = await response.json();
      setPlaces(data.googlePlaces);
    };

    const fetchReviews = async () => {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      setReviews(data.memoRappReviews);
    };

    fetchCurrentLocation();
    fetchPlaces();
    fetchReviews();
  }, [_id]);

  // Update map location based on the provided placeId (_id)
  useEffect(() => {
    if (_id && places.length > 0) {
      const googlePlace = places.find((place) => place.place_id === _id);
      if (googlePlace && googlePlace.geometry) {
        const location = {
          lat: googlePlace.geometry.location.lat,
          lng: googlePlace.geometry.location.lng,
        };
        setMapLocation(location);
      } else {
        console.warn('Place not found or missing geometry for placeId:', _id);
      }
    }
  }, [_id, places]);

  const getReviewsForPlace = (placeId: string): MemoRappReview[] =>
    reviews.filter((review) => review.place_id === placeId);

  const getExtendedGooglePlaces = (): ExtendedGooglePlace[] =>
    places.map((place) => ({
      ...place,
      reviews: getReviewsForPlace(place.place_id),
    }));

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

  const handleSetMapLocation = (location: google.maps.LatLngLiteral): void => {
    setMapLocation(location);
  }

  const renderMap = () => {
    if (!mapLocation) {
      return null;
    }
    return (
      <div
        style={{
          flexGrow: 1, // Allow the map to grow and fill available space
          height: '100%', // Ensure it fills the parent's height
          width: '100%',
        }}
      >
        <MapWithMarkers
          key={JSON.stringify({ googlePlaces: places, specifiedLocation: mapLocation })} // Forces re-render on prop change
          initialCenter={mapLocation!}
          locations={getExtendedGooglePlaces()}
        />
      </div>
    );
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
        id="map-page-header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          marginBottom: 2,
          width: '100%',
        }}
      >
        {/* LocationAutocomplete */}
        <Box
          id="map-page-locationAutocomplete-container"
          sx={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}
        >
          <LocationAutocomplete
            onSetMapLocation={(location) => handleSetMapLocation(location)} />
        </Box>

        {/* Filters Button */}
        <Box
          sx={{
            flexShrink: 0, // Prevent shrinking of the button
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
      <div style={{ flex: 1 }}>{renderMap()}</div>

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
