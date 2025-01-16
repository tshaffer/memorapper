import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Box } from '@mui/material';

import DirectionsIcon from '@mui/icons-material/Directions';
import MapIcon from '@mui/icons-material/Map';

import '../../App.css';

import { DesiredRestaurant } from '../../types';
import { getCityNameFromPlace } from '../../utilities';

const smallColumnStyle: React.CSSProperties = {
  width: '35px',
  maxWidth: '35px',
  textAlign: 'center',
  padding: '0',
};


const NewRestaurants = () => {

  const [newRestaurants, setNewRestaurants] = useState<DesiredRestaurant[]>([]);
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const [selectedPlace, setSelectedPlace] = useState<DesiredRestaurant | null>(null);
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

    const fetchNewRestaurants = async (): Promise<DesiredRestaurant[]> => {
      const response = await fetch('/api/desiredRestaurants');
      const data = await response.json();
      setNewRestaurants(data.desiredRestaurants);
      return data.desiredRestaurants;
    };

    fetchNewRestaurants();
    fetchCurrentLocation();

  }, []);

  const getSortedPlaces = (): DesiredRestaurant[] => {

    return newRestaurants;
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

  const handlePlaceClick = (newRestaurant: DesiredRestaurant) => {
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
    const destination: DesiredRestaurant | undefined = newRestaurants.find(place => place.googlePlace!.googlePlaceId === placeId);
    if (destination && currentLocation) {
      const destinationLocation: google.maps.LatLngLiteral = destination.googlePlace!.geometry!.location;
      const destinationLatLng: google.maps.LatLngLiteral = { lat: destinationLocation.lat, lng: destinationLocation.lng };
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destinationLatLng.lat},${destinationLatLng.lng}&destination_place_id=${destination.googlePlace!.name}`;
      window.open(url, '_blank');
    }
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
                <TableCell>Restaurant</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPlaces.map((place: DesiredRestaurant) => (
                <React.Fragment key={place.googlePlace?.googlePlaceId}>
                  <TableRow
                    className="table-row-hover"
                    onClick={() => handlePlaceClick(place)}
                    sx={{
                      backgroundColor:
                      place.googlePlace?.googlePlaceId === selectedPlaceId ? '#f0f8ff' : 'inherit', // Highlight selected row
                      cursor: 'pointer', // Indicate clickable rows
                    }}
                  >
                    <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                      <IconButton onClick={(event) => {
                        event.stopPropagation();
                        handleShowMap(place.googlePlace!.googlePlaceId)
                      }}
                      >
                        <MapIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                      <IconButton onClick={(event) => {
                        event.stopPropagation();
                        handleShowDirections(place.googlePlace!.googlePlaceId)
                      }}>
                        <DirectionsIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>{place.googlePlace!.name}</TableCell>
                    <TableCell>{getCityNameFromPlace(place.googlePlace!) || 'Not provided'}</TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };


  return (
    <React.Fragment>
      {renderPlacesTable()}
    </React.Fragment>
  )
}

export default NewRestaurants;