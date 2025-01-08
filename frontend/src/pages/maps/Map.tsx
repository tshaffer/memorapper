import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Box, IconButton, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationAutocomplete from '../../components/LocationAutocomplete';
import MapWithMarkers from '../../components/MapWIthMarkers';
import { ExtendedGooglePlace, ExtendedGooglePlaceToVisit, FilterResultsParams, Filters, UnvisitedPlace, UnvisitedPlaceFromDb, GooglePlace, MemoRappReview, SearchQuery, SearchResponse } from '../../types';
import FiltersDialog from '../../components/FiltersDialog';
import PulsingDots from '../../components/PulsingDots';
import { filterResults } from '../../utilities';
import { useUserContext } from '../../contexts/UserContext';

const MapPage: React.FC = () => {
  const { _id } = useParams<{ _id: string }>();
  const { settings, setFilters } = useUserContext();

  const isMobile = useMediaQuery('(max-width:768px)');

  const [showFiltersDialog, setShowFiltersDialog] = React.useState(false);

  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<GooglePlace[]>([]);
  const [unvisitedPlaces, setUnvisitedPlaces] = useState<GooglePlace[]>([]);
  const [unvisitedPlacesToVisit, setUnvisitedPlacesToVisit] = useState<UnvisitedPlace[]>([]);

  const [reviews, setReviews] = useState<MemoRappReview[]>([]);

  const [isLoading, setIsLoading] = useState(false);

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

    const fetchPlaces = async (): Promise<GooglePlace[]> => {
      const response = await fetch('/api/places');
      const data = await response.json();
      setPlaces(data.googlePlaces);
      setFilteredPlaces(data.googlePlaces);
      return data.googlePlaces;
    };

    const fetchUnvisitedPlaces = async (): Promise<GooglePlace[]> => {
      const response = await fetch('/api/unvisitedPlaces');
      const data = await response.json();
      setUnvisitedPlaces(data.googlePlaces);
      return data.googlePlaces;
    };

    const fetchUnvisitedPlacesToVisit = async (): Promise<UnvisitedPlace[]> => {
      const unvisitedPlacesToVisit: UnvisitedPlace[] = [];
      const response = await fetch('/api/unvisitedPlacesToVisit');
      const data = await response.json();
      const unvisitedPlacesToVisitFromDb: UnvisitedPlaceFromDb[] = data.unvisitedPlacesToVisit;
      for (const unvisitedPlaceToVisitFromDb of unvisitedPlacesToVisitFromDb) {
        const unvisitedPlaceToVisit: UnvisitedPlace = {
          _id: unvisitedPlaceToVisitFromDb._id,
          place: null,
          comments: unvisitedPlaceToVisitFromDb.comments,
          rating: unvisitedPlaceToVisitFromDb.rating,
        };
        const placeId = unvisitedPlaceToVisitFromDb.place_id;
        const googlePlace = places.find((place) => place.googlePlaceId === placeId);
        if (googlePlace) {
          unvisitedPlaceToVisit.place = googlePlace;
        }
        unvisitedPlacesToVisit.push(unvisitedPlaceToVisit);
      }
      setUnvisitedPlacesToVisit(unvisitedPlacesToVisit);
      return data.unvisitedPlacesToVisit;
    };

    const fetchReviews = async (): Promise<MemoRappReview[]> => {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      setReviews(data.memoRappReviews);
      return data.memoRappReviews;
    };

    const fetchData = async () => {
      const location = await fetchCurrentLocation();
      const places = await fetchPlaces();
      const reviews = await fetchReviews();
      filterOnEntry(places, reviews, location!, settings.filters);
    };

    const fetchUnvisitedPlacesFromBackend = async () => {
      const unvisitedPlaces = await fetchUnvisitedPlaces();
      setUnvisitedPlaces(unvisitedPlaces);
    }

    fetchData();
    fetchUnvisitedPlacesFromBackend();

  }, [_id]);

  // Update map location based on the provided placeId (_id)
  useEffect(() => {
    if (_id && places.length > 0) {
      const googlePlace = places.find((place) => place.googlePlaceId === _id);
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
      reviews: getReviewsForPlace(place.googlePlaceId),
    }));

  const getExtendedGooglePlaceToVisit = (place: GooglePlace): ExtendedGooglePlaceToVisit => {
    const googlePlaceId = place.googlePlaceId;
    const unvisitedPlace: UnvisitedPlace | undefined = unvisitedPlacesToVisit.find((unvisitedPlaceToVisit) => unvisitedPlaceToVisit.place!.googlePlaceId === googlePlaceId);
    return {
      ...place,
      comments: unvisitedPlace?.comments || '',
      rating: unvisitedPlace?.rating || 0,
    };
  }

  const getExtendedGooglePlacesToVisit = (): ExtendedGooglePlaceToVisit[] => {
    const extendedGooglePlacesToVisit: ExtendedGooglePlaceToVisit[] = [];
    for (const unvisitedPlace of unvisitedPlaces) {
      const extendedGooglePlaceToVisit: ExtendedGooglePlaceToVisit = getExtendedGooglePlaceToVisit(unvisitedPlace);
      extendedGooglePlacesToVisit.push(extendedGooglePlaceToVisit);
    }
    return extendedGooglePlacesToVisit;
  }


  const handleOpenFiltersDialog = () => {
    setShowFiltersDialog(true);
  };

  const executeSearchAndFilter = async (searchQuery: SearchQuery): Promise<void> => {

    console.log('executeSearchAndFilter:', searchQuery);

    const requestBody = { searchQuery };

    try {
      const apiResponse = await fetch('/api/reviews/searchAndFilter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data: any = await apiResponse.json();
      console.log('searchAndFilter results:', data);

      setFilteredPlaces(data.places);
    } catch (error) {
      console.error('Error executing filter query:', error);
    }
  }

  const filterOnEntry = (
    places: any, reviews: any, location: google.maps.LatLngLiteral, filters: Filters,
  ) => {

    const { distanceAwayFilter, isOpenNowFilterEnabled, wouldReturnFilter } = filters;

    const filter: FilterResultsParams = {
      distanceAwayFilter,
      openNowFilter: isOpenNowFilterEnabled,
      wouldReturnFilter,
    };

    const filterResultsValue: SearchResponse = filterResults(filter, places, reviews, location);

    setFilteredPlaces(filterResultsValue.places);
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
      wouldReturn: filters.wouldReturnFilter,
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
          key={JSON.stringify({ googlePlaces: filteredPlaces, specifiedLocation: mapLocation })} // Forces re-render on prop change
          initialCenter={mapLocation!}
          locations={getExtendedGooglePlaces(filteredPlaces)}
          locationsToVisit={getExtendedGooglePlacesToVisit()}
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

      {renderPulsingDots()}

      {/* Map Display */}
      <div style={{ flex: 1 }}>{renderMap()}</div>

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
