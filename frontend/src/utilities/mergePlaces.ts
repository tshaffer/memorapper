import { Place, GooglePlace, PlaceWithGooglePlace, MrPlaceWithGooglePlace, MrPlace } from '../types';

export const mergePlacesWithGooglePlaces = (
  places: Place[],
  googlePlaces: GooglePlace[]
): PlaceWithGooglePlace[] => {
  return places.map((place) => {
    const googlePlace = googlePlaces.find((g) => g.googlePlaceId === place.googlePlaceId);
    return {
      ...place,
      googlePlace: googlePlace || undefined,
    };
  });
};

export const mergeMrPlacesWithGooglePlaces = (
  places: MrPlace[],
  googlePlaces: GooglePlace[]
): MrPlaceWithGooglePlace[] => {
  return places.map((place) => {
    const googlePlace = googlePlaces.find((g) => g.googlePlaceId === place.googlePlaceId);
    return {
      ...place,
      googlePlace: googlePlace || undefined,
    };
  });
};
