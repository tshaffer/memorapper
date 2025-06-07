import {
  Box,
  Divider,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material';

import '../styles/multiPanelStyles.css';
import '../styles/reviewEntryForm.css';
import { useState } from 'react';
import {
  PlaceType,
  MrPlaceWithGooglePlace,
  MrReviewData,
  MrPlace,
} from '../types';
import React from 'react';
import { useSelector } from 'react-redux';
import PlaceRatingInput from '../components/PlaceRatingInput';
import { selectAllMrPlacesWithGooglePlaces } from '../redux/memorapperSelectors';

interface RestaurantRatingProps {
  mrReviewData: MrReviewData;
  setMrReviewData: React.Dispatch<React.SetStateAction<MrReviewData>>;
}

const RestaurantRating: React.FC<RestaurantRatingProps> = ({ mrReviewData, setMrReviewData }) => {
  const mrPlacesWithGooglePlaces: MrPlaceWithGooglePlace[] = useSelector(selectAllMrPlacesWithGooglePlaces);

  const isMobile = useMediaQuery('(max-width:768px)');
  const [isLoading, setIsLoading] = useState(false);

  const restaurantPlaces: MrPlaceWithGooglePlace[] = mrPlacesWithGooglePlaces
    .filter((place) => place.placeType === PlaceType.Restaurant);

  const handlePlaceReviewChange = (value: string) => {
    const updatedPlace: MrPlace = { ...mrReviewData.place!, placeReview: value };
    setMrReviewData((prev) => ({ ...prev, place: updatedPlace }));
  };

  const handleRestaurantSelection = (_id: string) => {
    console.log('Selected PlaceId:', _id);
    const selected = restaurantPlaces.find((p) => p._id === _id);
    if (!selected) return;

    const selectedMrPlace: MrPlace = {
      _id: selected._id,
      googlePlaceId: selected.googlePlaceId,
      placeType: selected.placeType || PlaceType.Restaurant,
      placePreview: selected.placePreview || '',
      placeRating: selected.placeRating || 0,
      placeReview: selected.placeReview || '',
      restaurantReviews: [],
      restaurantSpecs: selected.restaurantSpecs || {},
    };

    setMrReviewData((prev) => ({ ...prev, place: selectedMrPlace }));
  };

  const renderRestaurantSelector = (): JSX.Element => (
    <div className="form-group">
      <Select
        id="restaurant-selector"
        value={mrReviewData?.place?._id || ''}
        onChange={(event) => handleRestaurantSelection(event.target.value)}
        displayEmpty
        fullWidth
      >
        <MenuItem value="" disabled>
          Select a restaurant
        </MenuItem>
        {restaurantPlaces.map((restaurant) => (
          <MenuItem key={restaurant._id} value={restaurant._id}>
            {restaurant.googlePlace?.name || 'Unnamed Place'}
          </MenuItem>
        ))}
      </Select>
    </div>
  );

  const renderRestaurantRating = (): JSX.Element => (
    <div className="form-group">
      <PlaceRatingInput
        rating={mrReviewData?.place?.placeRating || null}
        onChange={(newRating) => {
          const updatedPlace: MrPlace = {
            ...mrReviewData.place!,
            placeRating: newRating ?? undefined,
          };
          setMrReviewData((prev) => ({ ...prev, place: updatedPlace }));
        }}
        legendLabels={["Won’t return", "Would try again", "Would return"]}
        colorBands={["#f44336", "#fdd835", "#4caf50"]}
        rangeBands={[[1, 3], [4, 7], [8, 10]]}
      />
    </div>
  );

  const renderPlaceReview = (): JSX.Element => (
    <div className="form-group">
      <label htmlFor="review-text">Review Text</label>
      <TextField
        id="review-text"
        fullWidth
        multiline
        rows={4}
        value={mrReviewData.place?.placeReview || ''}
        onChange={(e) => handlePlaceReviewChange(e.target.value)}
      />
    </div>
  );

  return (
    <Paper elevation={3} sx={{ padding: 2, mb: 4 }}>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={2}>
        {renderRestaurantSelector()}
        {renderRestaurantRating()}
        {renderPlaceReview()}
      </Stack>
    </Paper>
  );
};

export default RestaurantRating;
