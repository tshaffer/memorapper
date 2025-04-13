import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Box, IconButton, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationAutocomplete from '../../components/LocationAutocomplete';
import {
  // ExtendedGooglePlaceToVisit,
  Filters,
  GooglePlace,
  FilterResultsParams,
  SearchQuery,
  Place,
  RestaurantReview,
} from '../../types';
import FiltersDialog from '../../components/FiltersDialog';
import PulsingDots from '../../components/PulsingDots';
import { useUserContext } from '../../contexts/UserContext';
import { newFilterResults } from '../../utilities/newFilterResults';
import MapWithMarkers from '../../components/MapWIthMarkers';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisiblePlacesList from './VisiblePlacesList';
import PlaceDetailPanel from './PlaceDetailPanel';

const MapPage: React.FC = () => {
  const { googlePlaces, places, settings, setFilters } = useUserContext();
  const { _id } = useParams<{ _id: string }>();

  const isMobile = useMediaQuery('(max-width:768px)');

  const [showFiltersDialog, setShowFiltersDialog] = React.useState(false);

  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const [filteredGooglePlaces, setFilteredGooglePlaces] = useState<GooglePlace[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isListVisible, setIsListVisible] = useState(true);
  const [visiblePlaces, setVisiblePlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const toggleList = () => {
    setIsListVisible((prev) => !prev);
  };

  // Responsive container style:
  // - On mobile, stack the list above the map.
  // - On desktop, place the list to the left of the map.
  const contentContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    overflow: 'hidden',
  };

  // Fetch current location and places/reviews on mount
  useEffect(() => {

    const fetchCurrentLocation = async (): Promise<google.maps.LatLngLiteral | null> => {

      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser.');
        return null;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { enableHighAccuracy: true }
          );
        });

        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (!_id) {
          setMapLocation(location);
        }

        return location;

      } catch (error) {
        console.error('Error getting current location: ', error);
        return null;
      }
    };

    const fetchData = async () => {
      const location = await fetchCurrentLocation();
      filterOnEntry(googlePlaces, location!, settings.filters);
    };

    fetchData();

  }, [_id]);

  // Update map location based on the provided placeId (_id)
  useEffect(() => {
    if (_id && googlePlaces.length > 0) {
      const googlePlace = googlePlaces.find((googlePlace) => googlePlace.googlePlaceId === _id);
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
  }, [_id, googlePlaces]);

  const handleOpenFiltersDialog = () => {
    setShowFiltersDialog(true);
  };

  const executeSearchAndFilter = async (searchQuery: SearchQuery): Promise<void> => {

    const requestBody = { searchQuery };

    try {
      const apiResponse = await fetch('/api/searchAndFilter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data: any = await apiResponse.json();

      setFilteredGooglePlaces(data.places);
    } catch (error) {
      console.error('Error executing filter query:', error);
    }
  }

  const filterOnEntry = (
    googlePlaces: any, location: google.maps.LatLngLiteral, filters: Filters,
  ) => {

    const { distanceAwayFilter, isOpenNowFilterEnabled } = filters;

    const filter: FilterResultsParams = {
      distanceAwayFilter,
      openNowFilter: isOpenNowFilterEnabled,
    };

    const filteredPlaces: GooglePlace[] = newFilterResults(filter, googlePlaces, location);

    setFilteredGooglePlaces(filteredPlaces);
  }

  const handleSetFilters = async (
    query: string,
    filters: Filters,
  ) => {

    handleCloseFiltersDialog();

    setFilters(filters);

    setIsLoading(true);

    const searchQuery: SearchQuery = {
      query,
      isOpenNow: filters.isOpenNowFilterEnabled,
      distanceAway: {
        lat: mapLocation!.lat,
        lng: mapLocation!.lng,
        radius: filters.distanceAwayFilter,
      }
    };

    await executeSearchAndFilter(searchQuery);

    setIsLoading(false);
  }

  const handleCloseFiltersDialog = () => {
    setShowFiltersDialog(false);
  };

  const handleSetMapLocation = (location: google.maps.LatLngLiteral): void => {
    setMapLocation(location);
  }

  const handleVisiblePlacesChanged = (visiblePlaces: Place[]) => {
    setVisiblePlaces(visiblePlaces);
  }

  // Handler called when a user clicks a place icon or a visible list item.
  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleUpdatePlace = (updatedPlace: Place) => {
    // Update the place in your state (and optionally propagate changes to your backend/global store)
    setSelectedPlace(updatedPlace);
    // e.g., update your places list if needed
  };

  const handleDeletePlace = (placeId: string) => {
    // Implement deletion logic (backend call, state update, etc.)
    console.log('Delete place with id: ', placeId);
    setSelectedPlace(null);
  };

  const handleAddReview = (placeId: string, review: RestaurantReview) => {
    // Update the selected place with a new review
    if (selectedPlace) {
      const updatedReviews = selectedPlace.restaurantReviews ? [...selectedPlace.restaurantReviews, review] : [review];
      setSelectedPlace({ ...selectedPlace, restaurantReviews: updatedReviews });
    }
  };

  const handleEditReview = (placeId: string, review: RestaurantReview) => {
    if (selectedPlace && selectedPlace.restaurantReviews) {
      const updatedReviews = selectedPlace.restaurantReviews.map(r => r._idRestaurantReview === review._idRestaurantReview ? review : r);
      setSelectedPlace({ ...selectedPlace, restaurantReviews: updatedReviews });
    }
  };

  const handleDeleteReview = (placeId: string, reviewId: string) => {
    if (selectedPlace && selectedPlace.restaurantReviews) {
      const updatedReviews = selectedPlace.restaurantReviews.filter(r => r._idRestaurantReview !== reviewId);
      setSelectedPlace({ ...selectedPlace, restaurantReviews: updatedReviews });
    }
  };

  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) {
      return null;
    }
    return (<PulsingDots />);
  };

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
          key={JSON.stringify({ googlePlaces: filteredGooglePlaces, specifiedLocation: mapLocation })} // Forces re-render on prop change
          initialCenter={mapLocation!}
          places={places}
          onVisiblePlacesChanged={(visiblePlaces) => handleVisiblePlacesChanged(visiblePlaces)}
          // onPlaceSelect={handlePlaceSelect}  // new callback for when a marker is clicked
          onPlaceSelect={() => {console.log('place clicked')}}  // new callback for when a marker is clicked
        />
      </div>
    );
  };

  const renderVisiblePlacesList = () => {
    return (
      <div style={contentContainerStyle}>
        {isListVisible && (
          <VisiblePlacesList
            visiblePlaces={visiblePlaces}
            onPlaceSelect={handlePlaceSelect}  // new callback for when a list item is clicked
          />
        )}
        <div style={{ flex: 1 }}>{renderMap()}</div>
      </div>
    );
  }

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
      {/* Header */}
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
        {/* Toggle Icon integrated into the header */}
        <IconButton onClick={toggleList}>
          {isListVisible ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>

        {/* Location Autocomplete */}
        <Box
          id="map-page-locationAutocomplete-container"
          sx={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}
        >
          <LocationAutocomplete onSetMapLocation={handleSetMapLocation} />
        </Box>

        {/* Filters Button */}
        <Box sx={{ flexShrink: 0 }}>
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

      {renderPulsingDots()}

      {/* Main Content */}
      {renderVisiblePlacesList()}

      {/* PlaceDetailPanel: only rendered when a place is selected */}
      {selectedPlace && (
        
        <PlaceDetailPanel
          open={true}
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onUpdatePlace={handleUpdatePlace}
          onDeletePlace={handleDeletePlace}
          onAddReview={handleAddReview}
          onEditReview={handleEditReview}
          onDeleteReview={handleDeleteReview}
        />
      )}

      {/* Filters Dialog */}
      <FiltersDialog
        open={showFiltersDialog}
        filters={settings.filters}
        onSetFilters={handleSetFilters}
        onClose={handleCloseFiltersDialog}
      />
    </Paper>
  );
};

export default MapPage;
