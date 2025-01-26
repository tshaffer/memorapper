import { RestaurantType } from "./enums";
import { GooglePlace } from "./googlePlace";
import { Filters } from "./interfaces";
import { AddressComponent } from "./place";

export interface EditableNewRestaurant {
  googlePlace: GooglePlace;
  comments: string;
  interestLevel: number;
}

export interface SubmitNewRestaurantRequestBody {
  _id?: string;
  googlePlace: GooglePlace;
  newRestaurantId: string;
  diningGroupId: string;
  interestLevel: number;
  comments: string;
}

export interface Settings {
  filters: Filters;
}

export interface NewPlace {
  _id?: any;
  place: GooglePlace | null;
  comments: string;
  rating: number;
}

export interface ItemReview {
  item: string;
  review: string;
}

export interface PreviewRequestBody {
  reviewText: string;
  sessionId: string;
}

export interface ChatRequestBody {
  userInput: string;
  sessionId: string;
  reviewText: string;
}

export interface BasePlace {
  googlePlaceId: string;
  name: string;
  address_components?: AddressComponent[];
  formatted_address: string;
  website: string;
  opening_hours?: google.maps.places.PlaceOpeningHours;
  price_level?: number;
  vicinity?: string;
  restaurantType: RestaurantType;
}
