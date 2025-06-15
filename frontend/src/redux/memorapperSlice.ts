// memorapperSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Distance,
  Filters,
  RestaurantOpen,
  Settings,
  MrPlaceWithGooglePlace,
  MrRestaurantReview,
  MrReviewData,
  MrRestaurant,
  VisitedStatus,
} from '../types';

interface MemorapperState {
  mrPlacesById: Record<string, MrPlaceWithGooglePlace>;
  mrPlaceIds: string[];
  currentMapLocation: google.maps.LatLngLiteral | null;
  settings: Settings;
  loading: boolean;
  error: string | null;
}

interface DeleteReviewPayload {
  placeId: string;
  reviewId: string;
}

const initialState: MemorapperState = {
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

export const fetchMrPlacesWithGooglePlace = createAsyncThunk('user/fetchMrPlacesWithGooglePlace', async () => {
  const response = await fetch('/api/mrPlacesWithGooglePlace');
  const data = await response.json();
  return data.places as MrPlaceWithGooglePlace[];
});

const restaurantSpecsChanged = (a?: MrRestaurant, b?: MrRestaurant): boolean => {
  if (!a || !b) return false;
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
    setMrPlaces(state, action: PayloadAction<MrPlaceWithGooglePlace[]>) {
      const map: Record<string, MrPlaceWithGooglePlace> = {};
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
    addMrPlace(state, action: PayloadAction<MrPlaceWithGooglePlace>) {
      const place = action.payload;
      if (!place._id) return;
      state.mrPlacesById[place._id] = place;
      if (!state.mrPlaceIds.includes(place._id)) {
        state.mrPlaceIds.push(place._id);
      }
    },
    deleteMrPlace(state, action: PayloadAction<string>) {
      const placeId = action.payload;
      delete state.mrPlacesById[placeId];
      state.mrPlaceIds = state.mrPlaceIds.filter(id => id !== placeId);
    },
    addMrRestaurantReview(state, action: PayloadAction<MrReviewData>) {
      const { place, dateOfVisit, itemReviews } = action.payload;
      if (!place || !place._id) return;

      const target = state.mrPlacesById[place._id];
      if (!target) return;

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
    updateMrRestaurantReview(state, action: PayloadAction<MrReviewData>) {
      const { place, _id, dateOfVisit, itemReviews } = action.payload;
      if (!place || !place._id) return;

      const target = state.mrPlacesById[place._id];
      if (!target) return;

      const updatedReview: MrRestaurantReview = { _id, dateOfVisit, itemReviews };
      const index = target.restaurantReviews.findIndex(r => r._id === updatedReview._id);
      if (index !== -1) {
        target.restaurantReviews[index] = updatedReview;
      }
    },
    deleteMrRestaurantReview(state, action: PayloadAction<DeleteReviewPayload>) {
      const { placeId, reviewId } = action.payload;
      const place = state.mrPlacesById[placeId];
      if (place) {
        place.restaurantReviews = place.restaurantReviews.filter(r => String(r._id) !== String(reviewId));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMrPlacesWithGooglePlace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMrPlacesWithGooglePlace.fulfilled, (state, action) => {
        const map: Record<string, MrPlaceWithGooglePlace> = {};
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
      .addCase(fetchMrPlacesWithGooglePlace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch places';
      });
  },
});

export const {
  setFilters,
  setSettings,
  setCurrentMapLocation,
  setMrPlaces,
  addMrPlace,
  deleteMrPlace,
  addMrRestaurantReview,
  updateMrRestaurantReview,
  deleteMrRestaurantReview,
} = memorapperSlice.actions;

export default memorapperSlice.reducer;
