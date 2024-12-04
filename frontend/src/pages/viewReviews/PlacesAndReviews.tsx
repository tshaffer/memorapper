import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Button, Tooltip, Box } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DirectionsIcon from '@mui/icons-material/Directions';
import MapIcon from '@mui/icons-material/Map';

import '../../App.css';

import { GooglePlace, ItemReview, MemoRappReview } from '../../types';
import { getCityNameFromPlace } from '../../utilities';

const smallColumnStyle: React.CSSProperties = {
  width: '35px',
  maxWidth: '35px',
  textAlign: 'center',
  padding: '0',
};

interface PlacesAndReviewsProps {
  currentLocation: google.maps.LatLngLiteral | null;
  places: GooglePlace[];
  filteredPlaces: GooglePlace[];
  filteredReviews: MemoRappReview[];
}

const PlacesAndReviews: React.FC<PlacesAndReviewsProps> = (props: PlacesAndReviewsProps) => {

  const { currentLocation, places, filteredPlaces, filteredReviews } = props;

  const isMobile = useMediaQuery('(max-width:768px)');
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [selectedPlace, setSelectedPlace] = useState<GooglePlace | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const [sortCriteria, setSortCriteria] = useState<'name' | 'distance' | 'reviewer' | 'recentReview'>('name');

  const getPlaceById = (placeId: string): GooglePlace | undefined => {
    return places.find((place: GooglePlace) => place.place_id === placeId);
  }

  const getFilteredReviewsForPlace = (placeId: string): MemoRappReview[] => {
    return filteredReviews.filter((memoRappReview: MemoRappReview) => memoRappReview.place_id === placeId);
  };

  const getSortedPlaces = (): GooglePlace[] => {
    const sortedPlaces = [...filteredPlaces]; // Clone the array to avoid mutating state

    switch (sortCriteria) {
      case 'name':
        return sortedPlaces.sort((a, b) => a.name.localeCompare(b.name));
      case 'distance':
        if (!currentLocation) return sortedPlaces;
        return sortedPlaces.sort((a, b) => {
          const distanceA = Math.hypot(
            (a.geometry?.location.lat || 0) - currentLocation.lat,
            (a.geometry?.location.lng || 0) - currentLocation.lng
          );
          const distanceB = Math.hypot(
            (b.geometry?.location.lat || 0) - currentLocation.lat,
            (b.geometry?.location.lng || 0) - currentLocation.lng
          );
          return distanceA - distanceB;
        });
      case 'reviewer':
        return sortedPlaces.sort((a, b) => {
          const reviewerA = filteredReviews.find((r) => r.place_id === a.place_id)?.freeformReviewProperties.reviewer || '';
          const reviewerB = filteredReviews.find((r) => r.place_id === b.place_id)?.freeformReviewProperties.reviewer || '';
          return reviewerA.localeCompare(reviewerB);
        });
      case 'recentReview':
        return sortedPlaces.sort((a, b) => {
          const recentDateA = filteredReviews
            .filter((r) => r.place_id === a.place_id)
            .reduce((latest, r) => Math.max(latest, new Date(r.structuredReviewProperties.dateOfVisit).getTime()), 0);
          const recentDateB = filteredReviews
            .filter((r) => r.place_id === b.place_id)
            .reduce((latest, r) => Math.max(latest, new Date(r.structuredReviewProperties.dateOfVisit).getTime()), 0);
          return recentDateB - recentDateA;
        });
      default:
        return sortedPlaces;
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPlace(null);
  };

  const handlePlaceClick = (place: GooglePlace) => {
    setSelectedPlaceId(place.place_id); // Update selected place ID
    setSelectedPlace(place);
    setViewMode('details');
  };

  const handleShowMap = (placeId: string) => {
    navigate(`/map/${placeId}`);
  };

  const handleShowDirections = (placeId: string) => {
    const destination: GooglePlace | undefined = places.find(place => place.place_id === placeId);
    if (destination && currentLocation) {
      const destinationLocation: google.maps.LatLngLiteral = destination.geometry!.location;
      const destinationLatLng: google.maps.LatLngLiteral = { lat: destinationLocation.lat, lng: destinationLocation.lng };
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destinationLatLng.lat},${destinationLatLng.lng}&destination_place_id=${destination.name}`;
      window.open(url, '_blank');
    }
  };

  const handleEditReview = (review: MemoRappReview) => {
    const place: GooglePlace | undefined = getPlaceById(review.place_id);
    if (!place) {
      console.error('Place not found for review:', review);
      return;
    }
    navigate(`/add-review/${review._id}`, { state: { place, review } });
  }

  const handleDeleteReview = (review: MemoRappReview) => {
    console.log('handleDeleteReview', review);
  };

  const renderPlacesAndReviewsContainer = (): JSX.Element => {
    return (
      <Box
        id='placesAndReviewsContainer'
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: { xs: viewMode === 'details' ? 'column' : 'row', sm: 'row' },
          overflow: 'hidden',
        }}
      >
        {/* Places Table */}
        {renderPlacesTable()}

        {/* Reviews Panel */}
        {renderReviewsContainer()};
      </Box>
    );
  };

  const renderPlacesTable = (): JSX.Element | null => {
    if (!(viewMode === 'list' || !isMobile)) {
      return null; // Explicitly return null when the condition is false
    }

    const sortedPlaces = getSortedPlaces(); // Get the sorted places

    return (
      <Box
        id='placesTableContainer'
        sx={{
          flexShrink: 0,
          width: { xs: '100%', sm: '30%' },
          minWidth: { sm: '300px' },
          maxWidth: { sm: '50%' },
          overflowY: 'auto',
          borderRight: { sm: '1px solid #ccc' },
          borderBottom: { xs: '1px solid #ccc', sm: 'none' },
          height: { xs: '75vh', sm: '80vh' },
        }}
      >
        {/* Sort Dropdown */}
        {renderSortDropdown()}

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
                <TableCell>Place</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPlaces.map((place: GooglePlace) => (
                <React.Fragment key={place.place_id}>
                  <TableRow
                    className="table-row-hover"
                    onClick={() => handlePlaceClick(place)}
                    sx={{
                      backgroundColor:
                        place.place_id === selectedPlaceId ? '#f0f8ff' : 'inherit', // Highlight selected row
                      cursor: 'pointer', // Indicate clickable rows
                    }}
                  >
                    <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                      <IconButton onClick={() => handleShowMap(place.place_id)}>
                        <MapIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                      <IconButton onClick={() => handleShowDirections(place.place_id)}>
                        <DirectionsIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>{place.name}</TableCell>
                    <TableCell>{getCityNameFromPlace(place) || 'Not provided'}</TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderSortDropdown = (): JSX.Element => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
        <Typography variant="subtitle1" sx={{ marginRight: 2 }}>
          Sort by:
        </Typography>
        <select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value as 'name' | 'distance' | 'reviewer' | 'recentReview')}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        >
          <option value="name">Place Name</option>
          <option value="distance">Distance</option>
          <option value="reviewer">Reviewer</option>
          <option value="recentReview">Most Recent Review</option>
        </select>
      </Box>

    )
  };

  const renderReviewsContainer = (): JSX.Element => {
    return (
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: 2,
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        {viewMode === 'details' && isMobile && (
          <Button variant="outlined" onClick={handleBackToList} sx={{ marginBottom: 2 }}>
            Back to List
          </Button>
        )}

        {selectedPlace ? (
          <>
            {renderReviewDetailsForSelectedPlace()}
          </>
        ) : (
          <Typography>Select a place to view reviews</Typography>
        )}
      </Box>
    );
  }

  const renderReviewDetailsForSelectedPlace = (): JSX.Element | null => {
    if (selectedPlace === null) {
      return null;
    }
    const reviewsForSelectedPlace: MemoRappReview[] = getFilteredReviewsForPlace(selectedPlace.place_id);
    const reviewDetails = reviewsForSelectedPlace.map((review: MemoRappReview) => {
      return renderReviewDetails(review);
    });

    return (
      <Paper
        // key={idx}
        sx={{
          marginBottom: 2,
          padding: 2,
        }}
      >
        {reviewDetails}
      </Paper>
    );
  };

  const renderReviewDetails = (review: MemoRappReview): JSX.Element => {
    return (
      <React.Fragment>
        <div>
          <Tooltip title="Edit Review">
            <IconButton
              onClick={() => handleEditReview(review)}
              size="small" // Makes the button smaller
              sx={{ padding: '0px' }} // Reduces padding for smaller appearance
            >
              <EditIcon fontSize="small" /> {/* Makes the icon smaller */}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <IconButton
              onClick={() => handleDeleteReview(review)}
              size="small" // Makes the button smaller
              sx={{ padding: '0px' }} // Reduces padding for smaller appearance
            >
              <DeleteIcon fontSize="small" /> {/* Makes the icon smaller */}
            </IconButton>
          </Tooltip>
        </div>
        <Typography><strong>Date of Visit:</strong> {review.structuredReviewProperties.dateOfVisit}</Typography>
        <Typography><strong>Would Return:</strong> {review.structuredReviewProperties.wouldReturn === null ? 'Unspecified' : review.structuredReviewProperties.wouldReturn ? 'Yes' : 'No'}</Typography>
        <Typography><strong>Items Ordered:</strong></Typography>
        <ul>
          {review.freeformReviewProperties.itemReviews.map((itemReview: ItemReview, idx) => (
            <li key={idx}>
              {itemReview.item} - {itemReview.review || 'No rating provided'}
            </li>
          ))}
        </ul>
        <Typography><strong>Review Text:</strong> {review.freeformReviewProperties.reviewText}</Typography>
      </React.Fragment>
    );
  }

  const placesAndReviewsContainer: JSX.Element = renderPlacesAndReviewsContainer();
  return (
    <div>
      {placesAndReviewsContainer}
    </div>
  );
}

export default PlacesAndReviews;
