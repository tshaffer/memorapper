import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, IconButton, Typography, Tooltip, Box } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import '../../App.css';

import { ItemReview, MemoRappReview, RestaurantDetailsProps } from '../../types';

const RestaurantDetails: React.FC = () => {

  const location = useLocation();
  const restaurantDetailsProps: RestaurantDetailsProps = location.state as RestaurantDetailsProps;

  const { place, filteredReviews } = restaurantDetailsProps;

  const navigate = useNavigate();

  const getFilteredReviewsForPlace = (placeId: string): MemoRappReview[] => {
    return filteredReviews.filter((memoRappReview: MemoRappReview) => memoRappReview.place_id === placeId);
  };

  const handleEditReview = (review: MemoRappReview) => {
    navigate(`/write-review/${review._id}`, { state: { place, review } });
  }

  const handleDeleteReview = (review: MemoRappReview) => {
    console.log('handleDeleteReview', review);
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
        {renderReviewDetailsForSelectedPlace()}
      </Box>
    );
  }

  const renderReviewDetailsForSelectedPlace = (): JSX.Element | null => {
    const reviewsForSelectedPlace: MemoRappReview[] = getFilteredReviewsForPlace(place.place_id);
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

  return (
    <React.Fragment>
      {renderReviewsContainer()}
    </React.Fragment>
  );
}

export default RestaurantDetails;