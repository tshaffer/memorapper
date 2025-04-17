import React, { useState } from 'react';
import { Button, MenuItem, Select, useMediaQuery, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import RestaurantName from './RestaurantName';
import PulsingDots from './PulsingDots';
import { Place, GooglePlace, SubmitPlaceRequestBody, RestaurantType, PlaceType } from "../types";

interface PlaceEditorProps {
  mode: 'create' | 'edit';
  initialPlace?: Place;
  onSubmit: (place: Place) => Promise<void>;
  onCancel?: () => void;
}

const PlaceEditor: React.FC<PlaceEditorProps> = ({ mode, initialPlace, onSubmit, onCancel }) => {
  const isMobile = useMediaQuery('(max-width:768px)');
  // If in create mode, get _id from URL params for new place, otherwise use the passed in place's _id.
  const { _id } = useParams<{ _id: string }>();

  // When creating, initialize an empty/default Place.
  const defaultPlace: Place =
    mode === 'create'
      ? {
        _idPlace: _id,
        placeId: uuidv4(),
        visited: false,
        placeType: PlaceType.Restaurant,
        restaurantType: RestaurantType.Restaurant,
        openForBreakfast: undefined,
        openForLunch: undefined,
        openForDinner: undefined,
        name: '',
        formatted_address: '',
        rating: 0,
        // Optionally add other fields like address_components, geometry, etc.
      }
      : (initialPlace as Place);

  const [place, setPlace] = useState<Place>(defaultPlace);
  const [placeName, setPlaceName] = useState(place.name || '');
  const [isLoading, setIsLoading] = useState(false);

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
    const currentPlace: SubmitPlaceRequestBody = { ...place };
    currentPlace.address_components = googlePlace.address_components;
    currentPlace.formatted_address = googlePlace.formatted_address;
    currentPlace.geometry = googlePlace.geometry;
    currentPlace.name = googlePlace.name;
    currentPlace.opening_hours = googlePlace.opening_hours;
    currentPlace.googlePlaceId = googlePlace.googlePlaceId;
    currentPlace.price_level = googlePlace.price_level;
    currentPlace.rating = googlePlace.rating;
    currentPlace.user_ratings_total = googlePlace.user_ratings_total;
    currentPlace.utc_offset_minutes = googlePlace.utc_offset_minutes;
    currentPlace.restaurantType = googlePlace.restaurantType;
    currentPlace.vicinity = googlePlace.vicinity;
    currentPlace.website = googlePlace.website;

    if (currentPlace.placeType === PlaceType.Restaurant && googlePlace.opening_hours) {
      const { openForBreakfast, openForLunch, openForDinner } = inferMealAvailability(googlePlace.opening_hours);
      currentPlace.openForBreakfast = openForBreakfast;
      currentPlace.openForLunch = openForLunch;
      currentPlace.openForDinner = openForDinner;
    }

    setPlace(prev => ({ ...prev, ...currentPlace }));
    setPlaceName(googlePlace.name);
  };

  // General handler for updating a field.
  const handleChange = (field: keyof Place, value: any) => {
    setPlace(prev => ({ ...prev, [field]: value }));
  };

  // Submit the form.
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(place);
      setIsLoading(false);
    } catch (error) {
      console.error('Error during submit:', error);
      setIsLoading(false);
    }
  };

  // Container styling varies by mode.
  const containerStyle: React.CSSProperties =
    mode === 'create'
      ? {
        width: '100%', // fill the entire width
        padding: '1rem',
        boxSizing: 'border-box', // ensures padding doesn't overflow
      }
      : {
        maxWidth: '400px',
        margin: '1rem',
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
      };

  // Render functions for various fields.
  const renderPlaceName = () => (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="place-name">{'Place Name:'}</label>
      <RestaurantName
        restaurantName={placeName}
        onSetRestaurantName={(name: string) => setPlaceName(name)}
        onSetGooglePlace={(googlePlace: GooglePlace) => handleChangeGooglePlace(googlePlace)}
      />
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
        value={place.placeComments || ''}
        onChange={(e) => handleChange('placeComments', e.target.value)}
      />
    </div>
  );

  const renderPlaceVisited = () => (
    <div style={{ marginBottom: '1rem' }}>
      <label>{'Visited:'}</label>
      <Checkbox
        checked={place.visited}
        onChange={(e) => handleChange('visited', e.target.checked)}
      />
    </div>
  );

  const renderPlaceType = () => (
    <div style={{ marginBottom: '1rem' }}>
      <label>{'Place Type:'}</label>
      <Select
        labelId="place-type-select-label"
        value={place.placeType}
        onChange={(e) => handleChange('placeType', e.target.value as PlaceType)}
        fullWidth
      >
        <MenuItem value={PlaceType.Restaurant}>Restaurant</MenuItem>
        <MenuItem value={PlaceType.Destination}>Other</MenuItem>
        <MenuItem value={PlaceType.GroceryStore}>Grocery Store</MenuItem>
      </Select>
    </div>
  );

  const renderRestaurantType = () => {
    if (place.placeType !== PlaceType.Restaurant) return null;
    return (
      <div style={{ marginBottom: '1rem' }}>
        <label>{'Restaurant Type:'}</label>
        <Select
          labelId="restaurant-type-select-label"
          value={place.restaurantType}
          onChange={(e) => handleChange('restaurantType', e.target.value as RestaurantType)}
          fullWidth
        >
          <MenuItem value={RestaurantType.Restaurant}>Restaurant</MenuItem>
          <MenuItem value={RestaurantType.CoffeeShop}>Coffee Shop</MenuItem>
          <MenuItem value={RestaurantType.Bar}>Bar</MenuItem>
          <MenuItem value={RestaurantType.Bakery}>Bakery</MenuItem>
          <MenuItem value={RestaurantType.Taqueria}>Taqueria</MenuItem>
          <MenuItem value={RestaurantType.PizzaPlace}>Pizza</MenuItem>
          <MenuItem value={RestaurantType.ItalianRestaurant}>Italian</MenuItem>
          <MenuItem value={RestaurantType.DessertShop}>Dessert</MenuItem>
        </Select>
      </div>
    );
  };

  const renderMealAvailability = () => {
    if (place.placeType !== PlaceType.Restaurant) return null;
    return (
      <div style={{ marginBottom: '1rem' }}>
        <label>Meal Availability:</label>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!place.openForBreakfast}
                onChange={(e) => handleChange('openForBreakfast', e.target.checked)}
              />
            }
            label="Breakfast"
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!place.openForLunch}
                onChange={(e) => handleChange('openForLunch', e.target.checked)}
              />
            }
            label="Lunch"
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!place.openForDinner}
                onChange={(e) => handleChange('openForDinner', e.target.checked)}
              />
            }
            label="Dinner"
          />
        </div>
      </div>
    );
  };

  return (
    <div id='PlaceEditor' style={containerStyle}>
      <h2>{mode === 'create' ? 'Add Place' : 'Edit Place'}</h2>
      <form>
        {renderPlaceName()}
        {renderPlaceComments()}
        {renderPlaceVisited()}
        {renderPlaceType()}
        {renderRestaurantType()}
        {renderMealAvailability()}
      </form>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <Button variant="contained" onClick={handleSubmit} disabled={isLoading || !place.googlePlaceId}>
          {mode === 'create' ? 'Add Place' : 'Save Changes'}
        </Button>
        {mode === 'edit' && onCancel && (
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      {isLoading && <PulsingDots />}
    </div>
  );
};

export default PlaceEditor;
