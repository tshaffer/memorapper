// frontend/node_modules/@types/google.maps/index.d.ts
// https://developers.google.com/maps/documentation/places/web-service/supported_types

import { PlaceType, RestaurantType } from "./enums";
import { GoogleGeometry } from "./googlePlace";

export interface Restaurant {
  restaurantType?: RestaurantType;
  openForBreakfast?: boolean;
  openForLunch?: boolean;
  openForDinner?: boolean;
  consensusComments?: string;
  perUserComments?: UserComment[];
  restaurantReviews?: RestaurantReview[];
}

export type Place = {
  _idPlace?: string;
  placeId: string;
  visited: boolean;
  placeType?: PlaceType;
  googlePlaceId: string;
  placeComments?: string;
} & Restaurant;

export type PlaceWithGooglePlace = {
  _idPlace?: string;
  placeId: string;
  visited: boolean;
  placeType?: PlaceType;
  googlePlaceId?: string;
  placeComments?: string;
} & NewGooglePlace & Restaurant;

export type SubmitPlaceRequestBody = {
  _idPlace?: string;
  placeId: string;
  visited: boolean;
  placeType?: PlaceType;
  googlePlaceId: string;
  placeComments?: string;
} & NewGooglePlace & Restaurant;

// subset of fields from google.maps.places.PlaceResult
export interface NewGooglePlace {
  address_components?: google.maps.GeocoderAddressComponent[];
  formatted_address?: string;
  geometry?: GoogleGeometry;
  name?: string;
  opening_hours?: google.maps.places.PlaceOpeningHours;
  googlePlaceId?: string;
  rating?: number;
  price_level?: number;
  user_ratings_total?: number;
  utc_offset_minutes?: number;
  vicinity?: string;
  website?: string;
}

// other fields from google.maps.places.PlaceResult that I may want to add
// adr_address?: string;
// formatted_phone_number?: string;
// geometry?: google.maps.places.PlaceGeometry;
// icon?: string;
// icon_background_color?: string;
// icon_mask_base_uri?: string;
// international_phone_number?: string;
// photos?: google.maps.places.PlacePhoto[];
// url?: string;

// User interface
export interface User {
  _idUser?: string;
  name: string;
}

// Per-user comment interface (for comments attached directly to the restaurant rather than a full review)
export interface UserComment {
  _idUserComment?: string;
  user: User;
  userComment: string;
}

// A restaurant review aggregates a user's feedback, rating, and the details of items ordered.
export interface RestaurantReview {
  _idRestaurantReview?: string;
  user: User;
  restaurantReviewComments: string;
  rating: number;
  date: Date;
  // List of items ordered during this review—this can be empty or undefined if not applicable.
  itemsOrdered?: ItemOrdered[];
}

// The details of an individual item ordered, which can include its own rating or comments.
export interface ItemOrdered {
  _idItemOrdered?: string;
  name: string;
  itemOrderedComments?: string;
  rating?: number;
}
