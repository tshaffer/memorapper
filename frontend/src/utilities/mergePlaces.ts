import { Place, GooglePlace, PlaceWithGooglePlace } from '../types';

export const mergePlacesWithGooglePlaces = (
  places: Place[],
  googlePlaces: GooglePlace[]
): PlaceWithGooglePlace[] => {
  return [];
  // return places.map((place) => {
  //   const googlePlace = googlePlaces.find((g) => g.googlePlaceId === place.googlePlaceId);
  //   return {
  //     ...place,
  //     googlePlace: googlePlace || undefined,
  //   };
  // });
};
