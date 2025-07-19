import { useEffect, useState } from 'react';
import '../styles/multiPanelStyles.css';
import { useMediaQuery } from "@mui/material";
import { useLocation, useParams } from 'react-router-dom';
import React from 'react';
import { PlaceType, MrPlaceWithGooglePlace } from '../types';
import { useDispatch } from 'react-redux';
import { addMrPlace } from '../redux/memorapperSlice';
import { Button, MenuItem, Select, Checkbox, FormControlLabel, TextField, Rating } from "@mui/material";
import { GooglePlace, RestaurantType, MrRestaurant } from "../types";
import RestaurantName from '../components/RestaurantName';
import PulsingDots from '../components/PulsingDots';
import PlaceRatingInput from '../components/PlaceRatingInput';

const MrPlaceForm = () => {

  const dispatch = useDispatch();

  const { _id } = useParams<{ _id: string }>();

  const [placeName, setPlaceName] = React.useState('');

  const location = useLocation();

  const editablePlace = location.state as MrPlaceWithGooglePlace | null;
  const googlePlace: GooglePlace | undefined = editablePlace?.googlePlace;
  const googlePlaceId = googlePlace?.googlePlaceId || '';
  const placeType = editablePlace?.placeType || PlaceType.Restaurant;
  const interestLevel = editablePlace?.interestLevel || 0;
  const placePreview = editablePlace?.placePreview || '';
  const placeRating = editablePlace?.placeRating ?? 0;
  const placeReview = editablePlace?.placeReview ?? '';
  const restaurantReviews = editablePlace?.restaurantReviews || [];
  const restaurantSpecs = editablePlace?.restaurantSpecs || {} as MrRestaurant;

  useEffect(() => {
    if (googlePlace?.name) {
      setPlaceName(googlePlace.name);
    }
  }, [googlePlace]);

  const initialPlaceData: MrPlaceWithGooglePlace = {
    _id,
    googlePlace,
    googlePlaceId,
    placeType,
    interestLevel,
    placePreview,
    placeReview,
    placeRating,
    restaurantReviews,
    restaurantSpecs,
  };

  const [mrPlaceWithGooglePlace, setMrPlaceWithGooglePlace] = useState<MrPlaceWithGooglePlace>(initialPlaceData);

  const isMobile = useMediaQuery('(max-width:768px)');
  const [isLoading, setIsLoading] = useState(false);

  interface MealAvailability {
    openForBreakfast: boolean;
    openForLunch: boolean;
    openForDinner: boolean;
  }

  const containerStyle: React.CSSProperties =
  {
    width: '100%', // fill the entire width
    padding: '1rem',
    boxSizing: 'border-box', // ensures padding doesn't overflow
  };

  // Helper: infer meal availability from opening_hours data.
  interface MealAvailability {
    openForBreakfast: boolean;
    openForLunch: boolean;
    openForDinner: boolean;
  }

  const inferMealAvailability = (opening_hours: any): MealAvailability => {

    let openForBreakfast = false;
    let openForLunch = false;
    let openForDinner = false;

    if (opening_hours.weekday_text && Array.isArray(opening_hours.weekday_text)) {
      const allDaysOpen24 = opening_hours.weekday_text.every((dayText: string) =>
        dayText.toLowerCase().includes("open 24 hours")
      );
      if (allDaysOpen24) {
        return {
          openForBreakfast: true,
          openForLunch: true,
          openForDinner: true,
        };
      }
    }

    if (opening_hours.periods && Array.isArray(opening_hours.periods)) {
      opening_hours.periods.forEach((period: any) => {
        if (period.open && period.open.time) {
          const openingHour = parseInt(period.open.time.substring(0, 2), 10);
          const closingHour = parseInt(period.close.time.substring(0, 2), 10);
          if (openingHour < 10) openForBreakfast = true;
          if (openingHour <= 12 && closingHour >= 14) openForLunch = true;
          if (openingHour <= 18 && closingHour >= 20) openForDinner = true;
        }
      });
    }
    return { openForBreakfast, openForLunch, openForDinner };
  };

  // Handles changes from the RestaurantName component.
  const handleChangeGooglePlace = (googlePlace: GooglePlace) => {
    const currentPlace: MrPlaceWithGooglePlace = { ...mrPlaceWithGooglePlace };
    currentPlace.googlePlace = googlePlace;
    currentPlace.googlePlaceId = googlePlace.googlePlaceId;

    if (currentPlace.placeType === PlaceType.Restaurant && googlePlace.opening_hours) {
      const { openForBreakfast, openForLunch, openForDinner } = inferMealAvailability(googlePlace.opening_hours);
      currentPlace.restaurantSpecs = {
        restaurantType: RestaurantType.Restaurant,
        openForBreakfast,
        openForLunch,
        openForDinner,
      };
    }

    setMrPlaceWithGooglePlace(prev => ({ ...prev, ...currentPlace }));
    setPlaceName(googlePlace.name!);
  };

  const handleChange = (field: keyof MrPlaceWithGooglePlace, value: any) => {
    setMrPlaceWithGooglePlace(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceTypeChange = (newType: PlaceType) => {
    setMrPlaceWithGooglePlace(prev => ({
      ...prev,
      placeType: newType,
      restaurantSpecs: newType === PlaceType.Restaurant
        ? {
          restaurantType: RestaurantType.Restaurant,
          openForBreakfast: false,
          openForLunch: false,
          openForDinner: false,
        }
        : undefined
    }));
  };

  const handleRestaurantFieldChange = (field: keyof MrRestaurant, value: any) => {
    setMrPlaceWithGooglePlace(prev => ({
      ...prev,
      restaurantSpecs: {
        ...prev.restaurantSpecs,
        [field]: value,
      },
    }));
  };

  const handleSubmitPlace = async (e: React.MouseEvent<HTMLButtonElement>) => {

    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch('/api/upsertMrPlace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mrPlaceWithGooglePlace),
      });
      const data = await response.json();
      const upsertedMrPlace: MrPlaceWithGooglePlace = data.place;
      mrPlaceWithGooglePlace._id = upsertedMrPlace._id; // Update local state with the returned ID
      console.log('Place submitted:', data);
      dispatch(addMrPlace(mrPlaceWithGooglePlace));
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting place:', error);
      setIsLoading(false);
    }
  };

  const getPlaceNameStyle = (): React.CSSProperties => {
    return editablePlace ?
      {
        marginBottom: '1rem',
        pointerEvents: 'none',
        opacity: 0.5,
      }
      : {
        marginBottom: '1rem',
      };
  }

  const renderPlaceName = () => (
    <div style={getPlaceNameStyle()}>
      <label htmlFor="place-name">{'Name:'}</label>
      <RestaurantName
        restaurantName={placeName}
        onSetRestaurantName={(name: string) => setPlaceName(name)}
        onSetGooglePlace={(googlePlace: GooglePlace) => handleChangeGooglePlace(googlePlace)}
      />
    </div>
  );

  const renderPlaceType = () => (
    <div style={{ marginBottom: '1rem' }}>
      <label>{'Type:'}</label>
      <Select
        labelId="place-type-select-label"
        value={mrPlaceWithGooglePlace.placeType}
        onChange={e => handlePlaceTypeChange(e.target.value as PlaceType)}
        fullWidth
      >
        <MenuItem value={PlaceType.Restaurant}>Restaurant</MenuItem>
        <MenuItem value={PlaceType.Accommodations}>Accommodations</MenuItem>
        <MenuItem value={PlaceType.Destination}>Other</MenuItem>
        <MenuItem value={PlaceType.GroceryStore}>Grocery Store</MenuItem>
      </Select>
    </div>
  );

  function renderRestaurantRating(): React.ReactNode {
    return (
      <div className="form-group">
        <PlaceRatingInput
          rating={mrPlaceWithGooglePlace.placeRating || null}
          onChange={(newRating) => {
            handleChange('placeRating', newRating);
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
      <label htmlFor="review-text">Review</label>
      <TextField
        id="review-text"
        fullWidth
        multiline
        rows={4}
        value={mrPlaceWithGooglePlace.placeReview || ''}
        onChange={(e) => handleChange('placeReview', e.target.value)}
      />
    </div>
  );

  const renderRestaurantType = () => {
    if (mrPlaceWithGooglePlace.placeType !== PlaceType.Restaurant) return null;
    return (
      <div style={{ marginBottom: '1rem' }}>
        <label>{'Restaurant Type:'}</label>
        <Select
          labelId="restaurant-type-select-label"
          value={mrPlaceWithGooglePlace.restaurantSpecs!.restaurantType}
          onChange={(e) => handleRestaurantFieldChange('restaurantType', e.target.value as RestaurantType)}
          fullWidth
        >
          <MenuItem value={RestaurantType.Restaurant}>Restaurant</MenuItem>
          <MenuItem value={RestaurantType.CoffeeShop}>Coffee</MenuItem>
          <MenuItem value={RestaurantType.Seafood}>Seafood</MenuItem>
          <MenuItem value={RestaurantType.PizzaPlace}>Pizza</MenuItem>
          <MenuItem value={RestaurantType.Bar}>Bar</MenuItem>
          <MenuItem value={RestaurantType.Bakery}>Bakery</MenuItem>
          <MenuItem value={RestaurantType.Taqueria}>Taqueria</MenuItem>
          <MenuItem value={RestaurantType.ItalianRestaurant}>Italian</MenuItem>
          <MenuItem value={RestaurantType.DessertShop}>Dessert</MenuItem>
        </Select>
      </div>
    );
  };

  const renderMealAvailability = () => {
    if (mrPlaceWithGooglePlace.placeType !== PlaceType.Restaurant) return null;
    return (
      <div style={{ marginBottom: '1rem' }}>
        <label>Meal Availability:</label>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!mrPlaceWithGooglePlace.restaurantSpecs!.openForBreakfast}
                onChange={(e) => handleRestaurantFieldChange('openForBreakfast', e.target.checked)}
              />
            }
            label="Breakfast"
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!mrPlaceWithGooglePlace.restaurantSpecs!.openForLunch}
                onChange={(e) => handleRestaurantFieldChange('openForLunch', e.target.checked)}
              />
            }
            label="Lunch"
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!mrPlaceWithGooglePlace.restaurantSpecs!.openForDinner}
                onChange={(e) => handleRestaurantFieldChange('openForDinner', e.target.checked)}
              />
            }
            label="Dinner"
          />
        </div>
      </div>
    );
  };

  const renderInterestLevel = (): JSX.Element => {
    return (
      <>
        <label>{'Interest Level:'}</label>
        <PlaceRatingInput
          rating={mrPlaceWithGooglePlace.interestLevel || null}
          onChange={(newRating) => {
            const updatedPlace: MrPlaceWithGooglePlace = mrPlaceWithGooglePlace;
            updatedPlace.interestLevel = newRating ? newRating : undefined; // Set to undefined if null
            setMrPlaceWithGooglePlace((prev) => ({ ...prev, place: updatedPlace }));
          }}
          legendLabels={["Interested", "Very Interested"]}
          colorBands={["#f44336", "#4caf50"]}
          rangeBands={[[1, 5], [6, 10]]}
        />
      </>
    )
  }

  const renderPlacePreview = (): JSX.Element => (
    <div className="form-group">
      <label htmlFor="review-text">Preview</label>
      <TextField
        id="preview-text"
        fullWidth
        multiline
        rows={4}
        value={mrPlaceWithGooglePlace.placePreview || ''}
        onChange={(e) => handleChange('placePreview', e.target.value)}
      />
    </div>
  );

  return (
    <div
      id="form"
      className="tab-panel active"
      style={{
        height: '92vh',           // fill the viewport height
        overflowY: 'auto',         // enable vertical scrolling
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <div id='MrPlace' style={containerStyle}>
        <h2>{_id ? 'Edit Place' : 'Add Place'}</h2>
        <form>
          {renderPlaceName()}
          {/* {renderPlaceType()} */}
          {renderRestaurantType()}
          {renderInterestLevel()}
          {renderPlacePreview()}
          {renderMealAvailability()}
          {renderRestaurantRating()}
          {renderPlaceReview()}
        </form>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <Button
            variant="contained"
            onClick={handleSubmitPlace}
            disabled={isLoading || !mrPlaceWithGooglePlace.googlePlace?.googlePlaceId}
          >
            {_id ? 'Save Changes' : 'Add Place'}
          </Button>
        </div>
        {isLoading && <PulsingDots />}
      </div>
    </div>
  );
};

export default MrPlaceForm;
