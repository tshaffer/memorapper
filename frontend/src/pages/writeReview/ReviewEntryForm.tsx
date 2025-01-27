import { v4 as uuidv4 } from 'uuid';

import { Button, FormControl, FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup, Select, TextField, useMediaQuery } from '@mui/material';
import Rating from '@mui/material/Rating';

import RestaurantName from '../../components/RestaurantName';
import '../../styles/multiPanelStyles.css';
import '../../styles/reviewEntryForm.css';
import { useEffect, useState } from 'react';
import {
  Diner,
  DinerRestaurantReview,
  RestaurantType,
  ReviewData,
} from '../../types';
import PulsingDots from '../../components/PulsingDots';
import React from 'react';
import { useUserContext } from '../../contexts/UserContext';

interface ReviewEntryFormProps {
  reviewData: ReviewData;
  setReviewData: React.Dispatch<React.SetStateAction<ReviewData>>;
  onSubmitPreview: (formData: Omit<ReviewData, 'chatHistory'>) => void;
  onReceivedPreviewResponse: () => any;
}

const NewReviewEntryForm: React.FC<ReviewEntryFormProps> = (props: ReviewEntryFormProps) => {

  const { diners, newRestaurants } = useUserContext();

  const { reviewData, setReviewData, onSubmitPreview } = props;

  const isMobile = useMediaQuery('(max-width:768px)');

  const [isLoading, setIsLoading] = useState(false);
  const [isUsingExistingRestaurant, setIsUsingExistingRestaurant] = useState(false);

  const getDinerRestaurantReview = (dinerId: string): DinerRestaurantReview | null => {
    if (!reviewData || !reviewData.dinerRestaurantReviews) return null;

    for (const dinerRestaurantReview of reviewData.dinerRestaurantReviews) {
      if (dinerRestaurantReview.dinerId === dinerId) {
        return dinerRestaurantReview;
      }
    }
    return null;
  }

  const handleChange = (field: keyof ReviewData, value: any) => {
    setReviewData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRestaurantTypeChange = (value: RestaurantType) => {
    setReviewData((prev) => ({ ...prev, place: { ...prev.place!, restaurantType: value } }));
  }

  const generateSessionId = (): string => Math.random().toString(36).substring(2) + Date.now().toString(36);

  useEffect(() => {
    if (!reviewData.sessionId) {
      const newSessionId = generateSessionId();
      handleChange('sessionId', newSessionId);
    }
  }, [reviewData.sessionId]);

  const restaurantTypeOptions = Object.keys(RestaurantType)
    .filter((key) => isNaN(Number(key)))
    .map((label) => ({
      label, // The human-readable label
      value: RestaurantType[label as keyof typeof RestaurantType], // The corresponding numeric value
    }));

  const handleSetRestaurantName = (name: string) => {
    setReviewData((prev) => ({ ...prev, restaurantName: name }));
  }

  const handleDinerRestaurantReviewChange = (
    dinerId: string,
    input: Partial<DinerRestaurantReview>
  ) => {

    let matchedDinerRestaurantReview: DinerRestaurantReview | null = null;
    for (const dinerRestaurantReview of reviewData.dinerRestaurantReviews) {
      if (dinerRestaurantReview.dinerId === dinerId) {
        matchedDinerRestaurantReview = dinerRestaurantReview;
        break;
      }
    }
    if (!matchedDinerRestaurantReview) {
      const newDinerRestaurantReview: DinerRestaurantReview = {
        dinerRestaurantReviewId: uuidv4(),
        dinerId: dinerId,
        rating: input.rating ?? 0,
        comments: input.comments ?? '',
      };
      const newDinerRestaurantReviews = [...reviewData.dinerRestaurantReviews, newDinerRestaurantReview];
      const newReviewData = { ...reviewData, dinerRestaurantReviews: newDinerRestaurantReviews };
      setReviewData(newReviewData);
      return;
    } else {
      const updatedDinerRestaurantReview = {
        ...matchedDinerRestaurantReview,
        ...input,
      };
      const newDinerRestaurantReviews = reviewData.dinerRestaurantReviews.map((dinerRestaurantReview) => {
        if (dinerRestaurantReview.dinerId === dinerId) {
          return updatedDinerRestaurantReview;
        }
        return dinerRestaurantReview;
      });
      const newReviewData = { ...reviewData, dinerRestaurantReviews: newDinerRestaurantReviews };
      setReviewData(newReviewData);
    }

  };

  const handlePreview = async () => {
    if (!reviewData.sessionId) return;
    try {
      setIsLoading(true);
      await onSubmitPreview(reviewData);
      props.onReceivedPreviewResponse();
    } catch (error) {
      console.error('Error previewing review:', error);
    }
    setIsLoading(false);
  };

  const renderRestaurantName = (): JSX.Element => (
    <div className="form-group">
      <label htmlFor="restaurant-name">Restaurant Name</label>
      <RestaurantName
        restaurantName={reviewData.restaurantName}
        onSetRestaurantName={handleSetRestaurantName}
        onSetGooglePlace={(place) => handleChange('place', place)}
      />
    </div>
  );

  const renderRestaurantType = (): JSX.Element => {
    const value = reviewData?.place?.restaurantType || RestaurantType.Restaurant;
    return (
      <div className="form-group">
        <label htmlFor="restaurant-type">Restaurant Type</label>
        <Select
          id="restaurant-type"
          value={value}
          onChange={(event) => handleRestaurantTypeChange(Number(event.target.value) as RestaurantType)}
        >
          {restaurantTypeOptions.map(({ label, value }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </div>
    );
  };

  const renderDateOfVisit = (): JSX.Element => (
    <div className="form-group">
      <label htmlFor="date-of-visit">Date of Visit</label>
      <TextField
        id="date-of-visit"
        type="date"
        fullWidth
        value={reviewData.dateOfVisit}
        onChange={(e) => handleChange('dateOfVisit', e.target.value)}
      />
    </div>
  );

  const renderReviewText = (): JSX.Element => (
    <div className="form-group">
      <label htmlFor="review-text">Review Text</label>
      <TextField
        id="review-text"
        fullWidth
        multiline
        rows={4}
        value={reviewData.reviewText}
        onChange={(e) => handleChange('reviewText', e.target.value)}
      />
    </div>
  );

  const renderRatingsAndComments = (): JSX.Element => {
    return (
      <div className="ratings-and-comments">
        <fieldset className="ratings-comments-section">
          <legend>Ratings and Comments by Users</legend>
          {diners.map((diner) => {
            const input: DinerRestaurantReview = getDinerRestaurantReview(diner.dinerId) || {
              dinerRestaurantReviewId: uuidv4(),
              dinerId: diner.dinerId,
              rating: 0,
              comments: '',
            };
            return (
              <div key={diner.dinerId} className="contributor-section">
                <div className="contributor-header">
                  <h4>{diner.dinerName}</h4>
                </div>
                <div className="contributor-rating">
                  <label htmlFor={`rating-${diner.dinerId}`}>Rating</label>
                  <Rating
                    id={`rating-${diner.dinerId}`}
                    name={`rating-${diner.dinerId}`}
                    value={input.rating}
                    max={5}
                    onChange={(event, newValue) =>
                      handleDinerRestaurantReviewChange(diner.dinerId, { rating: (newValue || 0) })
                    }
                  />
                </div>
                <div className="contributor-comments">
                  <label htmlFor={`comments-${diner.dinerId}`}>Comments</label>
                  <TextField
                    id={`comments-${diner.dinerId}`}
                    name={`comments-${diner.dinerId}`}
                    fullWidth
                    multiline
                    rows={3}
                    value={input.comments}
                    onChange={(event) =>
                      handleDinerRestaurantReviewChange(diner.dinerId, { comments: event.target.value })
                    }
                  />
                </div>
              </div>
            );
          })}
        </fieldset>
      </div>
    );
  };

  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) return null;
    return <PulsingDots />;
  };

  // return (
  //   <div
  //     id="form"
  //     className="tab-panel active"
  //     style={{
  //       maxHeight: isMobile ? 'calc(60vh)' : '80vh', // Fixed height for desktop
  //       overflowY: 'auto', // Enable vertical scrolling
  //       padding: '1rem',   // Optional: Add some padding for better visuals
  //     }}
  //   >
  //     <form id="add-review-form">
  //       <fieldset>
  //         <legend>Restaurant Details</legend>
  //         {renderRestaurantName()}
  //         {renderRestaurantType()}
  //       </fieldset>

  //       <fieldset>
  //         <legend>Ratings and Comments</legend>
  //         {renderRatingsAndComments()}
  //       </fieldset>

  //       <fieldset>
  //         <legend>Review</legend>
  //         {renderReviewText()}
  //         {renderDateOfVisit()}
  //       </fieldset>
  //     </form>

  //     <div className="form-actions">
  //       <Button
  //         disabled={!reviewData.place || !reviewData.reviewText}
  //         onClick={handlePreview}
  //         variant="contained"
  //         color="primary"
  //       >
  //         Preview
  //       </Button>
  //     </div>

  //     {renderPulsingDots()}
  //   </div>
  // );



  const renderRestaurantSelector = (): JSX.Element => (
    <div className="form-group">
      <label htmlFor="restaurant-selector">Select Existing Restaurant</label>
      <Select
        id="restaurant-selector"
        value={reviewData?.place?.googlePlaceId || ''}
        onChange={(event) => handleExistingRestaurantSelection(event.target.value)}
        displayEmpty
        fullWidth
      >
        <MenuItem value="" disabled>
          Select a restaurant
        </MenuItem>
        {newRestaurants.map((restaurant) => (
          <MenuItem key={restaurant.newRestaurantId} value={restaurant.googlePlace?.googlePlaceId}>
            {restaurant.googlePlace?.name}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
  
  const renderRestaurantNameAndType = (): JSX.Element | null => {
    if (isUsingExistingRestaurant) return null; // Don't show if using an existing restaurant
  
    return (
      <>
        {renderRestaurantName()}
        {renderRestaurantType()}
      </>
    );
  };
  
  const renderRestaurantDetailsToggle = (): JSX.Element => (
    <div className="form-group">
      <FormControl component="fieldset">
        <RadioGroup
          row
          value={isUsingExistingRestaurant ? 'existing' : 'new'}
          onChange={(event) => setIsUsingExistingRestaurant(event.target.value === 'existing')}
        >
          <FormControlLabel
            value="existing"
            control={<Radio />}
            label="Existing Restaurant"
          />
          <FormControlLabel
            value="new"
            control={<Radio />}
            label="New Restaurant"
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
  
  const handleExistingRestaurantSelection = (googlePlaceId: string) => {
    const selectedRestaurant = newRestaurants.find(
      (restaurant) => restaurant.googlePlace?.googlePlaceId === googlePlaceId
    );
    if (selectedRestaurant) {
      handleChange('place', selectedRestaurant.googlePlace);
    }
  };
  
  // Updated render function
  return (
    <div
      id="form"
      className="tab-panel active"
      style={{
        maxHeight: isMobile ? 'calc(60vh)' : '80vh',
        overflowY: 'auto',
        padding: '1rem',
      }}
    >
      <form id="add-review-form">
        <fieldset>
          <legend>Restaurant Details</legend>
          {renderRestaurantDetailsToggle()}
          {isUsingExistingRestaurant ? renderRestaurantSelector() : renderRestaurantNameAndType()}
        </fieldset>
  
        <fieldset>
          <legend>Ratings and Comments</legend>
          {renderRatingsAndComments()}
        </fieldset>
  
        <fieldset>
          <legend>Review</legend>
          {renderReviewText()}
          {renderDateOfVisit()}
        </fieldset>
      </form>
  
      <div className="form-actions">
        <Button
          disabled={!reviewData.place || !reviewData.reviewText}
          onClick={handlePreview}
          variant="contained"
          color="primary"
        >
          Preview
        </Button>
      </div>
  
      {renderPulsingDots()}
    </div>
  );
  
};

export default NewReviewEntryForm;
