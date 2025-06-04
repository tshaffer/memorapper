import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Box, IconButton, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationAutocomplete from '../../components/LocationAutocomplete';
import {
  // ExtendedGooglePlaceToVisit,
  Filters,
  SearchQuery,
  Place,
  RestaurantReview,
  PlaceWithGooglePlace,
} from '../../types';
import FiltersDialog from '../../components/FiltersDialog';
import PulsingDots from '../../components/PulsingDots';
// import { useUserContext } from '../../contexts/UserContext';
import { newFilterResults } from '../../utilities/newFilterResults';
import MapWithMarkers from '../../components/MapWIthMarkers';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisiblePlacesList from './VisiblePlacesList';
import PlaceDetailPanel from './PlaceDetailPanel';
import { useSelector } from 'react-redux';
import { RootState, setFilters } from '../../redux';

const MapPage: React.FC = () => {
  const { mrPlacesWithGooglePlaces, settings } = useSelector((state: RootState) => state.memorapper);
  const { _id } = useParams<{ _id: string }>();

  const isMobile = useMediaQuery('(max-width:768px)');

  const [showFiltersDialog, setShowFiltersDialog] = React.useState(false);

  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const [filteredGooglePlaces, setFilteredGooglePlaces] = useState<PlaceWithGooglePlace[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isListVisible, setIsListVisible] = useState(true);
  const [visiblePlaces, setVisiblePlaces] = useState<PlaceWithGooglePlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithGooglePlace | null>(null);

  const prevVisiblePlacesList = useRef<PlaceWithGooglePlace[]>([])

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

        const defaultLocation = {
          lat: 37.3920898, // Default to Crapshack
          lng: -122.1479873,
        };
        console.warn('Using default location:', defaultLocation);

        if (!_id) {
          setMapLocation(defaultLocation);
        }

        return defaultLocation;
      }
    };

    const fetchData = async () => {
      const location = await fetchCurrentLocation();
      filterOnEntry(mrPlacesWithGooglePlaces, location!, settings.filters);
    };

    fetchData();

  }, [_id, mrPlacesWithGooglePlaces]);

  // Update map location based on the provided placeId (_id)
  useEffect(() => {
    if (_id && mrPlacesWithGooglePlaces.length > 0) {
      const googlePlace = mrPlacesWithGooglePlaces.find((placesWithGooglePlaces) => placesWithGooglePlaces.googlePlaceId === _id);
      if (googlePlace && googlePlace.googlePlace!.geometry) {
        const location = {
          lat: googlePlace.googlePlace!.geometry.location.lat,
          lng: googlePlace.googlePlace!.geometry.location.lng,
        };
        setMapLocation(location);
      } else {
        console.warn('Place not found or missing geometry for placeId:', _id);
      }
    }
  }, [_id, mrPlacesWithGooglePlaces]);

  const handleOpenFiltersDialog = () => {
    setShowFiltersDialog(true);
  };

  const executeSearchAndFilter = async (searchQuery: SearchQuery): Promise<void> => {

    console.log('executeSearchAndFilter called with searchQuery:', searchQuery);

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
    googlePlaces: PlaceWithGooglePlace[], location: google.maps.LatLngLiteral, filters: Filters,
  ) => {

    console.log('filterOnEntry called with googlePlaces:', googlePlaces);

    const { distanceAway, restaurantOpen, placeTypes, restaurantTypes, openMeals } = filters;

    const filter: Filters = {
      distanceAway,
      placeTypes,
      restaurantTypes,
      restaurantOpen,
      openMeals,
    };

    const filteredPlaces: PlaceWithGooglePlace[] = newFilterResults(filter, googlePlaces, location);

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
      restaurantOpen: filters.restaurantOpen,
      placeTypes: filters.placeTypes,
      restaurantTypes: filters.restaurantTypes,
      openMeals: filters.openMeals,
      distanceSpec: {
        lat: mapLocation!.lat,
        lng: mapLocation!.lng,
        radius: filters.distanceAway,
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

  const visiblePlacesChanged = (beforeList: PlaceWithGooglePlace[], afterList: PlaceWithGooglePlace[]): boolean => {

    console.log('visiblePlacesChanged called with prevVisiblePlacesList:', beforeList);
    console.log('visiblePlacesChanged called with visiblePlaces:', afterList);
    
    const prevPlaceIds = new Set(beforeList.map(place => place.placeId));
    const currentPlaceIds = new Set(afterList.map(place => place.placeId));

    if (prevPlaceIds.size !== currentPlaceIds.size) {
      return true;
    }

    for (const id of prevPlaceIds) {
      if (!currentPlaceIds.has(id)) {
        return true;
      }
    }

    return false;
  }

  const handleVisiblePlacesChanged = (visiblePlaces: PlaceWithGooglePlace[]) => {
    console.log('handleVisiblePlacesChanged');
    console.log('prevVisiblePlacesList:', prevVisiblePlacesList.current);
    console.log('visiblePlaces:', visiblePlaces);
    if (visiblePlacesChanged(prevVisiblePlacesList.current, visiblePlaces)) {
      console.log('Visible places changed:', visiblePlaces);
      setVisiblePlaces(visiblePlaces);
      prevVisiblePlacesList.current = visiblePlaces;
    }
  }

  // Handler called when a user clicks a place icon or a visible list item.
  const handlePlaceSelect = (place: PlaceWithGooglePlace) => {
    setSelectedPlace(place);
  };

  const handleUpdatePlace = async (updatedPlace: PlaceWithGooglePlace) => {

    // Update the place in your state (and optionally propagate changes to your backend/global store)
    setSelectedPlace(updatedPlace);

    setIsLoading(true);

    try {
      const response = await fetch('/api/submitPlace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedPlace,
        }),
      });
      const data = await response.json();
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting updatePlace:', error);
      setIsLoading(false);
    }

  };

  const handleDeletePlace = (placeId: string) => {
    // Implement deletion logic (backend call, state update, etc.)
    console.log('Delete place with id: ', placeId);
    setSelectedPlace(null);
  };

  const handleAddReview = (placeId: string, review: RestaurantReview) => {
    // Update the selected place with a new review
    // if (selectedPlace) {
    //   const updatedReviews = selectedPlace.restaurant!.restaurantReviews ? [...selectedPlace.restaurantReviews, review] : [review];
    //   setSelectedPlace({ ...selectedPlace, restaurantReviews: updatedReviews });
    // }
  };

  const handleEditReview = (placeId: string, review: RestaurantReview) => {
    // if (selectedPlace && selectedPlace.restaurantReviews) {
    //   const updatedReviews = selectedPlace.restaurantReviews.map(r => r._idRestaurantReview === review._idRestaurantReview ? review : r);
    //   setSelectedPlace({ ...selectedPlace, restaurantReviews: updatedReviews });
    // }
  };

  const handleDeleteReview = (placeId: string, reviewId: string) => {
    // if (selectedPlace && selectedPlace.restaurantReviews) {
    //   const updatedReviews = selectedPlace.restaurantReviews.filter(r => r._idRestaurantReview !== reviewId);
    //   setSelectedPlace({ ...selectedPlace, restaurantReviews: updatedReviews });
    // }
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
          places={filteredGooglePlaces}
          onVisiblePlacesChanged={(visiblePlaces) => handleVisiblePlacesChanged(visiblePlaces)}
          onPlaceSelect={handlePlaceSelect}  // new callback for when a list item is clicked
        />
      </div>
    );
  };

  const renderVisiblePlacesList = () => {
    console.log('renderVisiblePlacesList called with visiblePlaces:', visiblePlaces);
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
