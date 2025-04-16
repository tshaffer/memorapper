import { useState } from 'react';
import '../../styles/multiPanelStyles.css';
import { Button, MenuItem, Select, useMediaQuery, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { Place, GooglePlace, SubmitPlaceRequestBody, RestaurantType, PlaceType, UserComment } from "../../types";
import RestaurantName from '../../components/RestaurantName';
import PulsingDots from '../../components/PulsingDots';
import { useParams } from 'react-router-dom';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import PlaceEditor from '../../components/PlaceEditor';

const PlaceForm = () => {

  const { _id } = useParams<{ _id: string }>();
  console.log('NewPlaceForm _id:', _id);

  const [placeName, setPlaceName] = React.useState('');

  const initialPlaceData: Place = {
    _idPlace: _id,
    placeId: uuidv4(),
    visited: false,
    placeType: PlaceType.Restaurant,
    restaurantType: RestaurantType.Restaurant,
    // Optional meal availability fields for restaurants:
    openForBreakfast: undefined,
    openForLunch: undefined,
    openForDinner: undefined,
  };

  const [place, setPlace] = useState<Place>(initialPlaceData);

  const isMobile = useMediaQuery('(max-width:768px)');
  const [isLoading, setIsLoading] = useState(false);

  interface MealAvailability {
    openForBreakfast: boolean;
    openForLunch: boolean;
    openForDinner: boolean;
  }

  const inferMealAvailability = (opening_hours: any): MealAvailability => {
    let openForBreakfast = false;
    let openForLunch = false;
    let openForDinner = false;

    // 1. Check if the place is "Open 24 hours" (for every day listed).
    //    If so, we're done: it's open for all meal times.
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

    // 2. Otherwise, fall back to the existing "periods" logic (if it exists).
    //    This block remains largely the same as your original, except you'll
    //    want to ensure that period.open.time and period.close.time are
    //    valid or handle the possibility of 24-hour in "periods" as well.
    if (opening_hours.periods && Array.isArray(opening_hours.periods)) {
      opening_hours.periods.forEach((period: any) => {
        if (period.open && period.open.time) {
          // Extract the hour from the "HHmm" string (e.g., "0830" → 8).
          const hour = parseInt(period.open.time.substring(0, 2), 10);

          // Simple inference logic:
          // - If opening time is before 10:00 => available for breakfast.
          // - If opening time is between 10:00 and 14:00 => available for lunch.
          // - If opening time is 14:00 or later => available for dinner.
          if (hour < 10) {
            openForBreakfast = true;
          }
          if (hour >= 10 && hour < 14) {
            openForLunch = true;
          }
          if (hour >= 14) {
            openForDinner = true;
          }
        }
      });
    }

    return {
      openForBreakfast,
      openForLunch,
      openForDinner,
    };
  };

  const handleChangeGooglePlace = (googlePlace: GooglePlace) => {
    // Copy current place data into a temporary variable.
    const currentPlace: SubmitPlaceRequestBody = { ...place };
    // Update google place details.
    currentPlace.address_components = googlePlace.address_components;
    currentPlace.formatted_address = googlePlace.formatted_address;
    currentPlace.geometry = googlePlace.geometry;
    currentPlace.name = googlePlace.name;
    currentPlace.opening_hours = googlePlace.opening_hours;
    currentPlace.googlePlaceId = googlePlace.googlePlaceId;
    currentPlace.price_level = googlePlace.price_level;
    currentPlace.vicinity = googlePlace.vicinity;
    currentPlace.website = googlePlace.website;

    // If the place is a restaurant and opening_hours exists, infer the meal availabilities.
    if (currentPlace.placeType === PlaceType.Restaurant && googlePlace.opening_hours) {
      const { openForBreakfast, openForLunch, openForDinner } = inferMealAvailability(googlePlace.opening_hours);
      currentPlace.openForBreakfast = openForBreakfast;
      currentPlace.openForLunch = openForLunch;
      currentPlace.openForDinner = openForDinner;
    }

    setPlace((prev) => ({ ...prev, ...currentPlace }));
    setPlaceName(googlePlace.name);
    console.log('place:', { ...place, ...currentPlace });
  };

  const handleChange = (field: keyof Place, value: any) => {
    setPlace((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPlace = async (newPlace: Place): Promise<void> => {

    setIsLoading(true);

    try {
      const response = await fetch('/api/submitPlace', {
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

  return (
    <div
      id="form"
      className="tab-panel active"
      style={{
        maxHeight: isMobile ? 'calc(60vh)' : 'auto',
        padding: '1rem',
      }}
    >
      <PlaceEditor
        mode={'create'}
        onSubmit={ (place: Place) => {
          return handleAddPlace(place);
        }}
        onCancel={function () {
          console.log('Add place cancelled.');
        }}
      >
      </PlaceEditor>
    </div>
  );
};

export default PlaceForm;
