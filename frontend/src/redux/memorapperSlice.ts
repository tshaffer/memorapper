import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Distance, Filters, RestaurantOpen, Place, PlaceWithGooglePlace, Settings, GooglePlace, MrPlace, MrPlaceWithGooglePlace, PlaceType, MrReviewData, RestaurantType } from '../types';

interface MemorapperState {
  googlePlaces: GooglePlace[];
  places: Place[];
  placesWithGooglePlaces: PlaceWithGooglePlace[];
  mrPlaces: MrPlace[];
  mrPlacesWithGooglePlaces: MrPlaceWithGooglePlace[];
  settings: Settings;
  loading: boolean;
  error: string | null;
}

const initialState: MemorapperState = {
  googlePlaces: [],
  places: [],
  placesWithGooglePlaces: [],
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

export const fetchPlaces = createAsyncThunk('user/fetchPlaces', async () => {
  const response = await fetch('/api/places');
  const data = await response.json();
  return data.places as Place[];
});

export const fetchMrPlaces = createAsyncThunk('user/fetchMrPlaces', async () => {
  const response = await fetch('/api/places');
  const data = await response.json();
  const places: Place[] = data.places as Place[];
  const mrPlaces: MrPlace[] = places.map(place => ({
    _idPlace: place._idPlace,
    placeId: place.placeId,
    googlePlaceId: place.googlePlaceId,
    placeType: place.placeType || PlaceType.Restaurant,
    placeComments: place.placeComments || '',
    restaurantReviews: [],
    restaurantSpecs: {
      restaurantType: place.restaurant?.restaurantType || RestaurantType.Restaurant,
      openForBreakfast: place.restaurant?.openForBreakfast || false,
      openForLunch: place.restaurant?.openForLunch || false,
      openForDinner: place.restaurant?.openForDinner || false,
    },
  }));

  return mrPlaces as MrPlace[];
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
    setPlacesWithGooglePlaces(state, action: PayloadAction<PlaceWithGooglePlace[]>) {
      state.placesWithGooglePlaces = action.payload;
    },
    setMrPlacesWithGooglePlaces(state, action: PayloadAction<MrPlaceWithGooglePlace[]>) {
      state.mrPlacesWithGooglePlaces = action.payload;
    },
    addMrPlaceWithGooglePlace(state, action: PayloadAction<MrPlaceWithGooglePlace>) {
      state.mrPlacesWithGooglePlaces.push(action.payload);
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
      .addCase(fetchPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaces.fulfilled, (state, action) => {
        state.places = action.payload;
        state.mrPlaces = state.places.map(place => ({
          _idPlace: place._idPlace,
          placeId: place.placeId,
          googlePlaceId: place.googlePlaceId,
          placeType: place.placeType || PlaceType.Restaurant,
          placeComments: place.placeComments || '',
          restaurantReviews: [],
          restaurantSpecs: {
            restaurantType: place.restaurant?.restaurantType || RestaurantType.Restaurant,
            openForBreakfast: place.restaurant?.openForBreakfast || false,
            openForLunch: place.restaurant?.openForLunch || false,
            openForDinner: place.restaurant?.openForDinner || false,
          },
        }));
        state.loading = false;
      })
      .addCase(fetchPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch places';
      })
    // .addCase(fetchMrPlaces.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    // })
    // .addCase(fetchMrPlaces.fulfilled, (state, action) => {
    //   state.mrPlaces = action.payload;
    //   state.loading = false;
    // })
    // .addCase(fetchMrPlaces.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.error.message || 'Failed to fetch places';
    // });
  },
});

export const {
  setFilters,
  setSettings,
  setPlacesWithGooglePlaces,
  setMrPlacesWithGooglePlaces,
  addMrPlaceWithGooglePlace,
  addMrRestaurantReview,
} = memorapperSlice.actions;

export default memorapperSlice.reducer;