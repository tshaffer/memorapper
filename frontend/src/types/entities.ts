import { RestaurantType } from "./enums";
import { AddressComponent, GooglePlace } from "./googlePlace";
import { Filters } from "./interfaces";

export interface Settings {
  filters: Filters;
}

export interface ItemReview {
  item: string;
  review: string;
}

export interface BasePlace {
  googlePlaceId: string;
  name: string;
  address_components?: AddressComponent[];
  formatted_address: string;
  website: string;
  opening_hours?: google.maps.places.PlaceOpeningHours;
  price_level?: number;
  rating?: number;
  vicinity?: string;
  restaurantType: RestaurantType;
}
