import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Distance, Filters, RestaurantOpen, Settings, GooglePlace, MrPlace, MrPlaceWithGooglePlace, PlaceType, MrReviewData, RestaurantType } from '../types';

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
        console.log('Adding new place with Google Place:', state.mrPlacesWithGooglePlaces);
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
      const { place, dateOfVisit, itemReviews, placeComments } = action.payload;

      if (!place) {
        console.warn('addMrRestaurantReview called without a place. Ignoring.');
        return;
      }

      const targetPlace = state.mrPlaces.find((p) => p.placeId === place.placeId);
      if (!targetPlace) {
        console.warn(`Place not found for placeId: ${place.placeId}`);
        return;
      }

      const newReview = {
        dateOfVisit,
        itemReviews,
      };

      targetPlace.placeComments = placeComments || targetPlace.placeComments;
      targetPlace.restaurantReviews.push(newReview);
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