import { v4 as uuidv4 } from 'uuid';

import { Button, MenuItem, Select, TextField, useMediaQuery } from '@mui/material';
import Rating from '@mui/material/Rating';

import '../styles/multiPanelStyles.css';
import '../styles/reviewEntryForm.css';
import { useEffect, useState } from 'react';
import {
  PlaceType,
  MrPlaceWithGooglePlace,
  RestaurantType,
  MrReviewData,
  MrPlace,
} from '../types';
import React from 'react';
import { useSelector } from 'react-redux';
import PulsingDots from '../components/PulsingDots';
import { RootState } from '../redux';
import { current } from '@reduxjs/toolkit';

interface MrReviewEntryProps {
  mrReviewData: MrReviewData;
  setMrReviewData: React.Dispatch<React.SetStateAction<MrReviewData>>;
}

const MrReviewEntry: React.FC<MrReviewEntryProps> = (props: MrReviewEntryProps) => {

  const { mrPlaces, mrPlacesWithGooglePlaces } = useSelector((state: RootState) => state.memorapper);

  const { mrReviewData, setMrReviewData } = props;

  const isMobile = useMediaQuery('(max-width:768px)');

  const [filteredDiners, setFilteredDiners] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const getRestaurants = (): MrPlaceWithGooglePlace[] => {
    const result = mrPlacesWithGooglePlaces
      .filter((item): item is MrPlaceWithGooglePlace => item.placeType! === PlaceType.Restaurant)
      .map(item => item!);
    return result;
  }

  const getRestaurantByPlaceId = (placeId: string): MrPlaceWithGooglePlace | undefined => {
    return getRestaurants().find((restaurant) => restaurant.placeId === placeId);
  }

  const getMrPlaceByPlaceId = (placeId: string): MrPlaceWithGooglePlace | undefined => {
    return mrPlacesWithGooglePlaces.find((place) => place.placeId === placeId);
  } 

  const getDinerRestaurantReview = (dinerId: string): any | null => {
    // if (!mrReviewData || !mrReviewData.dinerRestaurantReviews) return null;

    // for (const dinerRestaurantReview of mrReviewData.dinerRestaurantReviews) {
    //   if (dinerRestaurantReview.dinerId === dinerId) {
    //     return dinerRestaurantReview;
    //   }
    // }
    return null;
  }

  const handleChange = (field: keyof MrReviewData, value: any) => {
    setMrReviewData((prev) => ({ ...prev, [field]: value }));
  };

  const generateSessionId = (): string => Math.random().toString(36).substring(2) + Date.now().toString(36);

  useEffect(() => {

    const fetchDiners = async (): Promise<any[]> => {
      // const dinersForCurrentDiningGroup: Diner[] = diners.filter((diner) => diner.diningGroupId === currentDiningGroup?.diningGroupId);
      // return dinersForCurrentDiningGroup;
      return [];
    }

    const fetchData = async () => {
      const diners = await fetchDiners();
      setFilteredDiners(diners);
    };

    fetchData();

  }, []);

  const restaurantTypeOptions = Object.keys(RestaurantType)
    .filter((key) => isNaN(Number(key)))
    .map((label) => ({
      label, // The human-readable label
      value: RestaurantType[label as keyof typeof RestaurantType], // The corresponding numeric value
    }));

  const handleDinerRestaurantReviewChange = (
    dinerId: string,
    input: Partial<any>
  ) => {

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

  const renderRatingsAndComments = (): JSX.Element => {
    return (
      <div className="ratings-and-comments">
        <fieldset className="ratings-comments-section">
          <legend>Ratings and Comments by Users</legend>
          {filteredDiners.map((diner) => {
            const input: any = getDinerRestaurantReview(diner.dinerId) || {
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
      }
      // handleChange('place', selectedRestaurant);
      const currentReviewData: MrReviewData = { ...mrReviewData };
      currentReviewData.place = selectedMrPlace;
      currentReviewData.place!.placeId = selectedRestaurant.placeId;
      console.log('Updated Review Data:', currentReviewData);
      setMrReviewData(currentReviewData);
    }
  };


  const renderRestaurantSelector = (): JSX.Element => {
    console.log('renderRestaurantSelector');
    console.log(mrReviewData?.place?.placeId || '');
    // const restaurantPlaces: MrPlaceWithGooglePlace[] = getRestaurants();
    // restaurantPlaces.forEach((restaurantPlace) => {
    //   console.log(restaurantPlace.placeId);
    // });

    return (
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
  };

  return (
    <>
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
            <legend>Ratings and Comments</legend>
            {renderRatingsAndComments()}
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
