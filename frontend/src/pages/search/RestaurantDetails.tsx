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
    if (!place.opening_hours || !place.opening_hours.weekday_text) {
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
        <List
          sx={{
            padding: 0,
            '& .MuiListItem-root': {
              padding: 0,
              marginBottom: { xs: '0px', sm: '8px' }, // Reduce spacing between lines on mobile
              marginTop: { xs: '0px', sm: '8px' }, // Reduce spacing between lines on mobile
            },
          }}
        >
          {place.opening_hours.weekday_text.map((day, index) => (
            <ListItem
              key={index}
            >
              <ListItemText
                primary={day}
                sx={{
                  padding: 0,
                  marginBottom: { xs: '0px', sm: '8px' }, // Reduce spacing between lines on mobile
                  marginTop: { xs: '0px', sm: '8px' }, // Reduce spacing between lines on mobile
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper >
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

  const reviewerFromReviewerId = (reviewerId: string): string => {
    switch (reviewerId) {
      case '1':
        return 'Ted';
    }
    return 'Guest';
  }

  const renderReview = (review: MemoRappReview): JSX.Element => (
    <Paper elevation={1} sx={{ padding: 2, marginBottom: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Typography variant="body1" sx={{ flex: 1, wordBreak: 'break-word' }}>
          <strong>Reviewer:</strong> {reviewerFromReviewerId(review.structuredReviewProperties.reviewerId)}
        </Typography>
        <Box sx={{ display: 'flex', gap: '0px' }}>
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
      <Typography
        sx={{
          marginBottom: 1, // Default spacing
          fontSize: { xs: '1rem', sm: '1rem' }, // Slightly smaller font size on mobile
        }}
      >
        <strong>Items Ordered:</strong>
      </Typography>
      <List
        sx={{
          padding: 0,
          marginBottom: 2,
          '& .MuiListItem-root': {
            padding: 0,
            marginBottom: { xs: '0px', sm: '8px' }, // Reduce spacing between items on mobile
            marginTop: { xs: '0px', sm: '8px' }, // Reduce spacing between items on mobile
          },
        }}
      >
        {review.freeformReviewProperties.itemReviews.map((itemReview, idx) => (
          <ListItem key={idx}>
            <ListItemText
              primary={
                <React.Fragment>
                  <strong>{itemReview.item}</strong>
                  {' - '}
                  <span style={{ fontWeight: 400 }}>{itemReview.review || 'No rating provided'}</span>
                </React.Fragment>
              } sx={{
                padding: 0,
                marginBottom: { xs: '0px', sm: '8px' }, // Reduce spacing between lines on mobile
                marginTop: { xs: '0px', sm: '8px' }, // Reduce spacing between lines on mobile
              }}
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
          {reviews.map((review) => (
            <React.Fragment key={review._id}> {/* Add key here */}
              {renderReview(review)}
            </React.Fragment>
          ))}
        </Box>
      </Grid>
    </Grid>
  );
};

export default RestaurantDetails;
