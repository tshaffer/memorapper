import { Box, Button, FormControl, FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup, Select, Slider, TextField, useMediaQuery } from '@mui/material';
import RestaurantName from '../../components/RestaurantName';
import '../../styles/multiPanelStyles.css';
import { useEffect, useState } from 'react';
import { RestaurantType, ReviewData, WouldReturn } from '../../types';
import PulsingDots from '../../components/PulsingDots';
import React from 'react';
import { useUserContext } from '../../contexts/UserContext';

interface ReviewEntryFormProps {
  reviewData: ReviewData;
  setReviewData: React.Dispatch<React.SetStateAction<ReviewData>>;
  onSubmitPreview: (formData: Omit<ReviewData, 'chatHistory'>) => void;
  onReceivedPreviewResponse: () => any;
}

const ReviewEntryForm: React.FC<ReviewEntryFormProps> = (props: ReviewEntryFormProps) => {

  const { users, currentUser } = useUserContext();

  const { reviewData, setReviewData, onSubmitPreview } = props;

  const isMobile = useMediaQuery('(max-width:768px)');

  const [isLoading, setIsLoading] = useState(false);

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

  const handleSetRestaurantName = (name: string) => {
    setReviewData((prev) => ({ ...prev, restaurantName: name }));
  }

  const handlePrimaryRatingChange = (_: Event, value: number | number[]) => {
    setReviewData((prev) => ({ ...prev, primaryRating: value as number }));
  };

  const handleSecondaryRatingChange = (_: Event, value: number | number[]) => {
    setReviewData((prev) => ({ ...prev, secondaryRating: value as number }));
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

  const renderRestaurantName = (): JSX.Element => {
    return (
      <>
        <label htmlFor="restaurant-name">Restaurant Name (Required):</label>
        <RestaurantName
          restaurantName={reviewData.restaurantName}
          onSetRestaurantName={handleSetRestaurantName}
          onSetGooglePlace={(place) => handleChange('place', place)}
        />
      </>
    );
  }

  const renderRestaurantType = (): JSX.Element => {
    const value = reviewData ?  (reviewData.place ? reviewData.place!.restaurantType.toString() : 0) : 0;
    return (
      <>
        <label>Restaurant Type (Required):</label>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          onChange={(event) => handleRestaurantTypeChange(event.target.value as RestaurantType)}
        >
          <MenuItem value={RestaurantType.Generic}>Restaurant</MenuItem>
          <MenuItem value={RestaurantType.CoffeeShop}>Coffee Shop</MenuItem>
          <MenuItem value={RestaurantType.Bar}>Bar</MenuItem>
          <MenuItem value={RestaurantType.Bakery}>Bakery</MenuItem>
          <MenuItem value={RestaurantType.Taqueria}>Taqueria</MenuItem>
          <MenuItem value={RestaurantType.PizzaPlace}>Pizza</MenuItem>
          <MenuItem value={RestaurantType.ItalianRestaurant}>Italian</MenuItem>
          <MenuItem value={RestaurantType.DessertShop}>Dessert</MenuItem>
        </Select>
      </>
    );
  }

  const renderReviewText = (): JSX.Element => {
    return (
      <>
        <label>Review Text (Required):</label>
        <TextField
          label="Review Text"
          fullWidth
          multiline
          rows={4}
          value={reviewData.reviewText}
          onChange={(e) => handleChange('reviewText', e.target.value)}
        />
      </>
    );
  }

  const renderReviewer = (): JSX.Element => {
    return (
      <>
        <label>Reviewer:</label>
        <Select
          value={reviewData.reviewerId ? reviewData.reviewerId : currentUser?.id}
          onChange={(event) => handleChange('reviewerId', event.target.value)}
        >
          {
            users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.userName}
              </MenuItem>
            ))
          }
        </Select>
      </>
    );
  }

  const renderDateOfVisit = (): JSX.Element => {
    return (
      <TextField
        fullWidth
        type="date"
        value={reviewData.dateOfVisit}
        onChange={(e) => handleChange('dateOfVisit', e.target.value)}
        // placeholder="mm/dd/yyyy"
        label="Date of Visit"
      />
    )
  }

  const renderRatings = (): JSX.Element => {
    const { settings } = useUserContext();
    return (
      <>
        <label>Ratings</label>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "fit-content(300px) 200px", // First column auto-sizes up to a maximum of 300px
            gridAutoRows: "auto", // Each row's height adjusts to its content
            gap: 2, // Optional: spacing between items
          }}
        >
          {/* Primary Rating */}
          <Box
            sx={{
              border: "1px solid",
              padding: "0px 15px 0px 10px",
              display: "flex",
              justifyContent: "left",
              alignItems: "center", // Optional: centers vertically if needed
            }}
          >
            <FormLabel>{settings.ratingsUI.primaryRatingLabel}</FormLabel>
          </Box>
          <Box
            sx={{
              border: "1px solid",
              padding: 1,
              display: "flex", // Use flexbox
              justifyContent: "center", // Horizontally center the content
            }}
          >
            <Slider
              sx={{ width: '150px' }}
              defaultValue={5}
              value={reviewData.primaryRating || 0}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={0}
              max={10}
              onChange={handlePrimaryRatingChange}
            />
          </Box>
          {/* Secondary Rating */}
          {settings.ratingsUI.showSecondaryRating && (
            <>
              <Box
                sx={{
                  border: "1px solid",
                  padding: "0px 15px 0px 10px",
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center", // Optional: centers vertically if needed
                }}
              >
                <FormLabel>{settings.ratingsUI.secondaryRatingLabel}</FormLabel>
              </Box>
              <Box
                sx={{
                  border: "1px solid",
                  padding: 1,
                  display: "flex", // Use flexbox
                  justifyContent: "center", // Horizontally center the content
                }}
              >
                <Slider
                  sx={{ width: '150px' }}
                  defaultValue={5}
                  value={reviewData.secondaryRating || 0}
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={0}
                  max={10}
                  onChange={handleSecondaryRatingChange}
                />
              </Box>
            </>
          )}
        </Box>
      </>
    );
  }

  const renderWouldReturn = (): JSX.Element => {
    return (
      <FormControl component="fieldset" style={{ marginTop: 20, width: '100%' }}>
        <FormLabel component="legend">Would Return</FormLabel>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <RadioGroup
            row
            name="would-return"
            value={reviewData.wouldReturn}
            onChange={(e) => handleChange('wouldReturn', parseInt(e.target.value))}
          >
            <FormControlLabel value={WouldReturn.Yes} control={<Radio />} label="Yes" />
            <FormControlLabel value={WouldReturn.No} control={<Radio />} label="No" />
            <FormControlLabel value={WouldReturn.NotSure} control={<Radio />} label="Not Sure" />
          </RadioGroup>
          <Button onClick={() => handleChange('wouldReturn', null)} size="small">
            Clear
          </Button>
        </Box>
      </FormControl>
    );
  }

  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) {
      return null;
    }
    return (<PulsingDots />);
  };


  return (
    <div
      id="form"
      className="tab-panel active"
      style={{
        maxHeight: isMobile ? 'calc(60vh)' : 'auto'
      }}
    >
      <form id='add-review-form'>
        {renderRestaurantName()}
        {renderRestaurantType()}
        {renderReviewText()}
        {renderReviewer()}
        {renderDateOfVisit()}
        {renderRatings()}
        {renderWouldReturn()}
      </form>

      <Button
        disabled={!reviewData.place || !reviewData.reviewText}
        onClick={handlePreview}
      >
        Preview
      </Button>

      {renderPulsingDots()}

    </div>
  );
};

export default ReviewEntryForm;
