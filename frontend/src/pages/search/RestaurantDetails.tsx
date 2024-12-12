import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Paper,
  IconButton,
  Typography,
  Tooltip,
  Box,
  List,
  ListItem,
  ListItemText,
  Grid,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { GooglePlace, ItemReview, MemoRappReview, RestaurantDetailsProps } from '../../types';

const RestaurantDetails: React.FC = () => {
  const location = useLocation();
  const restaurantDetailsProps: RestaurantDetailsProps = location.state as RestaurantDetailsProps;

  const { place, reviews }: { place: GooglePlace; reviews: MemoRappReview[] } = restaurantDetailsProps;

  const navigate = useNavigate();

  const handleEditReview = (review: MemoRappReview) => {
    navigate(`/write-review/${review._id}`, { state: { place, review } });
  };

  const handleDeleteReview = (review: MemoRappReview) => {
    console.log('handleDeleteReview', review);
  };

  const renderOpeningHours = (): JSX.Element => {
    if (!place.opening_hours?.weekday_text) {
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
          {place.opening_hours.weekday_text.map((day, index) => (
            <ListItem key={index} sx={{ padding: 0 }}>
              <ListItemText primary={day} />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };

  const renderPriceLevel = (): JSX.Element => {
    if (!place.price_level) {
      return (
        <Typography variant="body2" color="textSecondary">
          Price level not available
        </Typography>
      );
    }

    const priceLabels = ['Free', 'Inexpensive', 'Moderate', 'Expensive', 'Very Expensive'];
    return (
      <Typography variant="body2" color="textSecondary">
        Price level: {priceLabels[place.price_level]}
      </Typography>
    );
  };

  const renderReview = (review: MemoRappReview): JSX.Element => (
    <Paper elevation={1} sx={{ padding: 2, marginBottom: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body1">
          <strong>Reviewer:</strong> {review.freeformReviewProperties.reviewer || 'Anonymous'}
        </Typography>
        <Box>
          <Tooltip title="Edit Review">
            <IconButton onClick={() => handleEditReview(review)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDeleteReview(review)} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Typography>
        <strong>Date of Visit:</strong> {review.structuredReviewProperties.dateOfVisit || 'Unknown'}
      </Typography>
      <Typography>
        <strong>Would Return:</strong>{' '}
        {review.structuredReviewProperties.wouldReturn === null
          ? 'Unspecified'
          : review.structuredReviewProperties.wouldReturn
            ? 'Yes'
            : 'No'}
      </Typography>
      <Typography>
        <strong>Items Ordered:</strong>
      </Typography>
      <List>
        {review.freeformReviewProperties.itemReviews.map((itemReview, idx) => (
          <ListItem key={idx} sx={{ padding: 0 }}>
            <ListItemText
              primary={`${itemReview.item} - ${itemReview.review || 'No rating provided'}`}
            />
          </ListItem>
        ))}
      </List>
      <Typography>
        <strong>Review Text:</strong> {review.freeformReviewProperties.reviewText}
      </Typography>
    </Paper>
  );

  return (
    <Grid container spacing={2} sx={{ padding: 2, height: '100vh', overflowY: 'auto' }}>
      {/* Overview Section */}
      <Grid item xs={12} md={4} sx={{ borderRight: { md: '1px solid #ddd' }, paddingRight: 2 }}>
        <Typography variant="h4">{place.name}</Typography>
        <Typography>{place.vicinity}</Typography>
        <Typography>
          <a href={place.website} target="_blank" rel="noreferrer">
            {place.website}
          </a>
        </Typography>
        {renderPriceLevel()}
        {renderOpeningHours()}
      </Grid>

      {/* Reviews Section */}
      <Grid item xs={12} md={8} sx={{ paddingLeft: { md: 2 } }}>
        <Typography variant="h5" gutterBottom>
          Reviews
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />
        <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
          {reviews.map((review) => renderReview(review))}
        </Box>
      </Grid>
    </Grid>
  );
};

export default RestaurantDetails;
