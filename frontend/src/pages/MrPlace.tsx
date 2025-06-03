import { useEffect, useState } from 'react';
import '../styles/multiPanelStyles.css';
import { useMediaQuery } from "@mui/material";
import { useLocation, useParams } from 'react-router-dom';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlaceType, MrPlace, MrPlaceWithGooglePlace, EditablePlace } from '../types';
import { useDispatch } from 'react-redux';
import { addMrPlaceWithGooglePlace } from '../redux/memorapperSlice';
import { Button, MenuItem, Select, Checkbox, FormControlLabel, TextField, Rating } from "@mui/material";
import { GooglePlace, MrSubmitPlaceRequestBody, RestaurantType, Restaurant, MrRestaurant } from "../types";
import RestaurantName from '../components/RestaurantName';
import PulsingDots from '../components/PulsingDots';

const MrPlaceForm = () => {

  const dispatch = useDispatch();

  const { _id } = useParams<{ _id: string }>();
  console.log('NewPlaceForm _id:', _id);

  const [placeName, setPlaceName] = React.useState('');

  const location = useLocation();

  const editablePlace = location.state as MrPlaceWithGooglePlace | null;
  const placeId = editablePlace?.placeId || uuidv4();
  const googlePlace: GooglePlace | undefined = editablePlace?.googlePlace;
  const googlePlaceId = googlePlace?.googlePlaceId || '';
  const placeType = editablePlace?.placeType || PlaceType.Restaurant;
  const placeComments = editablePlace?.placeComments ?? '';
  const restaurantReviews = editablePlace?.restaurantReviews || [];
  const restaurantSpecs = editablePlace?.restaurantSpecs || {} as MrRestaurant;

  useEffect(() => {
    if (googlePlace?.name) {
      setPlaceName(googlePlace.name);
    }
  }, [googlePlace]);

  const initialPlaceData: MrPlace = {
    _idPlace: _id,
    placeId,
    googlePlaceId,
    placeType,
    placeComments,
    restaurantReviews,
    restaurantSpecs,
  };

  const [mrPlace, setMrPlace] = useState<MrPlaceWithGooglePlace>(initialPlaceData);

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
          const hour = parseInt(period.open.time.substring(0, 2), 10);
          if (hour < 10) openForBreakfast = true;
          if (hour >= 10 && hour < 14) openForLunch = true;
          if (hour >= 14) openForDinner = true;
        }
      });
    }
    return { openForBreakfast, openForLunch, openForDinner };
  };

  // Handles changes from the RestaurantName component.
  const handleChangeGooglePlace = (googlePlace: GooglePlace) => {
    const currentPlace: MrSubmitPlaceRequestBody = { ...mrPlace };
    currentPlace.googlePlace = googlePlace;

    if (currentPlace.placeType === PlaceType.Restaurant && googlePlace.opening_hours) {
      const { openForBreakfast, openForLunch, openForDinner } = inferMealAvailability(googlePlace.opening_hours);
      currentPlace.restaurantSpecs = {
        restaurantType: RestaurantType.Restaurant,
        openForBreakfast,
        openForLunch,
        openForDinner,
      };
    }

    setMrPlace(prev => ({ ...prev, ...currentPlace }));
    setPlaceName(googlePlace.name!);
  };

  const handleChange = (field: keyof MrPlace, value: any) => {
    setMrPlace(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceTypeChange = (newType: PlaceType) => {
    setMrPlace(prev => ({
      ...prev,
      placeType: newType,
      // only give it a restaurant payload if it's actually a Restaurant
      restaurant: newType === PlaceType.Restaurant
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
    setMrPlace(prev => ({
      ...prev,
      restaurant: {
        ...prev.restaurantSpecs,
        [field]: value,
      },
    }));
  };

  const handleAddPlace = async (newPlace: MrPlaceWithGooglePlace): Promise<void> => {

    setIsLoading(true);

    dispatch(addMrPlaceWithGooglePlace(newPlace));

    try {
      console.log('handleAddPlace:', newPlace);
      const response = await fetch('/api/submitMrPlace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPlace,
        }),
      });
      const data = await response.json();
      console.log('Place submitted:', data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting place:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // setIsLoading(true);
    // try {
    //   mrPlace.googlePlaceId = mrPlace.googlePlace?.googlePlaceId || '';
    //   await onSubmit(mrPlace);
    //   setIsLoading(false);
    // } catch (error) {
    //   console.error('Error during submit:', error);
    //   setIsLoading(false);
    // }
  };

  const renderPlaceName = () => (
    <div style={{ marginBottom: '1rem' }}>
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
        value={mrPlace.placeType}
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

  const renderPlaceComments = () => (
    <div style={{ marginBottom: '1rem' }}>
      <label>{'Comments:'}</label>
      <TextField
        label={'Comments'}
        fullWidth
        multiline
        rows={4}
        value={mrPlace.placeComments || ''}
        onChange={(e) => handleChange('placeComments', e.target.value)}
      />
    </div>
  );

  const renderRestaurantType = () => {
    if (mrPlace.placeType !== PlaceType.Restaurant) return null;
    return (
      <div style={{ marginBottom: '1rem' }}>
        <label>{'Restaurant Type:'}</label>
        <Select
          labelId="restaurant-type-select-label"
          value={mrPlace.restaurantSpecs!.restaurantType}
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
    if (mrPlace.placeType !== PlaceType.Restaurant) return null;
    return (
      <div style={{ marginBottom: '1rem' }}>
        <label>Meal Availability:</label>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!mrPlace.restaurantSpecs!.openForBreakfast}
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
                checked={!!mrPlace.restaurantSpecs!.openForLunch}
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
                checked={!!mrPlace.restaurantSpecs!.openForDinner}
                onChange={(e) => handleRestaurantFieldChange('openForDinner', e.target.checked)}
              />
            }
            label="Dinner"
          />
        </div>
      </div>
    );
  };

  const renderDesirabilityRating = (): JSX.Element => {
    return (
      <div>
        <label htmlFor={`rating-${mrPlace.placeRating}`}>Rating</label>
        <Rating
          id={`rating-${mrPlace.placeId}`}
          name={`rating-${mrPlace.placeId}`}
          value={mrPlace.placeRating}
          max={5}
          onChange={(event, newValue) =>
            handleChange('placeRating', newValue || 0)
          }
        />
      </div>
    );
  }

  return (
    <div
      id="form"
      className="tab-panel active"
      style={{
        maxHeight: isMobile ? 'calc(60vh)' : 'auto',
        padding: '1rem',
      }}
    >
      <div id='MrPlace' style={containerStyle}>
        <h2>Add Place</h2>
        <form>
          {renderPlaceName()}
          {renderPlaceType()}
          {renderRestaurantType()}
          {renderMealAvailability()}
          {renderDesirabilityRating()}
          {renderPlaceComments()}
        </form>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading || !mrPlace.googlePlace?.googlePlaceId}
          >
            Add Place
          </Button>
        </div>
        {isLoading && <PulsingDots />}
      </div>
    </div>
  );
};

export default MrPlaceForm;
