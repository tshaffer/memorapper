
import { Box, Divider, MenuItem, Paper, Select, Stack, TextField, useMediaQuery } from '@mui/material';

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
import { RootState } from '../redux';
import PlaceRatingInput from '../components/PlaceRatingInput';

interface RestaurantRatingProps {
  mrReviewData: MrReviewData;
  setMrReviewData: React.Dispatch<React.SetStateAction<MrReviewData>>;
}

const RestaurantRating: React.FC<RestaurantRatingProps> = (props: RestaurantRatingProps) => {

  const { mrPlacesWithGooglePlaces } = useSelector((state: RootState) => state.memorapper);

  const { mrReviewData, setMrReviewData } = props;

  const isMobile = useMediaQuery('(max-width:768px)');

  const [isLoading, setIsLoading] = useState(false);

  const getRestaurants = (): MrPlaceWithGooglePlace[] => {
    return mrPlacesWithGooglePlaces
      .filter((item): item is MrPlaceWithGooglePlace => item.placeType! === PlaceType.Restaurant);
  };

  const getRestaurantByPlaceId = (_id: string): MrPlaceWithGooglePlace | undefined => {
    return getRestaurants().find((restaurant) => restaurant._id === _id);
  };

  const getMrPlaceWithGooglePlace = (_id: string): MrPlaceWithGooglePlace | undefined => {
    return mrPlacesWithGooglePlaces.find((place) => place._id === _id);
  };

  const handleChange = (field: keyof MrReviewData, value: any) => {
    setMrReviewData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRestaurantSelection = (_id: string) => {
    console.log('Selected PlaceId:', _id);
    const selectedRestaurant = getRestaurantByPlaceId(_id);
    const selectedMrPlaceWithGooglePlace: MrPlaceWithGooglePlace | undefined = getMrPlaceWithGooglePlace(_id);
    if (selectedMrPlaceWithGooglePlace && selectedRestaurant) {
      const selectedMrPlace: MrPlace = {
        _id: selectedMrPlaceWithGooglePlace._id,
        googlePlaceId: selectedMrPlaceWithGooglePlace.googlePlaceId,
        placeType: selectedMrPlaceWithGooglePlace.placeType || PlaceType.Restaurant,
        placePreview: selectedMrPlaceWithGooglePlace.placePreview || '',
        placeReview: selectedMrPlaceWithGooglePlace.placeReview || '',
        restaurantReviews: [],
        restaurantSpecs: selectedRestaurant.restaurantSpecs || {},
      };
      const currentReviewData: MrReviewData = { ...mrReviewData };
      currentReviewData.place = selectedMrPlace;
      currentReviewData.placeReview = selectedMrPlace.placeReview;
      currentReviewData.place!._id = selectedRestaurant._id;
      setMrReviewData(currentReviewData);
    }
  };

  const renderRestaurantSelector = (): JSX.Element => {
    console.log(mrReviewData?.place?._id);
    return (
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
          {getRestaurants().map((restaurantPlace: MrPlaceWithGooglePlace) => (
            <MenuItem key={restaurantPlace._id} value={restaurantPlace._id}>
              {restaurantPlace.googlePlace?.name}
            </MenuItem>
          ))}
        </Select>
      </div>
    );
  }

  function renderRestaurantRating(): React.ReactNode {
    console.log('mrReviewData: ', mrReviewData);  // mrReviewData.place is null

    return (
      <div className="form-group">
        <PlaceRatingInput
          rating={mrReviewData?.place?.placeRating || null}
          onChange={(newRating) => {
            const updatedPlace: MrPlace = mrReviewData?.place as MrPlace;
            updatedPlace.placeRating = newRating ? newRating : undefined; // Set to undefined if null
            setMrReviewData((prev) => ({ ...prev, place: updatedPlace }));
          }}
          legendLabels={["Won’t return", "Would try again", "Would return"]}
          colorBands={["#f44336", "#fdd835", "#4caf50"]}
          rangeBands={[[1, 3], [4, 7], [8, 10]]}
        />
      </div>
    );
  }

  const renderPlaceReview = (): JSX.Element => (
    <div className="form-group">
      <label htmlFor="review-text">Review Text</label>
      <TextField
        id="review-text"
        fullWidth
        multiline
        rows={4}
        value={mrReviewData.placeReview}
        onChange={(e) => handleChange('placeReview', e.target.value)}
      />
    </div>
  );

  return (
    <>
        <Paper elevation={3} sx={{ padding: 2, mb: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            {renderRestaurantSelector()}
            {renderRestaurantRating()}
            {renderPlaceReview()}
          </Stack>
        </Paper>

    </>
  );
};

export default RestaurantRating;
