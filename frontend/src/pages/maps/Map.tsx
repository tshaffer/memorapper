import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Box, IconButton, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationAutocomplete from '../../components/LocationAutocomplete';
import MapWithMarkers from '../../components/MapWIthMarkers';
import { ExtendedGooglePlace, GooglePlace, MemoRappReview, SearchUIFilters, WouldReturnFilter } from '../../types';
import FiltersDialog from '../../components/FiltersDialog';


const MapPage: React.FC = () => {
  const { _id } = useParams<{ _id: string }>();

  const isMobile = useMediaQuery('(max-width:768px)');

  const [showFiltersDialog, setShowFiltersDialog] = React.useState(false);

  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<GooglePlace[]>([]);

  const [reviews, setReviews] = useState<MemoRappReview[]>([]);

  const [isLoading, setIsLoading] = useState(false);

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
      setFilteredPlaces(data.googlePlaces);
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

  const getExtendedGooglePlaces = (inputPlaces: GooglePlace[]): ExtendedGooglePlace[] =>
    inputPlaces.map((place) => ({
      ...place,
      reviews: getReviewsForPlace(place.place_id),
    }));

  const handleOpenFiltersDialog = () => {
    setShowFiltersDialog(true);
  };

  const executeFilter = async (
    query: string,
    distanceAway: number,
    isOpenNow: boolean,
    wouldReturn: WouldReturnFilter,
  ): Promise<void> => {

    const filter: SearchUIFilters = { distanceAwayFilter: distanceAway, openNowFilter: isOpenNow, wouldReturnFilter: wouldReturn };

    console.log('executeFilter:', filter);

    const requestBody = { filter, places, reviews, mapLocation };

    try {
      const apiResponse = await fetch('/api/reviews/filterResults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data: any = await apiResponse.json();
      console.log('filter query results:', data.places, data.reviews);

      setFilteredPlaces(data.places);
      // setFilteredReviews(reviews);
    } catch (error) {
      console.error('Error executing filter query:', error);
    }
  }

  const handleSetFilters = async (
    query: string,
    distanceAway: number,
    isOpenNow: boolean,
    wouldReturn: WouldReturnFilter,
  ) => {

    console.log('handleSetFilters:', query, distanceAway, isOpenNow, wouldReturn);

    handleCloseFiltersDialog();

    setIsLoading(true);
    await executeFilter(query, distanceAway, isOpenNow, wouldReturn);
    setIsLoading(false);


  }

  const handleCloseFiltersDialog = () => {
    setShowFiltersDialog(false);
  };

  const handleExecuteQuery = (query: string) => {
    console.log('Executed Query:', query);
    handleCloseFiltersDialog();
  };

  const handleSetMapLocation = (location: google.maps.LatLngLiteral): void => {
    setMapLocation(location);
  }

  const renderMap = () => {

    console.log('renderMap:', mapLocation, filteredPlaces);

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
          key={JSON.stringify({ googlePlaces: filteredPlaces, specifiedLocation: mapLocation })} // Forces re-render on prop change
          initialCenter={mapLocation!}
          locations={getExtendedGooglePlaces(filteredPlaces)}
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
      <FiltersDialog
        open={showFiltersDialog}
        onSetFilters={handleSetFilters}
        onClose={handleCloseFiltersDialog}
      />
    </Paper>
  );
};

export default MapPage;
