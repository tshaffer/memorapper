import { v4 as uuidv4 } from 'uuid';
import React from 'react';
import { useLocation } from 'react-router-dom';
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
  Rating,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { GooglePlace, RestaurantDetailsProps, DinerRestaurantReview, Diner, VisitReview } from '../../types';
import { useUserContext } from '../../contexts/UserContext';

const RestaurantDetails: React.FC = () => {

  const { currentDiningGroup } = useUserContext();

  const location = useLocation();

  const restaurantDetailsProps: RestaurantDetailsProps = location.state as RestaurantDetailsProps;
  console.log('restaurantDetailsProps', restaurantDetailsProps);

  const { reviewedRestaurant, dinerRestaurantReviews, visitReviews, diners } = restaurantDetailsProps;
  const place: GooglePlace = reviewedRestaurant.googlePlace;
  const diningGroupId: string = currentDiningGroup!.diningGroupId;

  function getDinerRestaurantReviews(): DinerRestaurantReview[] {

    // Step 1: Check if the reviewedRestaurant belongs to the specified diningGroupId
    if (reviewedRestaurant.diningGroupId !== diningGroupId) {
      return []; // If not, return an empty array
    }

    // Step 2: Get the dinerIds associated with the diningGroupId
    const dinerIds: string[] = diners
      .filter((diner) => diner.diningGroupId === diningGroupId)
      .map((diner) => diner.dinerId);

    // Step 3: Filter the dinerRestaurantReviews that match the dinerIds and reviewedRestaurant
    const filteredReviews: DinerRestaurantReview[] = dinerRestaurantReviews.filter(
      (review) =>
        dinerIds.includes(review.dinerId) &&
        reviewedRestaurant.dinerRestaurantReviews.some(
          (ref) => ref.dinerRestaurantReviewId === review.dinerRestaurantReviewId
        )
    );

    return filteredReviews;
  }

  function getVisitReviews(
  ): VisitReview[] {

    // Step 1: Ensure the reviewedRestaurant belongs to the specified diningGroupId
    if (reviewedRestaurant.diningGroupId !== diningGroupId) {
      return []; // Return an empty array if not associated
    }

    // Step 2: Retrieve visitReviews matching the given diningGroupId and reviewedRestaurant's googlePlace
    const filteredVisitReviews = visitReviews.filter(
      (visit) =>
        visit.diningGroupId === diningGroupId &&
        visit.googlePlaceId === reviewedRestaurant.googlePlace.googlePlaceId // Assuming `placeId` is the unique identifier in GooglePlace
    );

    return filteredVisitReviews;
  }

  const getDiner = (dinerId: string): Diner | null => {
    for (const diner of diners) {
      if (diner.dinerId === dinerId) {
        return diner;
      }
    }
    return null;
  }

  const handleEditReview = (review: VisitReview) => {
    console.log('handleEditReview', review);
    // navigate(`/write-review/${review._id}`, { state: { place, review } });
  };

  const handleDeleteReview = (review: VisitReview) => {
    console.log('handleDeleteReview', review);
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
  }

  const renderOpeningHours = (): JSX.Element => {
    if (!place.opening_hours || !place.opening_hours.weekday_text) {
      return (
        <Typography component={'span'} variant={'body2'} color="textSecondary">
          Opening hours not available
        </Typography>
      );
    }

    return (
      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
        <Typography component={'span'} variant={'body2'}>
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

  const renderRatingsAndComments = (): JSX.Element => {
    const dinerRestaurantReviews: DinerRestaurantReview[] = getDinerRestaurantReviews()
    return (
      <div className="ratings-and-comments-preview">
        <fieldset className="ratings-comments-section compact">
          <legend>Ratings and Comments</legend>
          {dinerRestaurantReviews.map((dinerRestaurantReview: DinerRestaurantReview) => {
            const diner: Diner = getDiner(dinerRestaurantReview.dinerId)!;
            return (
              <div key={dinerRestaurantReview.dinerId} className="contributor-section compact">
                <div className="contributor-header compact">
                  <h5>{diner.dinerName}</h5>
                </div>
                <div className="contributor-rating compact">
                  <label htmlFor={`rating-${diner.dinerId}`}>Rating</label>
                  <Rating
                    id={`rating-${diner.dinerId}`}
                    name={`rating-${diner.dinerId}`}
                    value={dinerRestaurantReview.rating}
                    max={5}
                  />
                </div>
                <div className="contributor-comments compact">
                  <span className="comments-label">Comments:</span> {dinerRestaurantReview.comments || 'No comments provided'}
                </div>
              </div>
            );
          })}
        </fieldset>
      </div>
    );
  };

  const renderReview = (visitReview: VisitReview): JSX.Element => (
    <Paper elevation={1} sx={{ padding: 2, marginBottom: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Typography variant="body1" sx={{ flex: 1, wordBreak: 'break-word' }}>
          <strong>Reviewer:</strong> {currentDiningGroup!.diningGroupName}
        </Typography>
        <Box sx={{ display: 'flex', gap: '0px' }}>
          <Tooltip title="Edit Review">
            <IconButton onClick={() => handleEditReview(visitReview)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDeleteReview(visitReview)} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Typography>
        <strong>Date of Visit:</strong> {visitReview.dateOfVisit || 'Unknown'}
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
        {visitReview.itemReviews.map((itemReview, idx) => (
          <ListItem key={idx}>
            <ListItemText
              primary={
                <React.Fragment>
                  <strong>{itemReview.item}</strong>
                  {' - '}
                  <span style={{ fontWeight: 400 }}>
                    {itemReview.item}
                    {itemReview.review ? ` - ${itemReview.review}` : ''}
                  </span>
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
        <strong>Review Text:</strong> {visitReview.reviewText}
      </Typography>
    </Paper>
  );

  const renderReviews = (): JSX.Element => {
    const visitReviews: VisitReview[] = getVisitReviews();

    if (visitReviews.length === 0) {
      return (
        <Typography variant="h5" gutterBottom>
          No reviews available
        </Typography>
      );
    }

    return (
      <Grid item xs={12} md={8} sx={{ paddingLeft: { md: 2 } }}>
        <Typography variant="h5" gutterBottom>
          Reviews
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />
        <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
          {visitReviews.map((visitReview) => (
            <React.Fragment key={uuidv4()}> {/* Add key here */}
              {renderReview(visitReview)}
            </React.Fragment>
          ))}
        </Box>
      </Grid>
    );
  }

  return (
    <Grid container spacing={2} sx={{ padding: 2, height: '100vh', overflowY: 'auto' }}>
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
        {renderRatingsAndComments()}
        {renderReviews()}
      </Grid>
    </Grid>
  );
};

export default RestaurantDetails;
