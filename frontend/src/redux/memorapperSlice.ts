import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Distance,
  Filters,
  RestaurantOpen,
  Settings,
  GooglePlace,
  MrPlace,
  MrRestaurantReview,
  MrReviewData,
  MrRestaurant,
  VisitedStatus
} from '../types';

interface MemorapperState {
  googlePlacesById: Record<string, GooglePlace>;
  mrPlacesById: Record<string, MrPlace>;
  mrPlaceIds: string[];
  currentMapLocation: google.maps.LatLngLiteral | null;
  settings: Settings;
  loading: boolean;
  error: string | null;
}

interface UpdateReviewPayload {
  placeId: string;
  updatedReview: MrRestaurantReview; // must include `_id`
}

interface DeleteReviewPayload {
  placeId: string;
  reviewId: string;
}

const initialState: MemorapperState = {
  googlePlacesById: {},
  mrPlacesById: {},
  mrPlaceIds: [],
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
      visitedStatus: VisitedStatus.VisitedAndUnvisited,
    },
  },
  currentMapLocation: null,
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

const restaurantSpecsChanged = (a: MrRestaurant, b: MrRestaurant): boolean => {
  return (
    a.restaurantType !== b.restaurantType ||
    a.openForBreakfast !== b.openForBreakfast ||
    a.openForLunch !== b.openForLunch ||
    a.openForDinner !== b.openForDinner
  );
};

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
    setCurrentMapLocation(state, action: PayloadAction<google.maps.LatLngLiteral | null>) {
      state.currentMapLocation = action.payload;
    },
    setGooglePlaces(state, action: PayloadAction<GooglePlace[]>) {
      const map: Record<string, GooglePlace> = {};
      for (const place of action.payload) {
        map[place.googlePlaceId] = place;
      }
      state.googlePlacesById = map;
    },
    setMrPlaces(state, action: PayloadAction<MrPlace[]>) {
      const map: Record<string, MrPlace> = {};
      const ids: string[] = [];

      for (const place of action.payload) {
        if (place._id) {
          map[place._id] = place;
          ids.push(place._id);
        }
      }

      state.mrPlacesById = map;
      state.mrPlaceIds = ids;
    },
    addMrPlace(state, action: PayloadAction<MrPlace>) {
      const place = action.payload;
      if (!place._id) return;
      state.mrPlacesById[place._id] = place;
      if (!state.mrPlaceIds.includes(place._id)) {
        state.mrPlaceIds.push(place._id);
      }
    },
    deleteMrPlace(state, action: PayloadAction<string>) {
      const placeId = action.payload;

      // Get the MrPlace before deleting it to retrieve its googlePlaceId
      const placeToDelete = state.mrPlacesById[placeId];
      if (!placeToDelete) return;

      const { googlePlaceId } = placeToDelete;

      // Remove from mrPlacesById
      delete state.mrPlacesById[placeId];

      // Remove from mrPlaceIds
      state.mrPlaceIds = state.mrPlaceIds.filter(id => id !== placeId);

      // Remove from googlePlacesById if matching googlePlaceId exists
      if (state.googlePlacesById[googlePlaceId]) {
        delete state.googlePlacesById[googlePlaceId];
      }
    },
    addMrRestaurantReview(state, action: PayloadAction<MrReviewData>) {
      const { place, dateOfVisit, itemReviews } = action.payload;

      if (!place || !place._id) {
        console.warn('addMrRestaurantReview called without a valid place. Ignoring.');
        return;
      }

      const target = state.mrPlacesById[place._id];
      if (!target) {
        console.warn(`Place not found for _id: ${place._id}`);
        return;
      }

      const newReview: MrRestaurantReview = { dateOfVisit, itemReviews };
      target.restaurantReviews.push(newReview);

      const { placeType, interestLevel, placePreview, placeReview, placeRating, restaurantSpecs } = place;

      if (placeType !== undefined) target.placeType = placeType;
      if (interestLevel !== undefined) target.interestLevel = interestLevel;
      if (placePreview !== undefined) target.placePreview = placePreview;
      if (placeReview !== undefined) target.placeReview = placeReview;
      if (placeRating !== undefined) target.placeRating = placeRating;

      if (restaurantSpecs && restaurantSpecsChanged(restaurantSpecs, target.restaurantSpecs)) {
        target.restaurantSpecs = { ...restaurantSpecs };
      }
    },
    updateMrRestaurantReview: (state, action: PayloadAction<MrReviewData>) => {
      const { place, _id, dateOfVisit, itemReviews } = action.payload;

      if (!place || !place._id) {
        console.warn('updateMrRestaurantReview called without a valid place. Ignoring.');
        return;
      }

      const target = state.mrPlacesById[place._id];
      if (!target) {
        console.warn(`Place not found for _id: ${place._id}`);
        return;
      }

      const updatedReview: MrRestaurantReview = { _id, dateOfVisit, itemReviews };

      const index = target.restaurantReviews.findIndex(r => r._id === updatedReview._id);
      if (index !== -1) {
        target.restaurantReviews[index] = updatedReview; // ✅ This is mutable, part of the draft
      }
    },
    deleteMrRestaurantReview: (state, action: PayloadAction<DeleteReviewPayload>) => {
      const { placeId, reviewId } = action.payload;
      const place = state.mrPlacesById[placeId];
      if (place) {
        place.restaurantReviews = place.restaurantReviews.filter(
          (review) => review._id !== reviewId
        );
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
        const map: Record<string, GooglePlace> = {};
        for (const place of action.payload) {
          map[place.googlePlaceId] = place;
        }
        state.googlePlacesById = map;
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
        const map: Record<string, MrPlace> = {};
        const ids: string[] = [];

        for (const place of action.payload) {
          if (place._id) {
            map[place._id] = place;
            ids.push(place._id);
          }
        }

        state.mrPlacesById = map;
        state.mrPlaceIds = ids;
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
  setCurrentMapLocation,
  setGooglePlaces,
  setMrPlaces,
  addMrPlace,
  addMrRestaurantReview,
  deleteMrPlace,
  updateMrRestaurantReview,
  deleteMrRestaurantReview,
} = memorapperSlice.actions;

export default memorapperSlice.reducer;
