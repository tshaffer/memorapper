
import { Box, Button, Divider, MenuItem, Paper, Select, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import Rating from '@mui/material/Rating';

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
import PulsingDots from '../components/PulsingDots';
import { RootState } from '../redux';
import PlaceRatingInput from '../components/PlaceRatingInput';

interface MrReviewEntryProps {
  mrReviewData: MrReviewData;
  setMrReviewData: React.Dispatch<React.SetStateAction<MrReviewData>>;
  onSubmit: () => Promise<void>;
}

const MrReviewEntry: React.FC<MrReviewEntryProps> = (props: MrReviewEntryProps) => {

  const { mrPlacesWithGooglePlaces } = useSelector((state: RootState) => state.memorapper);

  const { mrReviewData, setMrReviewData, onSubmit } = props;

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

  const getDisabledStyle = (condition: boolean): React.CSSProperties => {
    return condition ? { opacity: 0.5, pointerEvents: 'none' } : {};
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

  const renderOrderedItems = (): JSX.Element => {
    const items = mrReviewData.itemReviews || [];

    const handleItemChange = (index: number, field: 'itemName' | 'rating' | 'comments', value: any) => {
      const updatedItems = [...items];
      if (!updatedItems[index]) {
        updatedItems[index] = { itemName: '', rating: 0, comments: '' };
      }
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      handleChange('itemReviews', updatedItems);
    };

    const addNewItem = () => {
      const updatedItems = [...items, { itemName: '', rating: 0, comments: '' }];
      handleChange('itemReviews', updatedItems);
    };

    return (
      <div className="ordered-items-section">
        {items.map((item, index) => (
          <div key={index} className="ordered-item">
            <div className="form-group">
              <label htmlFor={`itemName-${index}`}>Item Name</label>
              <TextField
                id={`itemName-${index}`}
                value={item.itemName}
                fullWidth
                onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor={`itemRating-${index}`}>Rating (0-10)</label>
              <Rating
                id={`itemRating-${index}`}
                max={10}
                value={item.rating}
                onChange={(event, newValue) => handleItemChange(index, 'rating', newValue || 0)}
              />
            </div>
            <div className="form-group">
              <label htmlFor={`comments-${index}`}>Evaluation</label>
              <TextField
                id={`comments-${index}`}
                value={item.comments}
                fullWidth
                multiline
                rows={2}
                onChange={(e) => handleItemChange(index, 'comments', e.target.value)}
              />
            </div>
          </div>
        ))}
        <Button variant="outlined" onClick={addNewItem} sx={{ mt: 2 }}>
          Add Another Item
        </Button>
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
        value={mrReviewData.dateOfVisit}
        onChange={(e) => handleChange('dateOfVisit', e.target.value)}
      />
    </div>
  );

  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) return null;
    return <PulsingDots />;
  };

  return (
    <>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!mrReviewData?.place}
          style={getDisabledStyle(!mrReviewData?.place)}
        >
          Add Review
        </Button>
      </div >

      <Box sx={{ padding: 2 }}>
        <Paper elevation={3} sx={{ padding: 2, mb: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            {renderRestaurantSelector()}
            {renderRestaurantRating()}
            {renderPlaceReview()}
          </Stack>
        </Paper>

        <Paper elevation={1} sx={{ padding: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            {renderOrderedItems()}
            {renderDateOfVisit()}
          </Stack>
        </Paper>
      </Box>

      {renderPulsingDots()}

    </>
  );
};

export default MrReviewEntry;
