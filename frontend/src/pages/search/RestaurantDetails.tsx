import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, IconButton, Typography, Tooltip, Box, List, ListItem, ListItemText } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import '../../App.css';

import { GooglePlace, ItemReview, MemoRappReview, RestaurantDetailsProps } from '../../types';

const RestaurantDetails: React.FC = () => {

  const location = useLocation();
  const restaurantDetailsProps: RestaurantDetailsProps = location.state as RestaurantDetailsProps;

  // const { place, reviews }: RestaurantDetailsProps = restaurantDetailsProps;
  const { place, reviews }: { place: GooglePlace; reviews: MemoRappReview[] } = restaurantDetailsProps;

  const navigate = useNavigate();

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
        <Typography variant="h5">Reviews</Typography>
        {renderReviewDetailsForSelectedPlace()}
      </Box>
    );
  }

  const renderReviewDetailsForSelectedPlace = (): JSX.Element | null => {

    const reviewDetails = reviews.map((review: MemoRappReview) => {
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

  const renderOpeningHours = (openingHours: google.maps.places.PlaceOpeningHours | undefined | null): JSX.Element => {

    if (!openingHours || !openingHours.weekday_text) {
      return (
        <Typography variant="body2" color="textSecondary">
          Opening hours not available
        </Typography>
      );
    }

    return (
      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
        <Typography variant="h6" gutterBottom>
          Opening Hours
        </Typography>
        <List>
          {openingHours.weekday_text.map((day, index) => (
            <ListItem key={index} sx={{ padding: 0 }}>
              <ListItemText primary={day} />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };

  const getPriceLevelLabel = (priceLevel: number): string => {
    switch (priceLevel) {
      case 0:
        return 'Free';
      case 1:
        return 'Inexpensive';
      case 2:
        return 'Moderate';
      case 3:
        return 'Expensive';
      case 4:
        return 'Very Expensive';
      default:
        return 'Price level not available';
    }
  }

  const renderPriceLevel = (priceLevel: number | undefined): JSX.Element => {
    if (!priceLevel) {
      return (
        <Typography variant="body2" color="textSecondary">
          Price level not available
        </Typography>
      );
    }

    return (
      <Typography variant="body2" color="textSecondary">
        Price level: {getPriceLevelLabel(priceLevel)}
      </Typography>
    );
  }

  const renderRestaurantOverview = (): JSX.Element => {
    return (
      <Box>
        <Typography variant="h4">{place.name}</Typography>
        <Typography>{place.vicinity}</Typography>
        <Typography>{renderPriceLevel(place.price_level)}</Typography>
        <Typography>
          <a href={place.website} target="_blank" rel="noreferrer">
            {place.website}
          </a>
        </Typography>
        {renderOpeningHours(place.opening_hours)}
      </Box>
    );
  }

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
      {renderRestaurantOverview()}
      {renderReviewsContainer()}
    </React.Fragment>
  );
}

export default RestaurantDetails;