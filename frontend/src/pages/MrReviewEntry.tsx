import { v4 as uuidv4 } from 'uuid';

import { Button, MenuItem, Select, TextField, useMediaQuery } from '@mui/material';
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

  const getRestaurantByPlaceId = (placeId: string): MrPlaceWithGooglePlace | undefined => {
    return getRestaurants().find((restaurant) => restaurant.placeId === placeId);
  };

  const getMrPlaceByPlaceId = (placeId: string): MrPlaceWithGooglePlace | undefined => {
    return mrPlacesWithGooglePlaces.find((place) => place.placeId === placeId);
  };

  const handleChange = (field: keyof MrReviewData, value: any) => {
    setMrReviewData((prev) => ({ ...prev, [field]: value }));
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

  const renderReviewText = (): JSX.Element => (
    <div className="form-group">
      <label htmlFor="review-text">Review Text</label>
      <TextField
        id="review-text"
        fullWidth
        multiline
        rows={4}
        value={mrReviewData.reviewText}
        onChange={(e) => handleChange('reviewText', e.target.value)}
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

  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) return null;
    return <PulsingDots />;
  };

  const handleRestaurantSelection = (placeId: string) => {
    console.log('Selected PlaceId:', placeId);
    const selectedRestaurant = getRestaurantByPlaceId(placeId);
    const selectedMrPlaceWithGooglePlace: MrPlaceWithGooglePlace | undefined = getMrPlaceByPlaceId(placeId);
    if (selectedMrPlaceWithGooglePlace && selectedRestaurant) {
      const selectedMrPlace: MrPlace = {
        _idPlace: selectedMrPlaceWithGooglePlace._idPlace,
        placeId: selectedMrPlaceWithGooglePlace.placeId,
        googlePlaceId: selectedMrPlaceWithGooglePlace.googlePlaceId,
        placeType: selectedMrPlaceWithGooglePlace.placeType || PlaceType.Restaurant,
        placeComments: selectedMrPlaceWithGooglePlace.placeComments || '',
        mrPlaceReviews: [],
        mrPlaceSpecificities: {},
      };
      const currentReviewData: MrReviewData = { ...mrReviewData };
      currentReviewData.place = selectedMrPlace;
      currentReviewData.place!.placeId = selectedRestaurant.placeId;
      setMrReviewData(currentReviewData);
    }
  };

  const renderRestaurantSelector = (): JSX.Element => (
    <div className="form-group">
      <Select
        id="restaurant-selector"
        value={mrReviewData?.place?.placeId || ''}
        onChange={(event) => handleRestaurantSelection(event.target.value)}
        displayEmpty
        fullWidth
      >
        <MenuItem value="" disabled>
          Select a restaurant
        </MenuItem>
        {getRestaurants().map((restaurantPlace: MrPlaceWithGooglePlace) => (
          <MenuItem key={restaurantPlace.placeId} value={restaurantPlace.placeId}>
            {restaurantPlace.googlePlace?.name}
          </MenuItem>
        ))}
      </Select>
    </div>
  );

  return (
    <>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <Button
          variant="contained"
          onClick={onSubmit}
        >
          Add Review
        </Button>
      </div>

      <div
        id="form"
        className="tab-panel active"
        style={{
          maxHeight: isMobile ? 'calc(60vh)' : '80vh',
          overflowY: 'auto',
          padding: '1rem',
          paddingBottom: '4rem', // extra space so content isn’t hidden behind the fixed button
        }}
      >
        <form id="add-review-form">
          <fieldset>
            <legend>Restaurant Details</legend>
            {renderRestaurantSelector()}
          </fieldset>

          <fieldset>
            <legend>Items Ordered</legend>
            {renderOrderedItems()}
          </fieldset>

          <fieldset>
            <legend>Review</legend>
            {renderReviewText()}
            {renderDateOfVisit()}
          </fieldset>
        </form>

        {renderPulsingDots()}
      </div>
    </>
  );
};

export default MrReviewEntry;
