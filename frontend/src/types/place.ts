// frontend/node_modules/@types/google.maps/index.d.ts
// https://developers.google.com/maps/documentation/places/web-service/supported_types

import { GoogleGeometry } from "./googlePlace";


export interface GooglePlace {
  googlePlaceId: string;
  address_components?: google.maps.GeocoderAddressComponent[];
  formatted_address?: string;
  geometry?: GoogleGeometry;
  name?: string;
  opening_hours?: google.maps.places.PlaceOpeningHours;
  place_id?: string;
  price_level?: number;
  rating?: number;
  user_ratings_total?: number;
  utc_offset_minutes?: number;
  vicinity?: string;
  website: string;
}

