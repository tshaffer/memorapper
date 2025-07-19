// memorapperSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';
import { MrPlaceWithGooglePlace } from '../types';

// Base state selectors
export const selectMemorapperState = (state: RootState) => state.memorapper;

export const selectMrPlacesById = (state: RootState) => state.memorapper.mrPlacesById;
export const selectMrPlaceIds = (state: RootState) => state.memorapper.mrPlaceIds;

// All MrPlaceWithGooglePlace objects
export const selectMrPlaces = createSelector(
  selectMrPlacesById,
  selectMrPlaceIds,
  (placesById, ids) => ids.map(id => placesById[id])
);

export const selectMrPlacesWithVisited = createSelector(
  selectMrPlaces,
  (places): (MrPlaceWithGooglePlace & { visited: boolean })[] =>
    places.map((place) => ({
      ...place,
      visited: isPlaceVisited(place),
    }))
);

// Individual MrPlaceWithGooglePlace by ID
export const selectMrPlaceById = (placeId: string) =>
  (state: RootState) => state.memorapper.mrPlacesById[placeId];

// Determine if a place has been visited
const isPlaceVisited = (place: MrPlaceWithGooglePlace): boolean =>
  (typeof place.placeRating === 'number' && place.placeRating > 0) ||
  (place.placeReview?.trim() ?? '') !== '' ||
  (place.restaurantReviews?.length ?? 0) > 0;

// List of IDs for visited places
export const selectVisitedPlaceIds = createSelector(
  selectMrPlaces,
  (places) =>
    places
      .filter(isPlaceVisited)
      .map(p => p._id!)
      .filter(Boolean)
);

// Misc selectors
export const selectLoading = (state: RootState) => state.memorapper.loading;
export const selectError = (state: RootState) => state.memorapper.error;
export const selectRecentLocations = (state: RootState) => state.memorapper.recentLocations;
export const selectFilters = (state: RootState) => state.memorapper.settings.filters;
export const selectSettings = (state: RootState) => state.memorapper.settings;
export const selectCurrentMapLocation = (state: RootState) => state.memorapper.currentMapLocation;
