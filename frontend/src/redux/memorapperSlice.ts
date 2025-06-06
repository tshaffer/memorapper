import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Distance, Filters, RestaurantOpen, Settings, GooglePlace, MrPlace, MrPlaceWithGooglePlace, PlaceType, MrReviewData, RestaurantType, MrRestaurantReview, MrRestaurant } from '../types';

interface MemorapperState {
  googlePlaces: GooglePlace[];
  mrPlaces: MrPlace[];
  mrPlacesWithGooglePlaces: MrPlaceWithGooglePlace[];
  settings: Settings;
  loading: boolean;
  error: string | null;
}

const initialState: MemorapperState = {
  googlePlaces: [],
  mrPlaces: [],
  mrPlacesWithGooglePlaces: [],
  settings: {
    filters: {
      distanceAway: Distance.AnyDistance,
      restaurantOpen: RestaurantOpen.OpenAnyTime,
      placeTypes: [],
      restaurantTypes: [],
      openMeals: {
        Breakfast: false,
        Lunch: false,
        Dinner: false,
      },
    },
  },
  loading: true,
  error: null,
};

export const fetchGooglePlaces = createAsyncThunk('user/fetchGooglePlaces', async () => {
  const response = await fetch('/api/googlePlaces');
  const data = await response.json();
  return data.googlePlaces as GooglePlace[];
});

export const fetchMrPlaces = createAsyncThunk('user/fetchMrPlaces', async () => {
  const response = await fetch('/api/mrPlaces');
  const data = await response.json();
  return data.places as MrPlace[];
});

const restaurantSpecsChanged = (restaurantSpecs: MrRestaurant, targetPlaceRestaurantSpecs: MrRestaurant): boolean => {
  return (
    restaurantSpecs.restaurantType !== targetPlaceRestaurantSpecs.restaurantType ||
    restaurantSpecs.openForBreakfast !== targetPlaceRestaurantSpecs.openForBreakfast ||
    restaurantSpecs.openForLunch !== targetPlaceRestaurantSpecs.openForLunch ||
    restaurantSpecs.openForDinner !== targetPlaceRestaurantSpecs.openForDinner
  );
}

const memorapperSlice = createSlice({
  name: 'memorapper',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Filters>) {
      state.settings.filters = action.payload;
    },
    setSettings(state, action: PayloadAction<Settings>) {
      state.settings = action.payload;
    },
    setMrPlacesWithGooglePlaces(state, action: PayloadAction<MrPlaceWithGooglePlace[]>) {
      state.mrPlacesWithGooglePlaces = action.payload;
    },
    addMrPlaceWithGooglePlace(state, action: PayloadAction<MrPlaceWithGooglePlace>) {
      const incoming = action.payload;
      if (!incoming._id) {
        state.mrPlacesWithGooglePlaces.push(incoming);
      } else {
        // If _id is defined, replace existing entry
        const index = state.mrPlacesWithGooglePlaces.findIndex(
          (place) => place._id === incoming._id
        );
        if (index !== -1) {
          // Replace the existing entry
          state.mrPlacesWithGooglePlaces[index] = incoming;
        } else {
          // No match found, add it as new
          state.mrPlacesWithGooglePlaces.push(incoming);
        }
        console.log('Updated place with Google Place:', state.mrPlacesWithGooglePlaces);
      }
    },
    addMrRestaurantReview(state, action: PayloadAction<MrReviewData>) {
      const { place, dateOfVisit, itemReviews } = action.payload;

      if (!place) {
        console.warn('addMrRestaurantReview called without a place. Ignoring.');
        return;
      }

      const targetPlace: MrPlace | undefined = state.mrPlaces.find((p) => p._id === place._id);
      if (!targetPlace) {
        console.warn(`Place not found for _id: ${place._id}`);
        return;
      }

      const newReview: MrRestaurantReview = {
        dateOfVisit,
        itemReviews,
      };

      targetPlace.restaurantReviews.push(newReview);

      // determine if other targetPlace properties need to be updated
      const { placeType, interestRating, placePreview, placeReview, placeRating, restaurantSpecs } = action.payload.place!;
      if ((targetPlace.placeType !== placeType) && placeType) {
        targetPlace.placeType = placeType;
      }
      if ((targetPlace.interestRating !== interestRating) && interestRating) {
        targetPlace.interestRating = interestRating;
      }
      if ((targetPlace.placePreview !== placePreview) && placePreview) {
        targetPlace.placePreview = placePreview;
      }
      if ((targetPlace.placeReview !== placeReview) && placeReview) {
        targetPlace.placeReview = placeReview;
      }
      if ((targetPlace.placeRating !== placeRating) && placeRating) {
        targetPlace.placeRating = placeRating;
      }
      if (restaurantSpecsChanged(restaurantSpecs, targetPlace.restaurantSpecs)) {
        targetPlace.restaurantSpecs = {
          restaurantType: restaurantSpecs.restaurantType,
          openForBreakfast: restaurantSpecs.openForBreakfast,
          openForLunch: restaurantSpecs.openForLunch,
          openForDinner: restaurantSpecs.openForDinner,
        };
      }
    
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGooglePlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGooglePlaces.fulfilled, (state, action) => {
        state.googlePlaces = action.payload;
        state.loading = false;
      })
      .addCase(fetchGooglePlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch googlePlaces';
      })
      .addCase(fetchMrPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMrPlaces.fulfilled, (state, action) => {
        state.mrPlaces = action.payload;
        state.loading = false;
      })
      .addCase(fetchMrPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch places';
      });
  },
});

export const {
  setFilters,
  setSettings,
  setMrPlacesWithGooglePlaces,
  addMrPlaceWithGooglePlace,
  addMrRestaurantReview,
} = memorapperSlice.actions;

export default memorapperSlice.reducer;