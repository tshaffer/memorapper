import { PlaceType, RestaurantType } from "./enums";
import { GoogleGeometry } from "./googlePlace";

export type MrPlaceWithGooglePlace = {
  _id?: string;
  googlePlaceId: string;
  placeType: PlaceType;
  interestLevel?: number;
  placePreview?: string;
  placeReview?: string;
  placeRating?: number;
  googlePlace?: GooglePlace;
  restaurantSpecs?: MrRestaurant;
  restaurantReviews: MrRestaurantReview[];
};

export interface MrRestaurant {
  restaurantType?: RestaurantType;
  openForBreakfast?: boolean;
  openForLunch?: boolean;
  openForDinner?: boolean;
}

export interface MrRestaurantReview {
  _id?: string;
  dateOfVisit: string;
  itemReviews: MrItemOrdered[];
}

export interface MrReviewData extends MrRestaurantReview {
  place: MrPlaceWithGooglePlace | null;
}

export interface MrItemOrdered {
  itemName: string;
  rating: number;
  comments: string;
}

export type EditablePlace = {
  googlePlace: GooglePlace;
  placeReview: string;
}

export type MrDeleteReviewRequestBody = {
  placeId: string;
  reviewId: string;
};

export type MrSubmitPlaceRequestBody = {
  _id?: string;
  placeType?: PlaceType;
  interestLevel?: number;
  placePreview?: string;
  placeReview?: string;
  placeRating?: number;
  googlePlace?: GooglePlace;
  restaurantSpecs?: MrRestaurant;
  restaurantReviews: MrRestaurantReview[];
};

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
