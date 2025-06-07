import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';
import { MrPlace, MrPlaceWithGooglePlace } from '../types';

// Base selectors
export const selectMemorapperState = (state: RootState) => state.memorapper;

export const selectMrPlacesById = (state: RootState) => state.memorapper.mrPlacesById;
export const selectMrPlaceIds = (state: RootState) => state.memorapper.mrPlaceIds;
export const selectGooglePlacesById = (state: RootState) => state.memorapper.googlePlacesById;

// Select all MrPlaces in array form
export const selectMrPlaces = createSelector(
  selectMrPlacesById,
  selectMrPlaceIds,
  (mrPlacesById, ids) => ids.map(id => mrPlacesById[id])
);

// Select MrPlace by _id
export const selectMrPlaceById = (placeId: string) =>
  (state: RootState) => state.memorapper.mrPlacesById[placeId];

// Select GooglePlace by googlePlaceId
export const selectGooglePlaceById = (googlePlaceId: string) =>
  (state: RootState) => state.memorapper.googlePlacesById[googlePlaceId];

// Select MrPlaceWithGooglePlace-like object by _id
export const selectMrPlaceWithGooglePlace = (placeId: string) =>
  createSelector(
    selectMrPlaceById(placeId),
    selectGooglePlacesById,
    (place, googlePlacesById) => {
      if (!place) return undefined;
      const googlePlace = googlePlacesById[place.googlePlaceId];
      return {
        ...place,
        googlePlace,
      };
    }
  );

// Select all MrPlacesWithGooglePlace-like objects
export const selectAllMrPlacesWithGooglePlaces = createSelector(
  selectMrPlaces,
  selectGooglePlacesById,
  (mrPlaces, googlePlacesById): (MrPlaceWithGooglePlace & { visited: boolean })[] =>
    mrPlaces.map((place) => {
      const visited =
        (typeof place.placeRating === 'number' && place.placeRating > 0) ||
        (place.placeReview?.trim() ?? '') !== '' ||
        (place.restaurantReviews?.length ?? 0) > 0;

      return {
        ...place,
        googlePlace: googlePlacesById[place.googlePlaceId],
        visited,
      };
    })
);

export const selectVisitedPlaceIds = createSelector(
  (state: RootState) => state.memorapper.mrPlacesById,
  (mrPlacesById) =>
    Object.entries(mrPlacesById)
      .filter(([_, place]: [string, MrPlace]) =>
        (typeof place.placeRating === 'number' && place.placeRating > 0) ||
        (place.placeReview?.trim() ?? '') !== '' ||
        (place.restaurantReviews?.length ?? 0) > 0
      )
      .map(([id]) => id)
);

export const isPlaceVisited = (place: MrPlace): boolean =>
  (typeof place.placeRating === 'number' && place.placeRating > 0) ||
  (place.placeReview?.trim() ?? '') !== '' ||
  (place.restaurantReviews?.length ?? 0) > 0;

export const selectGooglePlaces = (state: RootState) =>
  Object.values(state.memorapper.googlePlacesById);

// Select loading and error states
export const selectLoading = (state: RootState) => state.memorapper.loading;
export const selectError = (state: RootState) => state.memorapper.error;

// Select current filters/settings
export const selectFilters = (state: RootState) => state.memorapper.settings.filters;
export const selectSettings = (state: RootState) => state.memorapper.settings;
