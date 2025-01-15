import { RestaurantType } from "./enums";
import { GooglePlace } from "./googlePlace";
import { AddressComponent } from "./place";

export interface DesiredRestaurant {
  _id?: string;
  googlePlaceId: string;
  interestLevel: number;
  comments: string;
}

export interface SubmitDesiredRestaurantRequestBody {
  _id?: string;
  googlePlace: GooglePlace;
  interestLevel: number;
  comments: string;
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
  restaurantType?: RestaurantType;
}

