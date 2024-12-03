import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Button, Tooltip, Box } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DirectionsIcon from '@mui/icons-material/Directions';
import MapIcon from '@mui/icons-material/Map';

import '../App.css';

import { GooglePlace, ItemReview, MemoRappReview } from '../types';
import { getCityNameFromPlace } from '../utilities';

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

  const getPlaceById = (placeId: string): GooglePlace | undefined => {
    return places.find((place: GooglePlace) => place.place_id === placeId);
  }

  const getFilteredReviewsForPlace = (placeId: string): MemoRappReview[] => {
    return filteredReviews.filter((memoRappReview: MemoRappReview) => memoRappReview.place_id === placeId);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPlace(null);
  };

  const handlePlaceClick = (place: GooglePlace) => {
    setSelectedPlace(place);
    setViewMode('details');
  }

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
  }


  const renderPlacesAndReviewsContainer = (): JSX.Element => {
    return (
      <Box
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
  }

  const renderPlacesTable = (): JSX.Element | null => {

    if (!(viewMode === 'list' || !isMobile)) {
      return null; // Explicitly return null when the condition is false
    }

    return (
      <TableContainer
        component={Paper}
        className="scrollable-table-container"
        sx={{
          flexShrink: 0,
          width: { xs: '100%', sm: '30%' },
          minWidth: { sm: '300px' },
          maxWidth: { sm: '50%' },
          overflowY: 'auto',
          borderRight: { sm: '1px solid #ccc' },
          borderBottom: { xs: '1px solid #ccc', sm: 'none' },
          height: { xs: '50vh', sm: 'auto' },
        }}
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
            {filteredPlaces.map((place: GooglePlace) => (
              <React.Fragment key={place.place_id}>
                <TableRow
                  className="table-row-hover"
                  onClick={() => handlePlaceClick(place)}
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
    );
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
