import { GooglePlace, MrPlaceWithGooglePlace, MrPlace } from '../types';

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
