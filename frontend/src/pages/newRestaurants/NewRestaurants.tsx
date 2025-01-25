import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Box, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';

import DirectionsIcon from '@mui/icons-material/Directions';
import MapIcon from '@mui/icons-material/Map';
import DeleteIcon from '@mui/icons-material/Delete';

import LocationAutocomplete from '../../components/LocationAutocomplete';
import FiltersDialog from '../../components/FiltersDialog';
import PulsingDots from '../../components/PulsingDots';

import '../../App.css';

import { NewRestaurant, Filters, GooglePlace, SearchQuery } from '../../types';
import { getCityNameFromPlace } from '../../utilities';
import { useUserContext } from '../../contexts/UserContext';

const smallColumnStyle: React.CSSProperties = {
  width: '35px',
  maxWidth: '35px',
  textAlign: 'center',
  padding: '0',
};


const NewRestaurants = () => {

  const { newRestaurants, setFilters, settings } = useUserContext();

  const isMobile = useMediaQuery('(max-width:768px)');

  const [showFiltersDialog, setShowFiltersDialog] = React.useState(false);

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState<GooglePlace[]>([]);

  const [selectedPlace, setSelectedPlace] = useState<NewRestaurant | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const navigate = useNavigate();

  React.useEffect(() => {

    const fetchCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentLocation(location);
          },
          (error) => console.error('Error getting current location: ', error),
          { enableHighAccuracy: true }
        );
      }
    };

    fetchCurrentLocation();

  }, []);

  const getSortedPlaces = (): NewRestaurant[] => {

    const sortedPlaces = [...newRestaurants]; // Clone the array to avoid mutating state

    return sortedPlaces.sort((a, b) => a.googlePlace!.name.localeCompare(b.googlePlace!.name));
    // const sortedPlaces = [...filteredPlaces]; // Clone the array to avoid mutating state

    // switch (sortCriteria) {
    //   case SortCriteria.Name:
    //     return sortedPlaces.sort((a, b) => a.name.localeCompare(b.name));
    //   case SortCriteria.Distance:
    //     if (!currentLocation) return sortedPlaces;
    //     return sortedPlaces.sort((a, b) => {
    //       const distanceA = Math.hypot(
    //         (a.geometry?.location.lat || 0) - currentLocation.lat,
    //         (a.geometry?.location.lng || 0) - currentLocation.lng
    //       );
    //       const distanceB = Math.hypot(
    //         (b.geometry?.location.lat || 0) - currentLocation.lat,
    //         (b.geometry?.location.lng || 0) - currentLocation.lng
    //       );
    //       return distanceA - distanceB;
    //     });
    //   case SortCriteria.Reviewer:
    //     return sortedPlaces.sort((a, b) => {
    //       const reviewerAId = filteredReviews.find((r) => r.place_id === a.googlePlaceId)?.structuredReviewProperties.reviewerId || '';
    //       const reviewerBId = filteredReviews.find((r) => r.place_id === b.googlePlaceId)?.structuredReviewProperties.reviewerId || '';

    //       const reviewerAName = reviewerFromReviewerId(reviewerAId);
    //       const reviewerBName = reviewerFromReviewerId(reviewerBId);

    //       return reviewerAName.localeCompare(reviewerBName);
    //     });
    //   case SortCriteria.MostRecentReview:
    //     return sortedPlaces.sort((a, b) => {
    //       const recentDateA = filteredReviews
    //         .filter((r) => r.place_id === a.googlePlaceId)
    //         .reduce((latest, r) => Math.max(latest, new Date(r.structuredReviewProperties.dateOfVisit).getTime()), 0);
    //       const recentDateB = filteredReviews
    //         .filter((r) => r.place_id === b.googlePlaceId)
    //         .reduce((latest, r) => Math.max(latest, new Date(r.structuredReviewProperties.dateOfVisit).getTime()), 0);
    //       return recentDateB - recentDateA;
    //     });
    //   default:
    //     return sortedPlaces;
    // }
  };

  const executeSearchAndFilter = async (searchQuery: SearchQuery): Promise<void> => {

    console.log('executeSearchAndFilter:', searchQuery);

    const requestBody = { searchQuery };

    try {
      const apiResponse = await fetch('/api/searchAndFilter', {
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

  const handlePlaceClick = (newRestaurant: NewRestaurant) => {
    console.log('handlePlaceClick place: ', newRestaurant);
    setSelectedPlaceId(newRestaurant.googlePlace!.googlePlaceId); // Update selected place ID
    setSelectedPlace(newRestaurant);
    // const reviews: MemoRappReview[] = getReviewsForPlace(newRestaurant.googlePlaceId);
    // navigate(`/restaurantDetails`, { state: { place: newRestaurant, reviews } });
  };

  const handleShowMap = (placeId: string) => {
    console.log('handleShowMap placeId: ', placeId);
    navigate(`/map/${placeId}`);
  };

  const handleShowDirections = (placeId: string) => {
    const destination: NewRestaurant | undefined = newRestaurants.find(place => place.googlePlace!.googlePlaceId === placeId);
    if (destination && currentLocation) {
      const destinationLocation: google.maps.LatLngLiteral = destination.googlePlace!.geometry!.location;
      const destinationLatLng: google.maps.LatLngLiteral = { lat: destinationLocation.lat, lng: destinationLocation.lng };
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destinationLatLng.lat},${destinationLatLng.lng}&destination_place_id=${destination.googlePlace!.name}`;
      window.open(url, '_blank');
    }
  };

  const handleEditNewRestaurant = (newRestaurant: NewRestaurant) => {
    console.log('handleEditNewRestaurant', newRestaurant);
    navigate(`/add-place/${newRestaurant._id}`, { state: newRestaurant });
  };

  const handleDeleteNewRestaurant = async (newRestaurant: NewRestaurant) => {
    console.log('handleDeleteNewRestaurant', newRestaurant);
    const deleteRestaurantBody = {
      newRestaurantId: newRestaurant.newRestaurantId,
    };
    const response = await fetch('/api/deleteRestaurant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deleteRestaurantBody),
    });
  }

  const handleSetMapLocation = (location: google.maps.LatLngLiteral): void => {
    setMapLocation(location);
  }

  const handleOpenFiltersDialog = () => {
    setShowFiltersDialog(true);
  };

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


  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) {
      return null;
    }
    return (<PulsingDots />);
  };

  const renderPlacesTable = (): JSX.Element | null => {

    const sortedPlaces = getSortedPlaces(); // Get the sorted places

    return (
      <Box
        id='newRestaurantsTableContainer'
        sx={{
          flexShrink: 0,
          width: { xs: '100%', sm: '100%' },
          overflowY: 'auto',
          borderRight: { sm: '1px solid #ccc' },
          borderBottom: { xs: '1px solid #ccc', sm: 'none' },
          height: { xs: '75vh', sm: '80vh' },
        }}
      >
        {/* Places Table */}
        <TableContainer
          id='tableContainer'
          component={Paper}
          className="scrollable-table-container"
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow className="table-head-fixed">
                <TableCell align="center"></TableCell>
                <TableCell align="center"></TableCell>
                <TableCell align="center"></TableCell>
                <TableCell align="center"></TableCell>
                <TableCell>Restaurant</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPlaces.map((newRestaurant: NewRestaurant) => (
                <React.Fragment key={newRestaurant.googlePlace?.googlePlaceId}>
                  <TableRow
                    className="table-row-hover"
                    onClick={() => handlePlaceClick(newRestaurant)}
                    sx={{
                      backgroundColor:
                        newRestaurant.googlePlace?.googlePlaceId === selectedPlaceId ? '#f0f8ff' : 'inherit', // Highlight selected row
                      cursor: 'pointer', // Indicate clickable rows
                    }}
                  >
                    <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                      <IconButton onClick={(event) => {
                        event.stopPropagation();
                        handleShowMap(newRestaurant.googlePlace!.googlePlaceId)
                      }}
                      >
                        <MapIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                      <IconButton onClick={(event) => {
                        event.stopPropagation();
                        handleShowDirections(newRestaurant.googlePlace!.googlePlaceId)
                      }}>
                        <DirectionsIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                      <IconButton onClick={(event) => {
                        event.stopPropagation();
                        handleEditNewRestaurant(newRestaurant)
                      }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                      <IconButton onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteNewRestaurant(newRestaurant)
                      }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell>{newRestaurant.googlePlace!.name}</TableCell>
                    <TableCell>{getCityNameFromPlace(newRestaurant.googlePlace!) || 'Not provided'}</TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box >
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
      {renderPlacesTable()}
      {/* Filters Dialog */}
      <FiltersDialog
        open={showFiltersDialog}
        filters={settings.filters}
        onSetFilters={handleSetFilters}
        onClose={handleCloseFiltersDialog}
      />
    </Paper>
  )
}

export default NewRestaurants;