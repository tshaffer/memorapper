import { PlaceType, RestaurantType } from "./enums";
import { AddressComponent, GooglePlace } from "./googlePlace";

export interface ItemReview {
  item: string;
  review: string;
}

export interface BasePlace {
  googlePlaceId: string;
  placeType?: PlaceType;
  name: string;
  address_components?: AddressComponent[];
  formatted_address: string;
  website: string;
  opening_hours?: google.maps.places.PlaceOpeningHours;
  price_level?: number;
  rating?: number;
  user_ratings_total?: number;
  utc_offset_minutes?: number;
  vicinity?: string;
  restaurantType?: RestaurantType;
}

